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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [code]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black p-4 text-center">
        <p className="mb-4 text-red-500">{error || "No data available."}</p>
        <Link to="/dashboard" className="flex items-center text-orange-500 hover:text-orange-400 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white md:p-12 selection:bg-orange-500 selection:text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-zinc-900 pb-5">
          <Link
            to="/dashboard"
            className="interactive-button rounded-lg border border-zinc-800 bg-black p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#F97316]" />
              <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
              <span className="font-mono text-sm font-semibold text-orange-500">/{code}</span>
            </div>
            <p className="text-xs text-zinc-500">Real-time click events and visitor metrics</p>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center space-x-4 rounded-xl border border-zinc-900 bg-black p-6 transition-all hover:border-zinc-800">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
              <MousePointerClick className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Total Clicks</p>
              <p className="text-3xl font-bold tracking-tight text-white">{data.totalClicks}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Time Series */}
          <div className="rounded-xl border border-zinc-900 bg-black p-6 lg:col-span-2">
            <h2 className="mb-5 flex items-center text-sm font-semibold text-white">
              <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
              Clicks Over Time
            </h2>
            {data.timeSeries && data.timeSeries.length > 0 ? (
              <div className="space-y-3">
                {data.timeSeries.map((ts, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                    <span className="font-mono text-xs text-zinc-400">{ts.date}</span>
                    <span className="font-mono text-xs font-semibold text-orange-400">{ts.count} clicks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No time series data available.</p>
            )}
          </div>

          <div className="space-y-6">
            {/* Referrers */}
            <div className="rounded-xl border border-zinc-900 bg-black p-6">
              <h2 className="mb-4 flex items-center text-sm font-semibold text-white">
                <Globe className="mr-2 h-4 w-4 text-orange-500" />
                Top Referrers
              </h2>
              {data.topReferrers && data.topReferrers.length > 0 ? (
                <ul className="space-y-2.5">
                  {data.topReferrers.map((ref, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="w-3/4 truncate text-xs text-zinc-400" title={ref.referrer}>
                        {ref.referrer || "Direct"}
                      </span>
                      <span className="rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-xs font-medium text-orange-400">
                        {ref.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-500">No referrer data available.</p>
              )}
            </div>

            {/* Device Breakdown */}
            <div className="rounded-xl border border-zinc-900 bg-black p-6">
              <h2 className="mb-4 flex items-center text-sm font-semibold text-white">
                <Smartphone className="mr-2 h-4 w-4 text-orange-500" />
                Device Breakdown
              </h2>
              {data.deviceBreakdown && data.deviceBreakdown.length > 0 ? (
                <ul className="space-y-2.5">
                  {data.deviceBreakdown.map((dev, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="text-xs capitalize text-zinc-400">{dev.deviceType || "Unknown"}</span>
                      <span className="rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-xs font-medium text-orange-400">
                        {dev.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-500">No device data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
