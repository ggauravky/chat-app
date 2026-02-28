import { useState, useRef, useEffect } from "react";
import { X, Phone, Video, MoreVertical, BellOff, Bell, ShieldOff, Shield, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../lib/utils";

const ChatHeader = ({ onAvatarClick }) => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers, authUser, blockUser, unblockUser, muteChat, unmuteChat } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];
  const isMuted = authUser?.mutedChats?.includes(selectedUser._id);
  const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id);

  const statusText = isTyping
    ? "typing..."
    : isOnline
    ? "online"
    : selectedUser.lastSeen
    ? `last seen ${formatLastSeen(selectedUser.lastSeen)}`
    : "offline";

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="px-3 py-2.5 border-b border-base-300 bg-base-100 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {/* Back button â€” mobile only */}
        <button
          className="btn btn-ghost btn-sm btn-circle md:hidden shrink-0"
          onClick={() => setSelectedUser(null)}
          title="Back"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Clickable avatar â†’ profile modal */}
        <button
          className="avatar shrink-0 rounded-full focus:outline-none hover:opacity-80 transition"
          onClick={onAvatarClick}
          title="View profile"
        >
          <div className="size-10 rounded-full overflow-hidden">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} className="w-full h-full object-cover" />
          </div>
        </button>

        <div className="min-w-0">
          <h3 className="font-semibold text-sm flex items-center gap-1.5 truncate">
            {selectedUser.fullName}
            {isBlocked && <span className="badge badge-error badge-xs shrink-0">Blocked</span>}
            {isMuted && !isBlocked && <BellOff className="size-3 text-base-content/40 shrink-0" />}
          </h3>
          <p className={`text-xs truncate ${isTyping ? "text-green-500" : "text-base-content/60"}`}>
            {isBlocked ? "You blocked this contact" : statusText}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button className="btn btn-ghost btn-sm btn-circle hidden sm:inline-flex" title="Voice call (coming soon)">
          <Phone className="size-4" />
        </button>
        <button className="btn btn-ghost btn-sm btn-circle hidden sm:inline-flex" title="Video call (coming soon)">
          <Video className="size-4" />
        </button>

        {/* Kebab menu */}
        <div className="relative" ref={menuRef}>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setMenuOpen((v) => !v)}
            title="More options"
          >
            <MoreVertical className="size-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-base-100 border border-base-300 shadow-xl rounded-xl py-1.5 min-w-[180px]">
              {/* View profile */}
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200 transition"
                onClick={() => { onAvatarClick?.(); setMenuOpen(false); }}
              >
                View profile
              </button>

              <div className="divider my-0.5 h-px bg-base-200" />

              {/* Mute / Unmute */}
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200 transition"
                onClick={async () => {
                  if (isMuted) await unmuteChat(selectedUser._id);
                  else await muteChat(selectedUser._id);
                  setMenuOpen(false);
                }}
              >
                {isMuted ? <Bell className="size-4" /> : <BellOff className="size-4" />}
                {isMuted ? "Unmute notifications" : "Mute notifications"}
              </button>

              {/* Block / Unblock */}
              <button
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200 transition ${isBlocked ? "text-success" : "text-error"}`}
                onClick={async () => {
                  if (isBlocked) await unblockUser(selectedUser._id);
                  else await blockUser(selectedUser._id);
                  setMenuOpen(false);
                }}
              >
                {isBlocked ? <Shield className="size-4" /> : <ShieldOff className="size-4" />}
                {isBlocked ? "Unblock contact" : "Block contact"}
              </button>

              <div className="divider my-0.5 h-px bg-base-200" />

              {/* Close chat */}
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-200 transition"
                onClick={() => setSelectedUser(null)}
              >
                <X className="size-4" /> Close chat
              </button>
            </div>
          )}
        </div>

        {/* X â€” desktop only (mobile uses back arrow) */}
        <button className="btn btn-ghost btn-sm btn-circle hidden md:inline-flex" onClick={() => setSelectedUser(null)} title="Close">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
