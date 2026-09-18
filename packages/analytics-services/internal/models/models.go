package models

import "time"

type ClickEvent struct {
	ShortLinkID string    `json:"shortLinkId"`
	ClickedAt   time.Time `json:"clickedAt"`
	IPAddress   *string   `json:"ipAddress,omitempty"`
	UserAgent   *string   `json:"userAgent,omitempty"`
	Referrer    *string   `json:"referrer,omitempty"`
	Country     *string   `json:"country,omitempty"`
	DeviceType  *string   `json:"deviceType,omitempty"`
}

type AnalyticsStats struct {
	TotalClicks     int                    `json:"totalClicks"`
	TimeSeries      []TimeSeriesData       `json:"timeSeries"`
	TopReferrers    []ReferrerStats        `json:"topReferrers"`
	DeviceBreakdown []DeviceBreakdownStats `json:"deviceBreakdown"`
}

type TimeSeriesData struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type ReferrerStats struct {
	Referrer string `json:"referrer"`
	Count    int    `json:"count"`
}

type DeviceBreakdownStats struct {
	DeviceType string `json:"deviceType"`
	Count      int    `json:"count"`
}
