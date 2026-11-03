import { useEffect, useState } from "react";
import {
  FiMenu,
  FiPlus,
  FiMessageSquare,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiX,
  FiBookmark,
  FiSliders,
} from "react-icons/fi";

import Logo from "./assets/Logo.png";
import "./Sidebar.css";

export default function Sidebar({
  userName = "User",
  onLogout = () => {},
  chats = [],
  activeChatId = null,
  onNewChat,
  onSelectChat,
  onTogglePin,
  onRenameChat,
  onDeleteChat,
  onOpenPersonalize,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openChatMenuId, setOpenChatMenuId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setAccountMenuOpen(false);
        setOpenChatMenuId(null);
        setEditingChatId(null);
        setShowLogoutConfirm(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const createChat = () => {
    setIsOpen(false);
    setOpenChatMenuId(null);
    setEditingChatId(null);

    onNewChat?.();
  };

  const selectChat = (chat) => {
    setIsOpen(false);
    setOpenChatMenuId(null);
    setEditingChatId(null);

    onSelectChat?.(chat);
  };

  const togglePin = (chatId) => {
    onTogglePin?.(chatId);
    setOpenChatMenuId(null);
  };

  const startRename = (chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
    setOpenChatMenuId(null);
  };

  const saveRename = (event) => {
    event.preventDefault();

    const title = editingTitle.trim();

    if (!title) return;

    onRenameChat?.(editingChatId, title);

    setEditingChatId(null);
    setEditingTitle("");
  };

  const deleteChat = (chatId) => {
    onDeleteChat?.(chatId);
    setOpenChatMenuId(null);
    setEditingChatId(null);
  };

  const sortedChats = [...chats].sort(
    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
  );

  const handleLogout = () => {
    setAccountMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setAccountMenuOpen(false);
    setIsOpen(false);
    setOpenChatMenuId(null);
    setEditingChatId(null);

    onLogout();
  };

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        aria-expanded={isOpen}
      >
        <FiMenu size={22} />
      </button>

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img
              src={Logo}
              alt="Klyro AI logo"
              className="sidebar-logo"
            />

            <span>Klyro AI</span>
          </div>

          <button
            type="button"
            className="sidebar-icon-button sidebar-close-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <FiX size={21} />
          </button>
        </div>

        <button
          type="button"
          className="sidebar-new-chat"
          onClick={createChat}
        >
          <FiPlus size={19} />
          <span>New chat</span>
        </button>

        <div className="sidebar-section-label">
          Your conversations
        </div>

        <div className="sidebar-chat-list">
          {sortedChats.length === 0 && (
            <p className="sidebar-empty">
              Your conversations will appear here.
            </p>
          )}

          {sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`sidebar-chat-row ${
                activeChatId === chat.id
                  ? "sidebar-chat-active"
                  : ""
              }`}
            >
              {editingChatId === chat.id ? (
                <form
                  className="sidebar-rename-form"
                  onSubmit={saveRename}
                >
                  <input
                    autoFocus
                    aria-label="Chat name"
                    value={editingTitle}
                    maxLength={80}
                    onChange={(event) =>
                      setEditingTitle(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setEditingChatId(null);
                        setEditingTitle("");
                      }
                    }}
                  />

                  <button type="submit">Save</button>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    className="sidebar-chat-select"
                    onClick={() => selectChat(chat)}
                  >
                    <FiMessageSquare size={17} />

                    <span>{chat.title}</span>

                    {chat.pinned && (
                      <FiBookmark
                        className="sidebar-pinned-icon"
                        size={14}
                        aria-label="Pinned chat"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    className="sidebar-chat-menu-trigger"
                    aria-label={`Options for ${chat.title}`}
                    aria-expanded={openChatMenuId === chat.id}
                    onClick={() =>
                      setOpenChatMenuId((current) =>
                        current === chat.id ? null : chat.id
                      )
                    }
                  >
                    <FiMoreHorizontal size={18} />
                  </button>

                  {openChatMenuId === chat.id && (
                    <div className="sidebar-chat-menu">
                      <button
                        type="button"
                        onClick={() => togglePin(chat.id)}
                      >
                        <FiBookmark size={15} />

                        {chat.pinned ? "Unpin chat" : "Pin chat"}
                      </button>

                      <button
                        type="button"
                        onClick={() => startRename(chat)}
                      >
                        <FiEdit2 size={15} />
                        Rename
                      </button>

                      <button
                        type="button"
                        className="sidebar-delete-action"
                        onClick={() => deleteChat(chat.id)}
                      >
                        <FiTrash2 size={15} />
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-account">
          {accountMenuOpen && (
            <>
              <button
                type="button"
                className="account-menu-backdrop"
                aria-label="Close account menu"
                onClick={() => setAccountMenuOpen(false)}
              />

              <div className="account-popup">
                <div className="account-popup-name">
                  <FiUser size={16} />
                  <span>{userName || "User"}</span>
                </div>

                <button
                  type="button"
                  className="account-logout account-neutral"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setIsOpen(false);
                    onOpenPersonalize?.();
                  }}
                >
                  <FiSliders size={17} />
                  <span>Personalize</span>
                </button>

                <button
                  type="button"
                  className="account-logout"
                  onClick={handleLogout}
                >
                  <FiLogOut size={17} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            className="sidebar-account-name"
            onClick={() =>
              setAccountMenuOpen((open) => !open)
            }
            aria-expanded={accountMenuOpen}
          >
            <span className="sidebar-account-icon">
              <FiUser size={19} />
            </span>

            <span className="sidebar-account-label">
              {userName || "User"}
            </span>

            <FiChevronDown
              className={`account-chevron ${
                accountMenuOpen ? "account-chevron-open" : ""
              }`}
              size={17}
            />
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div
          className="logout-confirm-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutConfirm(false);
            }
          }}
        >
          <section
            className="logout-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            aria-describedby="logout-confirm-description"
          >
            <div className="logout-confirm-icon">
              <FiLogOut size={24} />
            </div>

            <h2 id="logout-confirm-title">
              Confirm Logout
            </h2>

            <p id="logout-confirm-description">
              Are you sure you want to log out of Klyro AI?
            </p>

            <div className="logout-confirm-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
