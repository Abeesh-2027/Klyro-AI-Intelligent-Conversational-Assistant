import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiPaperclip, FiVolume2, FiVolumeX } from "react-icons/fi";

function SafeLink({ node, ...props }) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}

function SpeakButton({ text }) {
  const [speaking, setSpeaking] = useState(false);

  if (!("speechSynthesis" in window)) return null;

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const spoken = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?'-]/gu, " "));
    spoken.onend = () => setSpeaking(false);
    spoken.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(spoken);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      className="speak-button"
      onClick={toggle}
      aria-label={speaking ? "Stop reading aloud" : "Read aloud"}
      title={speaking ? "Stop reading aloud" : "Read aloud"}
    >
      {speaking ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
    </button>
  );
}

export default function Message({ item }) {
  const isAssistant = item.role === "assistant";

  return (
    <article className={`message-row ${item.role}`}>
      <div className="message-bubble">
        {item.file_name && (
          <div className="message-file">
            <FiPaperclip size={15} />
            {item.file_name}
          </div>
        )}

        {isAssistant ? (
          <div className="message-text markdown">
            <ReactMarkdown components={{ a: SafeLink }} disallowedElements={["img"]}>
              {item.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="message-text">{item.content}</div>
        )}

        {isAssistant && <SpeakButton text={item.content} />}
      </div>
    </article>
  );
}
