import { useEffect, useRef, useState } from "react";
import { FiSend, FiMessageCircle } from "react-icons/fi";
import { useSelector } from "react-redux";

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

/**
 * `messages` = [{ userId, username, name, message, sentAt }]
 * `typingUser` = opponent's name if they're currently typing, else null
 * `onSend(text)` / `onTyping(isTyping)` bubble up to the socket layer.
 */
const BattleChat = ({ messages, typingUser, onSend, onTyping, collapsed, onToggleCollapse }) => {
  const { user } = useSelector((state) => state.auth);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!collapsed) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      setUnread(0);
    } else if (messages.length > 0) {
      setUnread((u) => u + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleChange = (e) => {
    setDraft(e.target.value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
    onTyping(false);
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapse}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-duel-500 text-white shadow-glow"
        aria-label="Open chat"
      >
        <FiMessageCircle size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fail px-1 font-mono text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="card flex h-80 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-600/10 px-3 py-2 dark:border-paper-200/10">
        <p className="font-body text-xs font-semibold text-ink-800/70 dark:text-paper-100/70">Battle chat</p>
        <button type="button" onClick={onToggleCollapse} className="font-body text-xs text-ink-800/50 hover:text-duel-500 dark:text-paper-100/50">
          Minimize
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
        {messages.length === 0 ? (
          <p className="mt-4 text-center font-body text-xs text-ink-800/40 dark:text-paper-100/40">
            Say hi, or trash talk politely.
          </p>
        ) : (
          messages.map((m, i) => {
            const isSelf = m.userId === user?._id;
            return (
              <div key={i} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-1.5 ${isSelf ? "bg-duel-500 text-white" : "bg-ink-900/5 dark:bg-paper-100/10"}`}>
                  <p className="font-body text-xs">{m.message}</p>
                  <p className={`mt-0.5 font-mono text-[10px] ${isSelf ? "text-white/60" : "text-ink-800/40 dark:text-paper-100/40"}`}>
                    {formatTime(m.sentAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {typingUser && (
          <p className="font-body text-[11px] italic text-ink-800/40 dark:text-paper-100/40">{typingUser} is typing…</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-ink-600/10 p-2 dark:border-paper-200/10">
        <input
          value={draft}
          onChange={handleChange}
          placeholder="Type a message…"
          maxLength={500}
          className="input-field flex-1 py-1.5 text-xs"
        />
        <button type="submit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-duel-500 text-white disabled:opacity-40" disabled={!draft.trim()}>
          <FiSend size={14} />
        </button>
      </form>
    </div>
  );
};

export default BattleChat;
