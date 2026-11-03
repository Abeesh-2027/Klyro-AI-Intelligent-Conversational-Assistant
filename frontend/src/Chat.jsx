import { useEffect, useRef, useState } from "react";

import { api } from "./api";
import Composer from "./Composer";
import Message from "./Message";
import Navbar from "./Navbar";
import Personalize from "./Personalize";
import Sidebar from "./Sidebar";
import "./App.css";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const FILE_TYPES = [".txt", ".md", ".csv", ".json", ".pdf"];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function Chat({ userName, onLogout }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState("");
  const [showPersonalize, setShowPersonalize] = useState(false);

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const requestIdRef = useRef(0);

  const hasConversation = activeChatId !== null || messages.length > 0;

  useEffect(() => {
    Promise.all([api.me(), api.listChats()])
      .then(([me, list]) => {
        setModel(me.model);
        setChats(list);
      })
      .catch((error) => setNotice(error.message));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const resetView = () => {
    requestIdRef.current += 1;
    setLoading(false);
    setMessage("");
    setAttachment(null);
    setNotice("");
  };

  const startNewChat = () => {
    resetView();
    setActiveChatId(null);
    setMessages([]);
  };

  const selectChat = async (chat) => {
    resetView();
    setActiveChatId(chat.id);
    setMessages([]);
    const current = requestIdRef.current;

    try {
      const full = await api.getChat(chat.id);
      if (requestIdRef.current === current) setMessages(full.messages);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const changeChat = async (id, changes) => {
    try {
      const updated = await api.updateChat(id, changes);
      setChats((previous) => previous.map((chat) => (chat.id === id ? { ...chat, ...updated } : chat)));
    } catch (error) {
      setNotice(error.message);
    }
  };

  const deleteChat = async (id) => {
    try {
      await api.deleteChat(id);
      setChats((previous) => previous.filter((chat) => chat.id !== id));
      if (activeChatId === id) startNewChat();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = message.trim();
    if ((!text && !attachment) || loading) return;

    const file = attachment;
    const content = text || "Please help me with the attached file.";
    const pending = { id: makeId(), role: "user", content, file_name: file?.name || null };

    setNotice("");
    setMessage("");
    setAttachment(null);
    setMessages((previous) => [...previous, pending]);
    setLoading(true);

    const current = ++requestIdRef.current;
    let uploaded = false;

    try {
      let chatId = activeChatId;

      if (!chatId) {
        const created = await api.createChat();
        chatId = created.id;
        setChats((previous) => [created, ...previous]);
        setActiveChatId(chatId);
      }

      if (file) {
        await api.uploadFile(chatId, file);
        uploaded = true;
      }

      const result = await api.sendMessage(chatId, content, file?.name);
      setChats((previous) =>
        previous.map((chat) => (chat.id === chatId ? { ...chat, title: result.title } : chat))
      );

      if (requestIdRef.current !== current) return;
      setMessages((previous) => [
        ...previous.filter((item) => item.id !== pending.id),
        result.user_message,
        result.assistant_message,
      ]);
    } catch (error) {
      if (requestIdRef.current !== current) return;
      setMessages((previous) => previous.filter((item) => item.id !== pending.id));
      setMessage(text);
      if (file && !uploaded) setAttachment(file);
      setNotice(error.message);
    } finally {
      if (requestIdRef.current === current) setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNotice("Speech recognition isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    setNotice("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setMessage(transcript.trim().slice(0, 4000));
    };

    recognition.onerror = (event) => {
      setNotice(
        event.error === "not-allowed"
          ? "Microphone permission was denied. Allow microphone access in your browser."
          : `Voice input stopped: ${event.error}.`
      );
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setNotice("Unable to start voice input. Please try again.");
      setListening(false);
    }
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!FILE_TYPES.includes(extension)) {
      setNotice("Unsupported file. Use .txt, .md, .csv, .json or .pdf.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setNotice("File is too large. The limit is 2 MB.");
      return;
    }

    setNotice("");
    setAttachment(file);
  };

  const handleLogout = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setListening(false);
    onLogout();
  };

  const composer = (
    <Composer
      message={message}
      setMessage={setMessage}
      onSubmit={sendMessage}
      toggleVoice={toggleVoice}
      listening={listening}
      loading={loading}
      attachment={attachment}
      setAttachment={setAttachment}
      fileInputRef={fileInputRef}
      handleFile={handleFile}
    />
  );

  return (
    <div className="app-layout">
      <Sidebar
        userName={userName}
        onLogout={handleLogout}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onTogglePin={(id) => changeChat(id, { pinned: !chats.find((chat) => chat.id === id)?.pinned })}
        onRenameChat={(id, title) => changeChat(id, { title })}
        onDeleteChat={deleteChat}
        onOpenPersonalize={() => setShowPersonalize(true)}
      />

      <main className="main-content">
        <Navbar modelName={model ? model.split("/").pop() : "Klyro AI"} />

        <section className={`chat-workspace ${hasConversation ? "has-messages" : ""}`}>
          {!hasConversation ? (
            <div className="welcome">
              <h1>What can I help with?</h1>
              <p>Klyro AI — your intelligent assistant</p>

              {composer}

              {notice && (
                <p className="voice-error" role="alert">
                  {notice}
                </p>
              )}
            </div>
          ) : (
            <div className="conversation">
              <div className="message-list">
                {messages.map((item) => (
                  <Message key={item.id} item={item} />
                ))}

                {loading && (
                  <div className="message-row assistant">
                    <div className="typing-bubble" aria-label="Klyro AI is thinking">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="composer-dock">
                {composer}
                {notice && (
                  <p className="voice-error" role="alert">
                    {notice}
                  </p>
                )}
                <p className="composer-note">Klyro AI can make mistakes. Check important information.</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {showPersonalize && <Personalize onClose={() => setShowPersonalize(false)} />}
    </div>
  );
}
