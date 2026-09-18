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
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || "No data available."}</p>
        <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Analytics for /{code}</h1>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <MousePointerClick className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</p>
              <p className="text-2xl font-bold">{data.totalClicks}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Series */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <CalendarDays className="h-5 w-5 mr-2 text-gray-400" />
              Clicks Over Time
            </h2>
            {data.timeSeries && data.timeSeries.length > 0 ? (
              <div className="space-y-3">
                {data.timeSeries.map((ts, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{ts.date}</span>
                    <span className="text-sm font-medium">{ts.count} clicks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No time series data available.</p>
            )}
          </div>

          <div className="space-y-6">
            {/* Referrers */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center mb-4">
                <Globe className="h-5 w-5 mr-2 text-gray-400" />
                Top Referrers
              </h2>
              {data.topReferrers && data.topReferrers.length > 0 ? (
                <ul className="space-y-3">
                  {data.topReferrers.map((ref, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate w-3/4" title={ref.referrer}>
                        {ref.referrer || "Direct"}
                      </span>
                      <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {ref.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No referrer data available.</p>
              )}
            </div>

            {/* Device Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center mb-4">
                <Smartphone className="h-5 w-5 mr-2 text-gray-400" />
                Device Breakdown
              </h2>
              {data.deviceBreakdown && data.deviceBreakdown.length > 0 ? (
                <ul className="space-y-3">
                  {data.deviceBreakdown.map((dev, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{dev.deviceType || "Unknown"}</span>
                      <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {dev.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No device data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
