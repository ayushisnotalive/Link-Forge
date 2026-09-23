package repository

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"analytics-services/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AnalyticsRepository interface {
	BatchInsertClickEvents(ctx context.Context, events []models.ClickEvent) error
	GetTotalClicks(ctx context.Context, shortLinkID string) (int, error)
	GetTimeSeriesData(ctx context.Context, shortLinkID string) ([]models.TimeSeriesData, error)
	GetTopReferrers(ctx context.Context, shortLinkID string) ([]models.ReferrerStats, error)
	GetDeviceBreakdown(ctx context.Context, shortLinkID string) ([]models.DeviceBreakdownStats, error)
	VerifyLinkOwner(ctx context.Context, shortLinkID, userID string) (bool, error)
	GetLinkIDByCode(ctx context.Context, shortCode string) (string, error)
}

type postgresAnalyticsRepository struct {
	db *pgxpool.Pool
}

func NewPostgresAnalyticsRepository(db *pgxpool.Pool) AnalyticsRepository {
	return &postgresAnalyticsRepository{db: db}
}

func (r *postgresAnalyticsRepository) BatchInsertClickEvents(ctx context.Context, events []models.ClickEvent) error {
	if len(events) == 0 {
		return nil
	}

	// For simple batch insert without UPSERT/ON CONFLICT, we can use simple INSERT INTO VALUES ...
	var valueStrings []string
	var valueArgs []interface{}

	i := 1
	for _, event := range events {
		valueStrings = append(valueStrings, fmt.Sprintf("($%d::uuid, $%d, $%d, $%d, $%d, $%d, $%d)",
			i, i+1, i+2, i+3, i+4, i+5, i+6))

		valueArgs = append(valueArgs, event.ShortLinkID)
		valueArgs = append(valueArgs, event.ClickedAt)
		valueArgs = append(valueArgs, event.IPAddress)
		valueArgs = append(valueArgs, event.UserAgent)
		valueArgs = append(valueArgs, event.Referrer)
		valueArgs = append(valueArgs, event.Country)
		valueArgs = append(valueArgs, event.DeviceType)

		i += 7
	}

	stmt := fmt.Sprintf(`
		INSERT INTO click_events (short_link_id, clicked_at, ip_address, user_agent, referrer, country, device_type)
		VALUES %s`, strings.Join(valueStrings, ","))

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, stmt, valueArgs...)
	if err != nil {
		return fmt.Errorf("failed to execute batch insert: %w", err)
	}

	// We also need to update the daily aggregate.
	// In production we would do this async, or have a materialized view, or DB trigger.
	// For simplicity we will update click_aggregates_daily here too.

	// Create an aggregate map based on current batch.
	dailyCounts := make(map[string]map[time.Time]int)
	for _, event := range events {
		dateOnly := event.ClickedAt.Truncate(24 * time.Hour)
		if _, ok := dailyCounts[event.ShortLinkID]; !ok {
			dailyCounts[event.ShortLinkID] = make(map[time.Time]int)
		}
		dailyCounts[event.ShortLinkID][dateOnly]++
	}

	for linkID, counts := range dailyCounts {
		for date, count := range counts {
			_, err = tx.Exec(ctx, `
				INSERT INTO click_aggregates_daily (short_link_id, date, total_clicks)
				VALUES ($1::uuid, $2, $3)
				ON CONFLICT (short_link_id, date) DO UPDATE
				SET total_clicks = click_aggregates_daily.total_clicks + EXCLUDED.total_clicks
			`, linkID, date, count)
			if err != nil {
				return fmt.Errorf("failed to upsert click_aggregates_daily: %w", err)
			}
		}
	}

	err = tx.Commit(ctx)
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *postgresAnalyticsRepository) GetTotalClicks(ctx context.Context, shortLinkID string) (int, error) {
	var total int
	err := r.db.QueryRow(ctx, "SELECT COALESCE(SUM(total_clicks), 0) FROM click_aggregates_daily WHERE short_link_id = $1::uuid", shortLinkID).Scan(&total)
	if err != nil {
		return 0, err
	}
	return total, nil
}

func (r *postgresAnalyticsRepository) GetTimeSeriesData(ctx context.Context, shortLinkID string) ([]models.TimeSeriesData, error) {
	rows, err := r.db.Query(ctx, `
		SELECT TO_CHAR(date, 'YYYY-MM-DD'), total_clicks
		FROM click_aggregates_daily
		WHERE short_link_id = $1::uuid
		ORDER BY date ASC`, shortLinkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []models.TimeSeriesData
	for rows.Next() {
		var ts models.TimeSeriesData
		if err := rows.Scan(&ts.Date, &ts.Count); err != nil {
			return nil, err
		}
		data = append(data, ts)
	}
	return data, nil
}

func (r *postgresAnalyticsRepository) GetTopReferrers(ctx context.Context, shortLinkID string) ([]models.ReferrerStats, error) {
	rows, err := r.db.Query(ctx, `
		SELECT COALESCE(referrer, 'Direct'), COUNT(*) as count
		FROM click_events
		WHERE short_link_id = $1::uuid
		GROUP BY COALESCE(referrer, 'Direct')
		ORDER BY count DESC
		LIMIT 10`, shortLinkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []models.ReferrerStats
	for rows.Next() {
		var stat models.ReferrerStats
		if err := rows.Scan(&stat.Referrer, &stat.Count); err != nil {
			return nil, err
		}
		data = append(data, stat)
	}
	return data, nil
}

func (r *postgresAnalyticsRepository) GetDeviceBreakdown(ctx context.Context, shortLinkID string) ([]models.DeviceBreakdownStats, error) {
	rows, err := r.db.Query(ctx, `
		SELECT COALESCE(device_type, 'Unknown'), COUNT(*) as count
		FROM click_events
		WHERE short_link_id = $1::uuid
		GROUP BY COALESCE(device_type, 'Unknown')
		ORDER BY count DESC`, shortLinkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []models.DeviceBreakdownStats
	for rows.Next() {
		var stat models.DeviceBreakdownStats
		if err := rows.Scan(&stat.DeviceType, &stat.Count); err != nil {
			return nil, err
		}
		data = append(data, stat)
	}
	return data, nil
}

func (r *postgresAnalyticsRepository) VerifyLinkOwner(ctx context.Context, shortLinkID, userID string) (bool, error) {
	var count int
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM short_links WHERE id = $1::uuid AND user_id = $2::uuid", shortLinkID, userID).Scan(&count)
	if err != nil {
		log.Printf("VerifyLinkOwner error: %v\n", err)
		return false, err
	}
	return count > 0, nil
}

func (r *postgresAnalyticsRepository) GetLinkIDByCode(ctx context.Context, shortCode string) (string, error) {
	var id string
	err := r.db.QueryRow(ctx, "SELECT id::text FROM short_links WHERE short_code = $1", shortCode).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}
