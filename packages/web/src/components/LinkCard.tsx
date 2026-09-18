import { useState } from "react";
import type { ShortLink } from "../api/links";
import { useToggleLink, useDeleteLink } from "../hooks/useLinks";
import { Link } from "react-router-dom";
import { BarChart2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function LinkCard({ link }: { link: ShortLink }) {
  const toggleLink = useToggleLink();
  const deleteLink = useDeleteLink();
  const [now] = useState(() => Date.now());

  const baseUrl = API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const shortUrl = `${baseUrl}/${link.shortCode}`;
  const daysLeft = link.expiresAt
    ? Math.max(0, Math.ceil((new Date(link.expiresAt).getTime() - now) / 86_400_000))
    : null;

  return (
    <div
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-900 bg-black p-4 transition-all duration-300 hover:border-zinc-800 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.8)]"
      style={{ animation: "rowIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2.5">
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate font-mono text-sm font-semibold text-orange-500 transition-colors hover:text-orange-400 hover:underline"
          >
            /{link.shortCode}
          </a>
          <span
            className={
              link.isActive
                ? "inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-orange-400"
                : "inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500"
            }
          >
            {link.isActive ? "active" : "disabled"}
          </span>
          {daysLeft !== null && (
            <span className="text-[11px] text-zinc-500">expires in {daysLeft}d</span>
          )}
        </div>
        <p className="truncate font-mono text-xs text-zinc-400" title={link.longUrl}>
          {link.longUrl}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-xs">
        <button
          onClick={() => toggleLink.mutate({ id: link.id, isActive: !link.isActive })}
          className="rounded-lg border border-zinc-800 bg-black px-2.5 py-1.5 font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:text-white"
        >
          {link.isActive ? "disable" : "enable"}
        </button>
        <button
          onClick={() => deleteLink.mutate(link.id)}
          className="rounded-lg border border-zinc-800/80 bg-black px-2.5 py-1.5 font-medium text-red-500/80 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          delete
        </button>
        <Link
          to={`/dashboard/analytics/${link.shortCode}`}
          className="interactive-button flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1.5 font-medium text-orange-400 transition-all hover:border-orange-500/60 hover:bg-orange-500 hover:text-white"
          title="View Analytics"
        >
          <BarChart2 className="h-3.5 w-3.5" /> stats
        </Link>
      </div>
    </div>
  );
}