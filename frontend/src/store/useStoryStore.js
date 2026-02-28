import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useStoryStore = create((set, get) => ({
  stories: [],       // all stories grouped by user
  isLoading: false,
  viewingStory: null, // { userId, storyIndex } currently being viewed

  getStories: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/stories");
      set({ stories: res.data });
    } catch (error) {
      console.error("Failed to load stories:", error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  createStory: async ({ type, content, bgColor }) => {
    try {
      const res = await axiosInstance.post("/stories", { type, content, bgColor });
      set({ stories: [res.data, ...get().stories] });
      toast.success("Story posted!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post story");
    }
  },

  deleteStory: async (storyId) => {
    try {
      await axiosInstance.delete(`/stories/${storyId}`);
      set({ stories: get().stories.filter((s) => s._id !== storyId) });
      toast.success("Story deleted");
    } catch (error) {
      toast.error("Failed to delete story");
    }
  },

  viewStory: async (storyId) => {
    try {
      await axiosInstance.post(`/stories/${storyId}/view`);
      const authUser = useAuthStore.getState().authUser;
      set({
        stories: get().stories.map((s) =>
          s._id === storyId
            ? { ...s, viewedBy: [...(s.viewedBy || []), authUser._id] }
            : s
        ),
      });
    } catch (_) {}
  },

  subscribeToStories: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newStory", (story) => {
      // Don't add own story again (already added optimistically)
      const authUser = useAuthStore.getState().authUser;
      if (story.userId._id === authUser._id) return;
      set({ stories: [story, ...get().stories] });
    });

    socket.on("storyDeleted", ({ storyId }) => {
      set({ stories: get().stories.filter((s) => s._id !== storyId) });
    });
  },

  unsubscribeFromStories: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newStory");
    socket?.off("storyDeleted");
  },

  // Group stories by userId for the ring display
  getGroupedStories: () => {
    const stories = get().stories;
    const map = {};
    stories.forEach((s) => {
      const uid = s.userId._id;
      if (!map[uid]) map[uid] = { user: s.userId, stories: [] };
      map[uid].stories.push(s);
    });
    return Object.values(map);
  },

  setViewingStory: (val) => set({ viewingStory: val }),
}));
