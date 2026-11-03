import { useEffect, useState } from "react";

import Chat from "./Chat";
import Login from "./Login";
import { supabase } from "./supabaseClient";
import "./Login.css";

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h2>Setup needed</h2>
          <p className="login-subtitle">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the frontend environment, then restart.
          </p>
        </section>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="login-page">
        <p className="login-subtitle">Loading...</p>
      </main>
    );
  }

  if (!session) return <Login />;

  const profile = session.user.user_metadata || {};
  const name = profile.full_name || profile.name || session.user.email || "User";

  return (
    <Chat
      key={session.user.id}
      userName={name}
      onLogout={() => supabase.auth.signOut({ scope: "local" })}
    />
  );
}
