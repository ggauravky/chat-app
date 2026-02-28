import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import StoryBar from "./StoryBar";
import { Search, Settings, LogOut, Palette, BellOff } from "lucide-react";
import { formatSidebarTime } from "../lib/utils";
import { Link } from "react-router-dom";

const THEMES = [
  { id: "coffee", label: "Coffee" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "cupcake", label: "Cupcake" },
  { id: "forest", label: "Forest" },
  { id: "synthwave", label: "Synthwave" },
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "aqua", label: "Aqua" },
];

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [search, setSearch] = useState("");
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Close theme dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false); };
    if (themeOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [themeOpen]);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col bg-base-100 shrink-0">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-2">
          <Link to="/profile" title="Your profile">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="me"
              className="size-9 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-500 transition"
            />
          </Link>
          <span className="hidden lg:block font-extrabold text-lg tracking-tight">
            <span className="text-green-500">Z</span>app
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Theme picker */}
          <div className="relative" ref={themeRef}>
            <button
              className="btn btn-ghost btn-sm btn-circle"
              title="Change theme"
              onClick={() => setThemeOpen((v) => !v)}
            >
              <Palette className="size-4" />
            </button>
            {themeOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-base-100 border border-base-300 shadow-xl rounded-xl py-1.5 min-w-[150px]">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm hover:bg-base-200 transition ${theme === t.id ? "font-bold text-green-500" : ""}`}
                    onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                  >
                    {theme === t.id && <span className="size-1.5 rounded-full bg-green-500 shrink-0" />}
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/settings" className="btn btn-ghost btn-sm btn-circle" title="Settings">
            <Settings className="size-4" />
          </Link>
          <button className="btn btn-ghost btn-sm btn-circle" title="Logout" onClick={logout}>
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 border-b border-base-300">
        <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1.5">
          <Search className="size-4 text-base-content/40 shrink-0" />
          <input
            type="text"
            placeholder="Search contacts"
            className="bg-transparent text-sm outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Story bar */}
      <StoryBar />

      {/* Contact list */}
      <div className="overflow-y-auto flex-1">
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(user._id);
          const lastMsg = user.lastMessage;
          const isMuted = user.isMuted;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-base-200 transition-colors border-b border-base-200 last:border-none ${
                isSelected ? "bg-base-200" : ""
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 rounded-full object-cover"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                )}
              </div>

              <div className="hidden lg:flex flex-1 min-w-0 flex-col">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold truncate text-sm flex items-center gap-1">
                    {user.fullName}
                    {isMuted && <BellOff className="size-3 text-base-content/40 shrink-0" title="Muted" />}
                  </span>
                  {lastMsg && (
                    <span className="text-[11px] text-base-content/50 shrink-0 ml-1">
                      {formatSidebarTime(lastMsg.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-base-content/55 truncate max-w-[170px]">
                    {lastMsg
                      ? lastMsg.isDeleted
                        ? "This message was deleted"
                        : lastMsg.image && !lastMsg.text
                        ? "Photo"
                        : lastMsg.text || ""
                      : isOnline
                      ? "Online"
                      : "Tap to chat"}
                  </p>
                  {user.unreadCount > 0 && (
                    <span className="ml-1 shrink-0 min-w-[20px] h-5 flex items-center justify-center bg-green-500 text-white text-[10px] font-bold rounded-full px-1.5">
                      {user.unreadCount > 99 ? "99+" : user.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/50 py-8 text-sm">No contacts found</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;

