import type { ShortLink } from "../api/links";
import { useToggleLink, useDeleteLink } from "../hooks/useLinks";

const API_URL = import.meta.env.VITE_API_URL;

export default function LinkCard({ link }: { link: ShortLink }) {
  const toggleLink = useToggleLink();
  const deleteLink = useDeleteLink();

  const shortUrl = `${API_URL}/${link.shortCode}`;
  const daysLeft = link.expiresAt
    ? Math.max(0, Math.ceil((new Date(link.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="flex items-center justify-between rounded border p-4">
      <div className="min-w-0">
        <a href={shortUrl} target="_blank" rel="noreferrer" className="block truncate font-medium text-blue-600">
          {shortUrl}
        </a>
        <p className="truncate text-sm text-gray-500">{link.longUrl}</p>
        {daysLeft !== null && (
          <p className="text-xs text-gray-400">expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => toggleLink.mutate({ id: link.id, isActive: !link.isActive })}
          className="rounded border px-3 py-1 text-sm"
        >
          {link.isActive ? "Disable" : "Enable"}
        </button>
        <button
          onClick={() => deleteLink.mutate(link.id)}
          className="rounded border border-red-300 px-3 py-1 text-sm text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}