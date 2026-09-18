package service

import (
	"context"
	"log"
	"time"

	"analytics-services/internal/models"
	"analytics-services/internal/repository"
)

import "sync"

type AnalyticsService interface {
	QueueClickEvent(event models.ClickEvent)
	GetAnalytics(ctx context.Context, shortCode, userID string) (*models.AnalyticsStats, error)
	StartWorker(ctx context.Context, wg *sync.WaitGroup)
	Close()
}

type analyticsService struct {
	repo       repository.AnalyticsRepository
	eventsChan chan models.ClickEvent
	batchSize  int
}

func NewAnalyticsService(repo repository.AnalyticsRepository) AnalyticsService {
	return &analyticsService{
		repo:       repo,
		eventsChan: make(chan models.ClickEvent, 10000), // Buffered channel
		batchSize:  100,
	}
}

func (s *analyticsService) Close() {
	close(s.eventsChan)
}

func (s *analyticsService) QueueClickEvent(event models.ClickEvent) {
	// Recover from sending on a closed channel gracefully
	defer func() {
		if r := recover(); r != nil {
			log.Println("Attempted to queue event on closed channel")
		}
	}()

	select {
	case s.eventsChan <- event:
		// Successfully queued
	default:
		// Channel is full, drop event or handle accordingly. For now, logging.
		log.Println("events channel is full, dropping click event")
	}
}

func (s *analyticsService) StartWorker(ctx context.Context, wg *sync.WaitGroup) {
	defer wg.Done()
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	var batch []models.ClickEvent

	for {
		select {
		case <-ctx.Done():
			// Context canceled, drain channel
			for event := range s.eventsChan {
				batch = append(batch, event)
				if len(batch) >= s.batchSize {
					s.flush(context.Background(), batch)
					batch = nil
				}
			}
			// Flush anything remaining
			s.flush(context.Background(), batch)
			return
		case event, ok := <-s.eventsChan:
			if !ok {
				// Channel closed, drain complete
				s.flush(context.Background(), batch)
				return
			}
			batch = append(batch, event)
			if len(batch) >= s.batchSize {
				s.flush(ctx, batch)
				batch = nil
			}
		case <-ticker.C:
			if len(batch) > 0 {
				s.flush(ctx, batch)
				batch = nil
			}
		}
	}
}

func (s *analyticsService) flush(ctx context.Context, batch []models.ClickEvent) {
	if len(batch) == 0 {
		return
	}
	err := s.repo.BatchInsertClickEvents(ctx, batch)
	if err != nil {
		log.Printf("Failed to batch insert click events: %v\n", err)
	}
}

func (s *analyticsService) GetAnalytics(ctx context.Context, shortCode, userID string) (*models.AnalyticsStats, error) {
	linkID, err := s.repo.GetLinkIDByCode(ctx, shortCode)
	if err != nil {
		return nil, err
	}

	isOwner, err := s.repo.VerifyLinkOwner(ctx, linkID, userID)
	if err != nil || !isOwner {
		return nil, err // Unauthorized or not found
	}

	stats := &models.AnalyticsStats{}

	stats.TotalClicks, _ = s.repo.GetTotalClicks(ctx, linkID)
	stats.TimeSeries, _ = s.repo.GetTimeSeriesData(ctx, linkID)
	stats.TopReferrers, _ = s.repo.GetTopReferrers(ctx, linkID)
	stats.DeviceBreakdown, _ = s.repo.GetDeviceBreakdown(ctx, linkID)

	return stats, nil
}
