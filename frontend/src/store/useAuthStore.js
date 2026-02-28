import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.MODE === "development" ? "http://localhost:5001" : window.location.origin);

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Block / Unblock
  blockUser: async (userId) => {
    try {
      const res = await axiosInstance.post(`/auth/block/${userId}`);
      set({ authUser: { ...get().authUser, blockedUsers: res.data.blockedUsers } });
      toast.success("User blocked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Block failed");
    }
  },

  unblockUser: async (userId) => {
    try {
      const res = await axiosInstance.delete(`/auth/block/${userId}`);
      set({ authUser: { ...get().authUser, blockedUsers: res.data.blockedUsers } });
      toast.success("User unblocked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unblock failed");
    }
  },

  // Mute / Unmute
  muteChat: async (userId) => {
    try {
      const res = await axiosInstance.post(`/auth/mute/${userId}`);
      set({ authUser: { ...get().authUser, mutedChats: res.data.mutedChats } });
      toast.success("Chat muted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Mute failed");
    }
  },

  unmuteChat: async (userId) => {
    try {
      const res = await axiosInstance.delete(`/auth/mute/${userId}`);
      set({ authUser: { ...get().authUser, mutedChats: res.data.mutedChats } });
      toast.success("Chat unmuted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unmute failed");
    }
  },

  // Save Web Push subscription
  savePushSubscription: async (subscription) => {
    try {
      await axiosInstance.post("/auth/push-subscribe", { subscription });
    } catch (_) {}
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
      autoConnect: true,
    });

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Online/offline presence toasts
    socket.on("userOnline", ({ userId }) => {
      const { onlineUsers } = get();
      if (!onlineUsers.includes(userId)) {
        set({ onlineUsers: [...onlineUsers, userId] });
      }
    });

    socket.on("userOffline", ({ userId }) => {
      set({ onlineUsers: get().onlineUsers.filter((id) => id !== userId) });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
