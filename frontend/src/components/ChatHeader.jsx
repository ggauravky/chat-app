import { useState, useRef, useEffect } from "react";
import { X, Phone, Video, MoreVertical, BellOff, Bell, ShieldOff, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../lib/utils";

const ChatHeader = () => {
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
    <div className="px-4 py-2.5 border-b border-base-300 bg-base-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="size-10 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            {selectedUser.fullName}
            {isBlocked && <span className="badge badge-error badge-xs">Blocked</span>}
            {isMuted && !isBlocked && <BellOff className="size-3 text-base-content/40" />}
          </h3>
          <p className={`text-xs ${isTyping ? "text-green-500" : "text-base-content/60"}`}>
            {isBlocked ? "You blocked this contact" : statusText}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="btn btn-ghost btn-sm btn-circle" title="Voice call (coming soon)">
          <Phone className="size-4" />
        </button>
        <button className="btn btn-ghost btn-sm btn-circle" title="Video call (coming soon)">
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

        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSelectedUser(null)} title="Close">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
