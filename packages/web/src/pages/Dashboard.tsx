import { useLinks } from "../hooks/useLinks";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkCard from "../components/LinkCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { data: links, isLoading, error } = useLinks();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="mb-8 flex items-center justify-between border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#F97316]" />
            <h1 className="text-xl font-bold tracking-tight text-white">LinkForge</h1>
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-400">
              dashboard
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-lg border border-zinc-800 bg-black px-3.5 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:text-white"
          >
            Log out
          </button>
        </div>

        <CreateLinkForm />

        <div className="mt-10">
          {isLoading && (
            <div className="flex items-center gap-2 py-8 text-sm text-zinc-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              Loading your links…
            </div>
          )}
          {error && <p className="py-4 text-sm text-red-500">Couldn't load your links. Try refreshing.</p>}
          {links && links.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-900 bg-black py-12 text-center">
              <p className="text-sm text-zinc-400">Nothing here yet. Forge your first link above.</p>
            </div>
          )}
          <div className="space-y-3">
            {links?.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
