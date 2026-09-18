import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchLinks } from "../api/links";

export default function RedirectPage() {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    // Check if code is a reserved client route
    if (["login", "signup", "dashboard"].includes(code)) return;

    fetchLinks()
      .then((links) => {
        const link = links.find((l) => l.shortCode === code);
        if (link && link.isActive) {
          window.location.replace(link.longUrl);
        } else if (link && !link.isActive) {
          setError("This short link is currently disabled.");
        } else {
          setError("Short link not found.");
        }
      })
      .catch(() => {
        setError("Unable to resolve link.");
      });
  }, [code]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white selection:bg-orange-500 selection:text-white">
      {error ? (
        <div className="max-w-md space-y-4 rounded-2xl border border-zinc-900 bg-black p-8 shadow-2xl">
          <span className="inline-flex h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_10px_#EF4444]" />
          <h1 className="text-lg font-bold text-white">{error}</h1>
          <p className="text-xs text-zinc-400">The link you followed may have expired, been disabled, or does not exist.</p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="interactive-button inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)] transition-all hover:bg-orange-600 active:bg-orange-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="font-mono text-sm text-zinc-400">Redirecting to link...</p>
        </div>
      )}
    </div>
  );
}
