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
    <div
      className="flex items-center justify-between gap-4 py-4"
      style={{ animation: "rowIn 0.25s ease-out" }}
    >
      <div className="min-w-0">
        <a
        
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="block truncate font-mono text-sm text-accent hover:underline"
        >
          {link.shortCode}
        </a>
        <p className="truncate text-sm text-ink/50">{link.longUrl}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-ink/40">
          <span className={link.isActive ? "text-accent" : "text-ink/40"}>
            {link.isActive ? "active" : "disabled"}
          </span>
          {daysLeft !== null && <span>· expires in {daysLeft}d</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm">
        <button
          onClick={() => toggleLink.mutate({ id: link.id, isActive: !link.isActive })}
          className="text-ink/60 hover:text-ink"
        >
          {link.isActive ? "disable" : "enable"}
        </button>
        <button
          onClick={() => deleteLink.mutate(link.id)}
          className="text-rust/80 hover:text-rust"
        >
          delete
        </button>
      </div>
    </div>
  );
}