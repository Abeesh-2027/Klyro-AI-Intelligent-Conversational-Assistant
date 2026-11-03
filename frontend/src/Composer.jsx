import { FiMic, FiPaperclip, FiPlus, FiSend, FiSquare, FiX } from "react-icons/fi";

export default function Composer({
  message,
  setMessage,
  onSubmit,
  toggleVoice,
  listening,
  loading,
  attachment,
  setAttachment,
  fileInputRef,
  handleFile,
}) {
  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      {attachment && (
        <div className="attachment-chip">
          <FiPaperclip size={15} />
          <span>{attachment.name}</span>
          <button type="button" onClick={() => setAttachment(null)} aria-label="Remove attachment">
            <FiX size={15} />
          </button>
        </div>
      )}

      <input
        type="text"
        className="composer-input"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Message Klyro AI..."
        aria-label="Message Klyro AI"
        maxLength={4000}
      />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden-file-input"
        accept=".txt,.md,.csv,.json,.pdf"
        onChange={handleFile}
      />

      <div className="composer-actions">
        <button
          type="button"
          className="composer-icon attach-button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach a file"
          title="Attach a file (txt, md, csv, json, pdf)"
        >
          <FiPlus size={21} />
        </button>

        <div className="composer-right-actions">
          {listening ? (
            <button
              type="button"
              className="composer-icon voice-stop"
              onClick={toggleVoice}
              aria-label="Stop voice input"
              title="Stop listening"
            >
              <FiSquare size={17} />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              className="composer-icon voice-button"
              onClick={toggleVoice}
              aria-label="Start voice input"
              title="Voice input"
            >
              <FiMic size={19} />
            </button>
          )}

          <button
            type="submit"
            className="composer-icon send-button"
            disabled={loading || (!message.trim() && !attachment)}
            aria-label="Send message"
            title="Send message"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
