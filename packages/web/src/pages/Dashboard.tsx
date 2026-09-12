import { useLinks } from "../hooks/useLinks";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkCard from "../components/LinkCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { data: links, isLoading, error } = useLinks();
  const { logout } = useAuth();

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold">Your links</h1>
        <button onClick={() => logout()} className="text-sm text-ink/50 hover:text-ink">
          Log out
        </button>
      </div>

      <CreateLinkForm />

      <div className="mt-10">
        {isLoading && <p className="text-sm text-ink/50">Loading your links…</p>}
        {error && <p className="text-sm text-rust">Couldn't load your links. Try refreshing.</p>}
        {links && links.length === 0 && (
          <p className="text-sm text-ink/50">Nothing here yet. Forge your first link above.</p>
        )}
        <div className="divide-y divide-line border-t border-line">
          {links?.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}