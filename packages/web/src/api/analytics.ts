import { getAccessToken, setAccessToken } from "../context/tokenStore";
import { refreshAccessToken } from "./auth";

// 1. Ensure the URL starts with https:// if protocol is missing
const rawUrl = import.meta.env.VITE_ANALYTICS_API_URL || "http://localhost:8080";
const formattedUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
  ? rawUrl
  : `https://${rawUrl}`;

// 2. Strip any accidental trailing slashes
const ANALYTICS_API_URL = formattedUrl.replace(/\/+$/, "");

export async function analyticsFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();

  // Normalize path to ensure leading slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const doFetch = (bearer: string | null) =>
    fetch(`${ANALYTICS_API_URL}${cleanPath}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...options.headers,
      },
      credentials: "omit",
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
  // Ensure 'code' is strictly the short code and not a full path/URL
  const cleanCode = code ? code.split("/").filter(Boolean).pop() : "";

  const response = await analyticsFetch(`/api/v1/analytics/${cleanCode}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }
  return response.json();
}