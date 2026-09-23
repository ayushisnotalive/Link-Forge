import type { ShortLink } from "../api/links";
import { useToggleLink, useDeleteLink } from "../hooks/useLinks";
import { Link } from "react-router-dom";
import { BarChart2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function LinkCard({ link }: { link: ShortLink }) {
  const toggleLink = useToggleLink();
  const deleteLink = useDeleteLink();

  const shortUrl = `${API_URL}/${link.shortCode}`;
  const daysLeft = link.expiresAt
    ? Math.max(0, Math.ceil((new Date(link.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="glass-panel glass-panel-hover animate-slide-up" style={{ padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="text-gradient"
          style={{ display: 'block', fontSize: '1.125rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}
        >
          {link.shortCode}
        </a>
        <p className="text-muted text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
          {link.longUrl}
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span style={{ 
            color: link.isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500
          }}>
            <span style={{ 
              display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', 
              backgroundColor: link.isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              boxShadow: link.isActive ? '0 0 8px var(--accent-primary-glow)' : 'none'
            }}></span>
            {link.isActive ? "Active" : "Disabled"}
          </span>
          {daysLeft !== null && <span className="text-tertiary">Expires in {daysLeft}d</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleLink.mutate({ id: link.id, isActive: !link.isActive })}
          className="btn btn-secondary"
          style={{ padding: '8px 12px' }}
        >
          {link.isActive ? "Disable" : "Enable"}
        </button>
        <button
          onClick={() => deleteLink.mutate(link.id)}
          className="btn btn-ghost text-danger"
          style={{ padding: '8px 12px' }}
        >
          Delete
        </button>
        <Link
          to={`/dashboard/analytics/${link.shortCode}`}
          className="btn btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-secondary)', padding: '8px 12px', textDecoration: 'none' }}
          title="View Analytics"
        >
          <BarChart2 size={16} /> Stats
        </Link>
      </div>
    </div>
  );
}