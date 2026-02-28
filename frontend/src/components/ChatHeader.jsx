import { X, Phone, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../lib/utils";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];

  const statusText = isTyping
    ? "typing..."
    : isOnline
    ? "online"
    : selectedUser.lastSeen
    ? `last seen ${formatLastSeen(selectedUser.lastSeen)}`
    : "offline";

  return (
    <div className="px-4 py-2.5 border-b border-base-300 bg-base-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="size-10 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{selectedUser.fullName}</h3>
          <p className={`text-xs ${isTyping ? "text-green-500" : "text-base-content/60"}`}>
            {statusText}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm btn-circle" title="Voice call (coming soon)">
          <Phone className="size-4" />
        </button>
        <button className="btn btn-ghost btn-sm btn-circle" title="Video call (coming soon)">
          <Video className="size-4" />
        </button>
        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSelectedUser(null)}>
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
