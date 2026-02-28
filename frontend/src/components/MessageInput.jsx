import { useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, replyingTo, clearReplyingTo, selectedUser } = useChatStore();
  const { authUser, socket } = useAuthStore();

  const emitTyping = useCallback(() => {
    if (!socket || !selectedUser) return;
    socket.emit("typing", { receiverId: selectedUser._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, 2000);
  }, [socket, selectedUser]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview) return;
    clearTimeout(typingTimeoutRef.current);
    socket?.emit("stopTyping", { receiverId: selectedUser._id });

    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-2 border-t border-base-300 bg-base-100">
      {/* Reply preview bar */}
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-base-200 rounded-lg border-l-4 border-primary">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary">
              Replying to {replyingTo.senderId === authUser._id ? "yourself" : selectedUser.fullName}
            </p>
            <p className="text-xs truncate opacity-70">
              {replyingTo.image && !replyingTo.text ? "📷 Photo" : replyingTo.text}
            </p>
          </div>
          <button onClick={clearReplyingTo} className="btn btn-ghost btn-xs btn-circle shrink-0">
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-base-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-2 z-50">
          <EmojiPicker
            onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)}
            lazyLoadEmojis
            height={350}
          />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {/* Emoji button */}
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle text-base-content/60"
          onClick={() => setShowEmojiPicker((v) => !v)}
        >
          <Smile className="size-5" />
        </button>

        {/* Image attach */}
        <button
          type="button"
          className={`btn btn-ghost btn-sm btn-circle ${
            imagePreview ? "text-green-500" : "text-base-content/60"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="size-5" />
        </button>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

        {/* Text input */}
        <input
          type="text"
          className="flex-1 input input-bordered rounded-full input-sm bg-base-200"
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowEmojiPicker(false)}
        />

        {/* Send */}
        <button
          type="submit"
          className="btn btn-circle btn-sm bg-green-500 hover:bg-green-600 border-none text-white"
          disabled={!text.trim() && !imagePreview}
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
