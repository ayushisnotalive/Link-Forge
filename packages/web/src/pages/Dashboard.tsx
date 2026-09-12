import { useLinks } from "../hooks/useLinks";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkCard from "../components/LinkCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { data: links, isLoading, error } = useLinks();
  const { logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your links</h1>
        <button onClick={logout} className="text-sm text-gray-500 underline">
          Log out
        </button>
      </div>
      <CreateLinkForm />
      {isLoading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">Failed to load links</p>}
      {links && links.length === 0 && <p className="text-gray-500">No links yet — create one above.</p>}
      <div className="space-y-3">
        {links?.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
}