import { getAccessToken, setAccessToken } from "../context/tokenStore";
import { refreshAccessToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();

  const doFetch = (bearer: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...options.headers,
      },
      credentials: "include",
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