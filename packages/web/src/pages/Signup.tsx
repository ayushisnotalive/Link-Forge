import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
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
      await signup(email, password);
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
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="mb-6 text-lg font-semibold">Sign up</h1>
        {error && <p className="mb-4 text-sm text-rust">{error}</p>}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full bg-ink py-2 text-sm text-paper disabled:opacity-40"
        >
          {isSubmitting ? "Creating account…" : "Sign up"}
        </button>
        <p className="mt-4 text-sm text-ink/50">
          Already have an account? <Link to="/login" className="text-accent">Log in</Link>
        </p>
      </form>
    </div>
  );
}