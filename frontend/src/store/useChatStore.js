import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  replyingTo: null,      // message object being replied to
  typingUsers: {},       // { userId: true } for typing indicator

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        ...messageData,
        replyTo: replyingTo?._id || null,
      });
      set({ messages: [...messages, res.data], replyingTo: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  markMessagesRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
      // Update local statuses — compare as strings because MongoDB ObjectIds
      set({
        messages: get().messages.map((m) =>
          String(m.senderId) === String(userId) && m.status !== "read"
            ? { ...m, status: "read" }
            : m
        ),
      });
      // Notify sender via socket
      const socket = useAuthStore.getState().socket;
      socket?.emit("markRead", { senderId: userId });
    } catch (error) {
      console.error("markMessagesRead error:", error.message);
    }
  },

  deleteMessage: async (messageId, deleteFor) => {
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`, {
        data: { deleteFor },
      });
      if (deleteFor === "everyone") {
        set({
          messages: get().messages.map((m) =>
            m._id === messageId ? { ...m, isDeleted: true, text: null, image: null } : m
          ),
        });
      } else {
        set({ messages: get().messages.filter((m) => m._id !== messageId) });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    // New incoming message
    socket.on("newMessage", (newMessage) => {
      const fromSelected = newMessage.senderId === selectedUser._id;
      if (!fromSelected) {
        // Update unread count in users list
        set({
          users: get().users.map((u) =>
            u._id === newMessage.senderId
              ? { ...u, lastMessage: newMessage, unreadCount: (u.unreadCount || 0) + 1 }
              : u
          ),
        });
        return;
      }
      set({ messages: [...get().messages, newMessage] });
      // Auto mark as read since the chat is open
      get().markMessagesRead(selectedUser._id);
      // Update users sidebar
      set({
        users: get().users.map((u) =>
          u._id === selectedUser._id ? { ...u, lastMessage: newMessage, unreadCount: 0 } : u
        ),
      });
    });

    // Typing events
    socket.on("userTyping", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        set({ typingUsers: { ...get().typingUsers, [senderId]: true } });
      }
    });
    socket.on("userStopTyping", ({ senderId }) => {
      const t = { ...get().typingUsers };
      delete t[senderId];
      set({ typingUsers: t });
    });

    // Read receipts — the other person read our messages that we SENT to them
    socket.on("messagesRead", ({ readBy }) => {
      if (String(readBy) === String(selectedUser._id)) {
        set({
          messages: get().messages.map((m) =>
            // Only update OUR outgoing messages to that user
            String(m.senderId) === String(useAuthStore.getState().authUser._id)
              ? { ...m, status: "read" }
              : m
          ),
        });
      }
    });

    // Delivered receipts
    socket.on("messagesDelivered", ({ messageIds }) => {
      set({
        messages: get().messages.map((m) =>
          messageIds.includes(m._id) && m.status === "sent" ? { ...m, status: "delivered" } : m
        ),
      });
    });

    // Remote delete (other person deleted for everyone)
    socket.on("messageDeleted", ({ messageId }) => {
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, text: null, image: null } : m
        ),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStopTyping");
    socket.off("messagesRead");
    socket.off("messagesDelivered");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, replyingTo: null, typingUsers: {} }),
}));
