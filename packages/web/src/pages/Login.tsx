import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login: setAuthToken } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const token = await login(email, password);
      setAuthToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-900 bg-black p-8 shadow-[0_0_50px_-15px_rgba(0,0,0,0.9)]">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#F97316]" />
            <h1 className="text-lg font-bold tracking-tight text-white">Log in to LinkForge</h1>
          </div>
          {error && <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-black px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-black px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-3px_rgba(249,115,22,0.4)] transition-all hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40"
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
          <p className="mt-5 text-center text-xs text-zinc-500">
            No account? <Link to="/signup" className="font-medium text-orange-500 transition-colors hover:text-orange-400">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
