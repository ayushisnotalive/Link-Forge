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
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <input
        type="url"
        placeholder="https://example.com/your-long-url"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        required
        className="flex-1 rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Shorten"}
      </button>
      {error && <p className="self-center text-sm text-red-600">{error}</p>}
    </form>
  );
}