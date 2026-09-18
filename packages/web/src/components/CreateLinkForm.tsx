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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black p-2 pl-4 transition-all duration-300 focus-within:border-orange-500/80 focus-within:ring-2 focus-within:ring-orange-500/20">
        <span className="font-mono text-xs font-semibold text-orange-500">forge&gt;</span>
        <input
          type="url"
          placeholder="https://example.com/your-very-long-url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          className="flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-zinc-600"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)] transition-all hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40"
        >
          {isPending ? "forging…" : "shorten"}
        </button>
      </div>
      {error && <p className="mt-2.5 text-xs text-red-500">{error}</p>}
    </form>
  );
}
