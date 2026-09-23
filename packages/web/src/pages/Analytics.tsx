import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnalytics } from "../api/analytics";
import { ArrowLeft, Loader2, MousePointerClick, Smartphone, Globe, CalendarDays } from "lucide-react";

interface TimeSeriesData {
  date: string;
  count: number;
}

interface ReferrerStats {
  referrer: string;
  count: number;
}

interface DeviceBreakdownStats {
  deviceType: string;
  count: number;
}

interface AnalyticsStats {
  totalClicks: number;
  timeSeries: TimeSeriesData[];
  topReferrers: ReferrerStats[];
  deviceBreakdown: DeviceBreakdownStats[];
}

export function Analytics() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await getAnalytics(code);
        setData(stats);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-danger mb-4">{error || "No data available."}</p>
        <Link to="/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="btn btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-semibold text-gradient">Analytics for /{code}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--accent-primary-glow)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            <MousePointerClick size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <p className="text-sm text-muted">Total Clicks</p>
            <p className="text-2xl font-bold">{data.totalClicks}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h2 className="text-lg font-semibold flex items-center mb-4 gap-2">
            <CalendarDays size={20} className="text-muted" />
            Clicks Over Time
          </h2>
          {data.timeSeries && data.timeSeries.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.timeSeries.map((ts, idx) => (
                <div key={idx} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: idx !== data.timeSeries.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <span className="text-sm text-muted">{ts.date}</span>
                  <span className="text-sm font-medium">{ts.count} clicks</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No time series data available.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 className="text-lg font-semibold flex items-center mb-4 gap-2">
            <Globe size={20} className="text-muted" />
            Top Referrers
          </h2>
          {data.topReferrers && data.topReferrers.length > 0 ? (
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
              {data.topReferrers.map((ref, idx) => (
                <li key={idx} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: idx !== data.topReferrers.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <span className="text-sm text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%' }} title={ref.referrer}>
                    {ref.referrer || "Direct"}
                  </span>
                  <span className="text-sm font-medium" style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>
                    {ref.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No referrer data available.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 className="text-lg font-semibold flex items-center mb-4 gap-2">
            <Smartphone size={20} className="text-muted" />
            Device Breakdown
          </h2>
          {data.deviceBreakdown && data.deviceBreakdown.length > 0 ? (
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
              {data.deviceBreakdown.map((dev, idx) => (
                <li key={idx} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: idx !== data.deviceBreakdown.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <span className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>
                    {dev.deviceType || "Unknown"}
                  </span>
                  <span className="text-sm font-medium" style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>
                    {dev.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No device data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
