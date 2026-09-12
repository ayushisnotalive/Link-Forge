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
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 border-b border-ink pb-3">
        <span className="font-mono text-sm text-ink/40">forge&gt;</span>
        <input
          type="url"
          placeholder="paste a long url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-ink/30"
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-sm font-medium text-accent hover:text-ink disabled:opacity-40"
        >
          {isPending ? "forging…" : "shorten"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rust">{error}</p>}
    </form>
  );
}