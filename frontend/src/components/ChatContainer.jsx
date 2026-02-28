import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, Trash2, Reply, MoreVertical, Copy, Star, StarOff, ChevronDown, X } from "lucide-react";
import toast from "react-hot-toast";

// Notification sound — generated via Web Audio API (no file needed)
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.3);
  } catch (_) {}
};

// Single tick = sent, double tick = delivered, blue double tick = read
const MessageTicks = ({ status }) => {
  if (status === "read")
    return <CheckCheck className="size-3.5 text-blue-400 shrink-0" />;
  if (status === "delivered")
    return <CheckCheck className="size-3.5 text-base-content/50 shrink-0" />;
  return <Check className="size-3.5 text-base-content/50 shrink-0" />;
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesRead,
    deleteMessage,
    setReplyingTo,
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const [contextMenu, setContextMenu] = useState(null); // { messageId, isMine, message, x, y }
  const [starredIds, setStarredIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("zapp_starred") || "[]")); }
    catch { return new Set(); }
  });
  const [lightbox, setLightbox] = useState(null); // image URL
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Mark as read when chat opens or user switches
  useEffect(() => {
    if (selectedUser?._id) markMessagesRead(selectedUser._id);
  }, [selectedUser._id, markMessagesRead]);

  // Auto-scroll on new messages + notification sound for incoming
  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    const isNewMsg = messages.length > prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;

    if (isNewMsg) {
      // Play sound only for incoming messages when chat is open
      if (lastMsg.senderId !== authUser._id) {
        playNotificationSound();
      }
      // Auto-scroll only if already near bottom
      const el = scrollContainerRef.current;
      if (el) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (atBottom) messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, authUser._id]);

  // Show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    e.stopPropagation();
    const isMine = message.senderId === authUser._id;
    setContextMenu({ messageId: message._id, isMine, message, x: e.clientX, y: e.clientY });
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
    setContextMenu(null);
  };

  const toggleStar = (id) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Unstarred"); }
      else { next.add(id); toast("⭐ Starred"); }
      localStorage.setItem("zapp_starred", JSON.stringify([...next]));
      return next;
    });
    setContextMenu(null);
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isTyping = typingUsers[selectedUser._id];

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <ChatHeader />

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(var(--b3)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        onClick={() => setContextMenu(null)}
        onScroll={handleScroll}
      >
        {messages.map((message, idx) => {
          const isMine = message.senderId === authUser._id;
          const isStarred = starredIds.has(message._id);
          const showAvatar =
            !isMine &&
            (idx === 0 || messages[idx - 1]?.senderId !== message.senderId);

          return (
            <div
              key={message._id}
              className={`group flex items-end gap-1.5 ${
                isMine ? "justify-end" : "justify-start"
              }`}
              ref={idx === messages.length - 1 ? messageEndRef : null}
            >
              {/* Other user avatar */}
              {!isMine && (
                <div className="size-7 shrink-0">
                  {showAvatar && (
                    <img
                      src={selectedUser.profilePic || "/avatar.png"}
                      className="size-7 rounded-full object-cover"
                      alt=""
                    />
                  )}
                </div>
              )}

              {/* Hover quick-actions (left side for mine, right for theirs) */}
              {!message.isDeleted && isMine && (
                <div className="shrink-0 hidden group-hover:flex items-center gap-0.5">
                  <button
                    className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
                    title="Reply"
                    onClick={(e) => { e.stopPropagation(); setReplyingTo(message); }}
                  >
                    <Reply className="size-3.5" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
                    title="More"
                    onClick={(e) => handleContextMenu(e, message)}
                  >
                    <MoreVertical className="size-3.5" />
                  </button>
                </div>
              )}

              {/* Bubble */}
              <div
                className={`relative max-w-[70%] sm:max-w-[55%] rounded-lg px-3 py-1.5 shadow-sm cursor-pointer
                  ${isMine
                    ? "bg-green-200 dark:bg-green-700 rounded-br-none"
                    : "bg-base-100 rounded-bl-none"
                  }`}
                onContextMenu={(e) => handleContextMenu(e, message)}
              >
                {/* Star indicator */}
                {isStarred && (
                  <Star className="absolute -top-1.5 -right-1.5 size-3 text-yellow-400 fill-yellow-400" />
                )}

                {/* Reply quote */}
                {message.replyTo && !message.replyTo.isDeleted && (
                  <div className={`mb-1.5 pl-2 border-l-4 ${ isMine ? "border-green-500" : "border-primary" } rounded-sm bg-black/10 py-1 pr-2 text-xs`}>
                    <p className="font-semibold text-primary text-[11px]">
                      {message.replyTo.senderId === authUser._id ? "You" : selectedUser.fullName}
                    </p>
                    <p className="truncate opacity-80">
                      {message.replyTo.isDeleted
                        ? "🚫 This message was deleted"
                        : message.replyTo.image && !message.replyTo.text
                        ? "📷 Photo"
                        : message.replyTo.text}
                    </p>
                  </div>
                )}

                {/* Deleted message */}
                {message.isDeleted ? (
                  <p className="italic text-sm opacity-60">⛔ This message was deleted</p>
                ) : (
                  <>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-full rounded-md mb-1 cursor-zoom-in"
                        onClick={(e) => { e.stopPropagation(); setLightbox(message.image); }}
                      />
                    )}
                    {message.text && (
                      <p className="text-sm leading-relaxed break-words">{message.text}</p>
                    )}
                  </>
                )}

                {/* Time + ticks */}
                <div className="flex items-center gap-1 mt-0.5 justify-end">
                  <span className="text-[10px] opacity-50">
                    {formatMessageTime(message.createdAt)}
                  </span>
                  {isMine && !message.isDeleted && <MessageTicks status={message.status} />}
                </div>
              </div>

              {/* Hover quick-actions (right side for others) */}
              {!message.isDeleted && !isMine && (
                <div className="shrink-0 hidden group-hover:flex items-center gap-0.5">
                  <button
                    className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
                    title="Reply"
                    onClick={(e) => { e.stopPropagation(); setReplyingTo(message); }}
                  >
                    <Reply className="size-3.5" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
                    title="More"
                    onClick={(e) => handleContextMenu(e, message)}
                  >
                    <MoreVertical className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-1.5 justify-start">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              className="size-7 rounded-full object-cover"
              alt=""
            />
            <div className="bg-base-100 rounded-lg rounded-bl-none px-4 py-2 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="size-1.5 bg-base-content/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 bg-base-content/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 bg-base-content/60 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Scroll-to-bottom floating button */}
      {showScrollBtn && (
        <button
          className="absolute bottom-20 right-4 z-30 btn btn-circle btn-sm bg-base-100 shadow-lg border border-base-300 hover:bg-green-500 hover:text-white transition-colors"
          onClick={scrollToBottom}
          title="Scroll to bottom"
        >
          <ChevronDown className="size-4" />
        </button>
      )}

      {/* Context menu at actual mouse position */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-base-100 shadow-xl rounded-xl py-1.5 min-w-[190px] border border-base-300"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 200),
            left: Math.min(contextMenu.x, window.innerWidth - 210),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.message?.isDeleted && (
            <>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200"
                onClick={() => { setReplyingTo(contextMenu.message); setContextMenu(null); }}
              >
                <Reply className="size-4" /> Reply
              </button>
              {contextMenu.message?.text && (
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200"
                  onClick={() => copyMessage(contextMenu.message.text)}
                >
                  <Copy className="size-4" /> Copy text
                </button>
              )}
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200"
                onClick={() => toggleStar(contextMenu.messageId)}
              >
                {starredIds.has(contextMenu.messageId)
                  ? <><StarOff className="size-4 text-yellow-400" /> Unstar</>
                  : <><Star className="size-4 text-yellow-400" /> Star message</>}
              </button>
            </>
          )}
          <div className="border-t border-base-200 my-1" />
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200 text-error"
            onClick={() => { deleteMessage(contextMenu.messageId, "me"); setContextMenu(null); }}
          >
            <Trash2 className="size-4" /> Delete for me
          </button>
          {contextMenu.isMine && !contextMenu.message?.isDeleted && (
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200 text-error"
              onClick={() => { deleteMessage(contextMenu.messageId, "everyone"); setContextMenu(null); }}
            >
              <Trash2 className="size-4" /> Delete for everyone
            </button>
          )}
        </div>
      )}

      {/* Image Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="size-6" />
          </button>
          <img
            src={lightbox}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
