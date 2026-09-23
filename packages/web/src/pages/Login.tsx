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
    <div className="flex min-h-screen items-center justify-center animate-fade-in" style={{ padding: '0 24px' }}>
      <form onSubmit={handleSubmit} className="glass-panel glass-panel-hover" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="text-2xl font-semibold text-gradient mb-4">Welcome back</h1>
          <p className="text-sm text-muted">Sign in to your Link-Forge account</p>
        </div>
        
        {error && (
          <div className="text-danger text-sm text-center mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full mt-8"
          style={{ padding: '14px' }}
        >
          {isSubmitting ? "Authenticating..." : "Sign In"}
        </button>
        
        <p className="text-center text-sm text-muted mt-6">
          Don't have an account? <Link to="/signup" className="text-accent" style={{ textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
        </p>
      </form>
    </div>
  );
}