import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const PAGE_SIZE = 30;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoadingMore: false,
  hasMoreMessages: false,
  replyingTo: null,
  typingUsers: {},

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
    set({ isMessagesLoading: true, messages: [], hasMoreMessages: false });
    try {
      const res = await axiosInstance.get(`/messages/${userId}?limit=${PAGE_SIZE}`);
      set({
        messages: res.data,
        hasMoreMessages: res.data.length === PAGE_SIZE,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadMoreMessages: async () => {
    const { messages, selectedUser, isLoadingMore, hasMoreMessages } = get();
    if (!selectedUser || isLoadingMore || !hasMoreMessages) return;

    set({ isLoadingMore: true });
    try {
      const oldest = messages[0]?._id;
      const res = await axiosInstance.get(
        `/messages/${selectedUser._id}?limit=${PAGE_SIZE}&before=${oldest}`
      );
      set({
        messages: [...res.data, ...messages],
        hasMoreMessages: res.data.length === PAGE_SIZE,
      });
    } catch (error) {
      toast.error("Failed to load older messages");
    } finally {
      set({ isLoadingMore: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo, users } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        ...messageData,
        replyTo: replyingTo?._id || null,
      });
      set({ messages: [...messages, res.data], replyingTo: null });
      // Move recipient to top of contact list
      const target = users.find((u) => u._id === selectedUser._id);
      if (target) {
        const updated = { ...target, lastMessage: res.data };
        set({ users: [updated, ...users.filter((u) => u._id !== selectedUser._id)] });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  markMessagesRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
      set({
        // Mark all messages from this user as read in the chat view
        messages: get().messages.map((m) =>
          String(m.senderId) === String(userId) && m.status !== "read"
            ? { ...m, status: "read" }
            : m
        ),
        // Clear the unread badge in the sidebar
        users: get().users.map((u) =>
          String(u._id) === String(userId) ? { ...u, unreadCount: 0 } : u
        ),
      });
      const socket = useAuthStore.getState().socket;
      socket?.emit("markRead", { senderId: userId });
    } catch (error) {
      console.error("markMessagesRead error:", error.message);
    }
  },

  deleteMessage: async (messageId, deleteFor) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`, { data: { deleteFor } });
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

    socket.on("newMessage", (newMessage) => {
      const fromSelected = newMessage.senderId === selectedUser._id;
      const currentUsers = get().users;

      if (!fromSelected) {
        const sender = currentUsers.find((u) => u._id === newMessage.senderId);
        const isMuted = sender?.isMuted;
        const updatedUser = { ...sender, lastMessage: newMessage, unreadCount: (sender?.unreadCount || 0) + 1 };
        // Move sender to top of the list
        set({
          users: [updatedUser, ...currentUsers.filter((u) => u._id !== newMessage.senderId)],
        });
        if (!isMuted && sender) {
          toast(`New message from ${sender.fullName}`, { icon: "💬", duration: 3000 });
        }
        return;
      }
      // Message from currently selected user
      set({ messages: [...get().messages, newMessage] });
      get().markMessagesRead(selectedUser._id);
      const selUser = currentUsers.find((u) => u._id === selectedUser._id);
      const updatedSel = { ...selUser, lastMessage: newMessage, unreadCount: 0 };
      // Move selected user to top too
      set({
        users: [updatedSel, ...currentUsers.filter((u) => u._id !== selectedUser._id)],
      });
    });

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

    socket.on("messagesRead", ({ readBy }) => {
      if (String(readBy) === String(selectedUser._id)) {
        set({
          messages: get().messages.map((m) =>
            String(m.senderId) === String(useAuthStore.getState().authUser._id)
              ? { ...m, status: "read" }
              : m
          ),
        });
      }
    });

    socket.on("messagesDelivered", ({ messageIds }) => {
      set({
        messages: get().messages.map((m) =>
          messageIds.includes(m._id) && m.status === "sent" ? { ...m, status: "delivered" } : m
        ),
      });
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, text: null, image: null } : m
        ),
      });
    });

    // Online/offline presence toast for selected user
    socket.on("userOnline", ({ userId }) => {
      if (userId === selectedUser._id) {
        toast(`${selectedUser.fullName} is now online`, { icon: "🟢", duration: 3000 });
      }
    });
    socket.on("userOffline", ({ userId }) => {
      if (userId === selectedUser._id) {
        toast(`${selectedUser.fullName} went offline`, { icon: "⚫", duration: 3000 });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("userTyping");
    socket?.off("userStopTyping");
    socket?.off("messagesRead");
    socket?.off("messagesDelivered");
    socket?.off("messageDeleted");
    socket?.off("userOnline");
    socket?.off("userOffline");
  },

  setSelectedUser: (selectedUser) =>
    set({ selectedUser, replyingTo: null, typingUsers: {}, messages: [], hasMoreMessages: false }),
}));
