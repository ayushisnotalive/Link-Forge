package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"analytics-services/internal/models"
	"analytics-services/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

type AnalyticsHandler struct {
	svc       service.AnalyticsService
	jwtSecret string
	intSecret string
}

func NewAnalyticsHandler(svc service.AnalyticsService, jwtSecret, intSecret string) *AnalyticsHandler {
	return &AnalyticsHandler{
		svc:       svc,
		jwtSecret: jwtSecret,
		intSecret: intSecret,
	}
}

func (h *AnalyticsHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/track", h.TrackClick)
		r.Get("/analytics/{code}", h.GetAnalytics)
	})
}

func (h *AnalyticsHandler) TrackClick(w http.ResponseWriter, r *http.Request) {
	// Verify internal secret
	secret := r.Header.Get("X-Internal-Secret")
	if secret != h.intSecret || h.intSecret == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var event models.ClickEvent
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if event.ClickedAt.IsZero() {
		event.ClickedAt = time.Now()
	}

	// Fire and forget
	h.svc.QueueClickEvent(event)

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"status":"queued"}`))
}

func (h *AnalyticsHandler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	// Require Auth
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, http.ErrNotSupported
		}
		return []byte(h.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["userId"].(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	code := chi.URLParam(r, "code")
	if code == "" {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	stats, err := h.svc.GetAnalytics(r.Context(), code, userID)
	if err != nil || stats == nil {
		// Can't distinguish between not found and unauthorized from this simple check,
		// but typically we return 403 or 404. Let's return 404 for simplicity.
		http.Error(w, "Not found or unauthorized", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
