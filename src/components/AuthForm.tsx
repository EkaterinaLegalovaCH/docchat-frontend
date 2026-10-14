import { FormEvent, useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { authClient, isAuthConfigured } from "../services/auth";

function readableAuthError(error: AuthError): string {
  if (error.message.toLowerCase().includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  return error.message;
}

export function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const result = mode === "sign-in"
        ? await authClient.auth.signInWithPassword({ email, password })
        : await authClient.auth.signUp({ email, password });

      if (result.error) throw result.error;
      if (mode === "sign-up" && !result.data.session) {
        setMessage("Account created. Check your email to confirm your address, then sign in.");
      }
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? readableAuthError(err as AuthError)
        : "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card card" aria-labelledby="auth-title">
        <h1 id="auth-title">{mode === "sign-in" ? "Sign in to DocChat" : "Create your DocChat account"}</h1>
        <p className="auth-intro">Use your account to keep documents private.</p>
        {!isAuthConfigured && (
          <p className="error-msg">Authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.</p>
        )}
        <form className="auth-form" onSubmit={submit}>
          <label>
            Email
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={!isAuthConfigured || submitting} />
          </label>
          <label>
            Password
            <input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!isAuthConfigured || submitting} />
          </label>
          {error && <p className="error-msg" role="alert">{error}</p>}
          {message && <p className="success-msg" role="status">{message}</p>}
          <button className="btn-submit auth-submit" type="submit" disabled={!isAuthConfigured || submitting}>
            {submitting ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null); setMessage(null); }}>
          {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
