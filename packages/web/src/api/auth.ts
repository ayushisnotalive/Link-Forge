const API_URL = import.meta.env.VITE_API_URL;

export async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.accessToken as string;
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Signup failed");
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Login failed");
  }
  const data = await res.json();
  return data.accessToken as string;
}

export async function logoutRequest(): Promise<void> {
  await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}