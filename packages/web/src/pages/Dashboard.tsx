import { useLinks } from "../hooks/useLinks";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkCard from "../components/LinkCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { data: links, isLoading, error } = useLinks();
  const { logout } = useAuth();

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <h1 className="text-2xl font-semibold text-gradient">Dashboard</h1>
        <button onClick={() => logout()} className="btn btn-ghost">
          Log Out
        </button>
      </div>

      <CreateLinkForm />

      <div className="mt-8">
        <h2 className="text-xl font-medium mb-6">Your Forged Links</h2>
        
        {isLoading && (
          <div className="text-center py-12 animate-pulse">
            <p className="text-muted">Loading your links...</p>
          </div>
        )}
        
        {error && (
          <div className="glass-panel text-center py-8" style={{ border: '1px solid var(--accent-danger)' }}>
            <p className="text-danger">Couldn't load your links. Try refreshing.</p>
          </div>
        )}
        
        {links && links.length === 0 && (
          <div className="glass-panel text-center py-12 animate-fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-tertiary)', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🔗</span>
            </div>
            <h3 className="text-lg font-medium mb-2">No links yet</h3>
            <p className="text-muted">Create your first short link using the forge above.</p>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {links?.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}