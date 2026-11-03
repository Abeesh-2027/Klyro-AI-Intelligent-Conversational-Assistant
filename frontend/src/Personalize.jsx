import { useEffect, useState } from "react";
import { FiSliders } from "react-icons/fi";

import { api } from "./api";

export default function Personalize({ onClose }) {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProfile()
      .then((profile) => setText(profile.instructions))
      .catch((failure) => setError(failure.message))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.saveProfile(text.trim());
      onClose();
    } catch (failure) {
      setError(failure.message);
      setSaving(false);
    }
  };

  return (
    <div
      className="logout-confirm-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className="logout-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="personalize-title" onSubmit={save}>
        <div className="logout-confirm-icon personalize-icon">
          <FiSliders size={24} />
        </div>

        <h2 id="personalize-title">Personalize Klyro AI</h2>
        <p>Tell Klyro how you like answers. For example: keep it short, explain like I am a beginner.</p>

        <textarea
          className="dialog-textarea"
          aria-label="Your preferences"
          value={text}
          maxLength={500}
          rows={5}
          disabled={!loaded || saving}
          onChange={(event) => setText(event.target.value)}
        />
        <span className="dialog-count">{text.length}/500</span>

        {error && (
          <p className="voice-error" role="alert">
            {error}
          </p>
        )}

        <div className="logout-confirm-actions">
          <button type="button" className="logout-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="logout-confirm-btn personalize-save" disabled={!loaded || saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
