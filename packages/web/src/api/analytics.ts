import { getAccessToken, setAccessToken } from "../context/tokenStore";
import { refreshAccessToken } from "./auth";

const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || "http://localhost:8080";

export async function analyticsFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();

  const doFetch = (bearer: string | null) =>
    fetch(`${ANALYTICS_API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...options.headers,
      },
      credentials: "omit", // Usually cross-origin JWT calls don't need cookies unless there are specific requirements
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAccessToken(newToken);
      res = await doFetch(newToken);
    }
  }

  return res;
}

export async function getAnalytics(code: string) {
  const response = await analyticsFetch(`/api/v1/analytics/${code}`);
  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }
  return response.json();
}
