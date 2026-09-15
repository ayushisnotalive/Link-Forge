import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import "../index.css"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <h1 className="login-title">Log in</h1>

        {error && (
          <p className="login-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <div className="login-fields">
          <div className="field">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={!!error}
              className="field-input"
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
                aria-invalid={!!error}
                className="field-input password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <div className="login-meta">
          <Link to="/forgot-password" className="link-muted">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting && <span className="spinner" aria-hidden="true" />}
          <span>{isSubmitting ? "Logging in…" : "Log in"}</span>
        </button>

        <p className="signup-prompt">
          No account?{" "}
          <Link to="/signup" className="link-accent">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}