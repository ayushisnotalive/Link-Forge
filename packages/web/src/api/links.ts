import { apiFetch } from "./apiFetch";

export interface ShortLink {
  id: string;
  shortCode: string;
  longUrl: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export async function fetchLinks(): Promise<ShortLink[]> {
  const res = await apiFetch("/api/links");
  if (!res.ok) throw new Error("Failed to fetch links");
  return res.json();
}

export async function createLink(longUrl: string): Promise<ShortLink> {
  const res = await apiFetch("/api/links", {
    method: "POST",
    body: JSON.stringify({ long_url: longUrl }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create link");
  }
  return res.json();
}

export async function toggleLinkActive(id: string, isActive: boolean): Promise<ShortLink> {
  const res = await apiFetch(`/api/links/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!res.ok) throw new Error("Failed to update link");
  return res.json();
}

export async function deleteLink(id: string): Promise<void> {
  const res = await apiFetch(`/api/links/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete link");
}