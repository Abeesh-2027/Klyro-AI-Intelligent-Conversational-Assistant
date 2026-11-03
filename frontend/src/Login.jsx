import { useState } from "react";
import { FiLogIn } from "react-icons/fi";

import { supabase } from "./supabaseClient";
import Logo from "./assets/Logo.png";
import "./Login.css";

export default function Login() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setBusy(true);
    setError("");

    const { error: failure } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (failure) {
      setError("Could not start Google sign-in. Please try again.");
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <img src={Logo} alt="Klyro AI logo" className="login-logo" />
          <h1>Klyro AI</h1>
        </div>

        <h2>Welcome back</h2>
        <p className="login-subtitle">Sign in with Google to start a conversation with Klyro AI.</p>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="button" className="login-button login-google" onClick={signInWithGoogle} disabled={busy}>
          <FiLogIn size={18} />
          <span>{busy ? "Redirecting..." : "Continue with Google"}</span>
        </button>
      </section>
    </main>
  );
}
