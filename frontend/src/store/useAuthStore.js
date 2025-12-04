import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
    } catch (err) {
      console.error("Error checking auth:", err);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      console.log("Sending signup request with:", {
        fullname: data.fullName,
        email: data.email,
      });
      const res = await axiosInstance.post("/auth/signup", {
        fullname: data.fullName,
        email: data.email,
        password: data.password,
      });
      console.log("Signup response:", res.data);
      set({ authUser: res.data });
      toast.success("Account created successfully!");
    } catch (err) {
      console.error("Signup error details:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Signup failed");
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
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
}));
