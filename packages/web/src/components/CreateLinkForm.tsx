import { useState } from "react";
import { useCreateLink } from "../hooks/useLinks";

export default function CreateLinkForm() {
  const [longUrl, setLongUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateLink();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    mutate(longUrl, {
      onSuccess: () => setLongUrl(""),
      onError: (err) => setError(err instanceof Error ? err.message : "Failed to create link"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up" style={{ marginBottom: '40px' }}>
      <div className="glass-panel" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          type="url"
          placeholder="Paste a long URL to forge..."
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          style={{ 
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            outline: 'none', 
            color: 'var(--text-primary)',
            padding: '12px',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
        >
          {isPending ? "Forging..." : "Shorten"}
        </button>
      </div>
      {error && <p className="text-danger text-sm mt-2" style={{ paddingLeft: '12px' }}>{error}</p>}
    </form>
  );
}