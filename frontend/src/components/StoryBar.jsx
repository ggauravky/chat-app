import { useEffect, useState, useRef } from "react";
import { useStoryStore } from "../store/useStoryStore";
import { useAuthStore } from "../store/useAuthStore";
import { Plus, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   StoryBar — horizontal ring row in sidebar
───────────────────────────────────────────── */
const StoryBar = () => {
  const { authUser } = useAuthStore();
  const {
    getStories,
    createStory,
    getGroupedStories,
    subscribeToStories,
    unsubscribeFromStories,
    setViewingStory,
    viewingStory,
  } = useStoryStore();

  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("text"); // "text" | "image"
  const [newText, setNewText] = useState("");
  const [newBg, setNewBg] = useState("#16a34a");
  const [newImage, setNewImage] = useState(null); // base64
  const fileRef = useRef(null);

  useEffect(() => {
    getStories();
    subscribeToStories();
    return () => unsubscribeFromStories();
  }, [getStories, subscribeToStories, unsubscribeFromStories]);

  const grouped = getGroupedStories();

  // Split my stories from others
  const myGroup = grouped.find((g) => g.user._id === authUser._id);
  const others = grouped.filter((g) => g.user._id !== authUser._id);

  const handlePost = async () => {
    if (addType === "text" && !newText.trim()) return toast.error("Enter story text");
    if (addType === "image" && !newImage) return toast.error("Select an image");
    await createStory({
      type: addType,
      content: addType === "text" ? newText.trim() : newImage,
      bgColor: addType === "text" ? newBg : undefined,
    });
    setAddOpen(false);
    setNewText("");
    setNewImage(null);
  };

  return (
    <>
      {/* ─── Ring row ─── */}
      <div className="px-2 py-2 flex gap-3 overflow-x-auto scrollbar-hide border-b border-base-200">
        {/* My story / Add button */}
        <div
          className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
          onClick={() => (myGroup ? openViewer(myGroup, 0) : setAddOpen(true))}
        >
          <div className={`relative size-12 rounded-full p-0.5 ${myGroup ? "bg-gradient-to-tr from-green-400 to-teal-400" : "bg-base-300"}`}>
            <img
              src={authUser.profilePic || "/avatar.png"}
              className="size-full rounded-full object-cover ring-2 ring-base-100"
              alt="my story"
            />
            {!myGroup && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full size-4 flex items-center justify-center ring-1 ring-base-100">
                <Plus className="size-2.5 text-white" />
              </span>
            )}
          </div>
          <span className="text-[10px] text-base-content/60 truncate w-12 text-center hidden lg:block">
            {myGroup ? "My Story" : "Add"}
          </span>
        </div>

        {/* Other users */}
        {others.map((g, gi) => {
          const hasUnseen = g.stories.some(
            (s) => !s.viewedBy?.includes(authUser._id)
          );
          return (
            <div
              key={g.user._id}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
              onClick={() => openViewer(g, gi + 1)} // gi+1 to offset myGroup
            >
              <div
                className={`size-12 rounded-full p-0.5 ${
                  hasUnseen
                    ? "bg-gradient-to-tr from-green-400 to-teal-400"
                    : "bg-base-300"
                }`}
              >
                <img
                  src={g.user.profilePic || "/avatar.png"}
                  className="size-full rounded-full object-cover ring-2 ring-base-100"
                  alt={g.user.fullName}
                />
              </div>
              <span className="text-[10px] text-base-content/60 truncate w-12 text-center hidden lg:block">
                {g.user.fullName.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Story Viewer Modal ─── */}
      {viewingStory && <StoryViewer onClose={() => setViewingStory(null)} groups={grouped} authUser={authUser} />}

      {/* ─── Add Story Modal ─── */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="bg-base-100 rounded-2xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">New Story</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setAddOpen(false)}>
                <X className="size-4" />
              </button>
            </div>

            {/* Type tabs */}
            <div className="tabs tabs-boxed">
              <button className={`tab flex-1 ${addType === "text" ? "tab-active" : ""}`} onClick={() => setAddType("text")}>Text</button>
              <button className={`tab flex-1 ${addType === "image" ? "tab-active" : ""}`} onClick={() => setAddType("image")}>Image</button>
            </div>

            {addType === "text" ? (
              <div className="space-y-3">
                {/* Text preview */}
                <div
                  className="h-40 rounded-xl flex items-center justify-center text-white text-xl font-semibold px-4 text-center"
                  style={{ background: newBg }}
                >
                  {newText || "Your story text…"}
                </div>
                <textarea
                  className="textarea textarea-bordered w-full resize-none"
                  rows={2}
                  maxLength={200}
                  placeholder="What's on your mind?"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                />
                <div className="flex gap-2">
                  {["#16a34a", "#2563eb", "#9333ea", "#ef4444", "#f59e0b", "#0f172a"].map((c) => (
                    <button
                      key={c}
                      className="size-7 rounded-full ring-2 ring-offset-2 transition"
                      style={{ background: c, ringColor: newBg === c ? "white" : "transparent" }}
                      onClick={() => setNewBg(c)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {newImage ? (
                  <div className="relative">
                    <img src={newImage} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      className="absolute top-2 right-2 btn btn-circle btn-sm bg-black/50 border-none text-white"
                      onClick={() => setNewImage(null)}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full h-48 border-2 border-dashed border-base-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-green-500 transition"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Plus className="size-8 text-base-content/30" />
                    <span className="text-sm text-base-content/50">Tap to add image</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setNewImage(reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            )}

            <button
              className="btn btn-block bg-green-500 hover:bg-green-600 border-none text-white"
              onClick={handlePost}
            >
              Post Story
            </button>
          </div>
        </div>
      )}
    </>
  );

  function openViewer(group, _idx) {
    setViewingStory({ groupIndex: _idx, storyIndex: 0 });
  }
};

/* ─────────────────────────────────────────────
   StoryViewer — full-screen tap-to-advance
───────────────────────────────────────────── */
const StoryViewer = ({ onClose, groups, authUser }) => {
  const { viewingStory, setViewingStory, viewStory, deleteStory } = useStoryStore();
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const DURATION = 5000; // ms per story

  const { groupIndex, storyIndex } = viewingStory;
  const group = groups[groupIndex];
  if (!group) { onClose(); return null; }
  const story = group.stories[storyIndex];
  if (!story) { onClose(); return null; }

  const isOwn = group.user._id === authUser._id;

  // Mark as viewed
  useEffect(() => {
    if (!story.viewedBy?.includes(authUser._id)) viewStory(story._id);
  }, [story._id]);

  // Progress bar timer
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= DURATION) advance();
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [groupIndex, storyIndex]);

  const advance = () => {
    clearInterval(timerRef.current);
    if (storyIndex < group.stories.length - 1) {
      setViewingStory({ groupIndex, storyIndex: storyIndex + 1 });
    } else if (groupIndex < groups.length - 1) {
      setViewingStory({ groupIndex: groupIndex + 1, storyIndex: 0 });
    } else {
      onClose();
    }
  };

  const retreat = () => {
    clearInterval(timerRef.current);
    if (storyIndex > 0) {
      setViewingStory({ groupIndex, storyIndex: storyIndex - 1 });
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setViewingStory({ groupIndex: groupIndex - 1, storyIndex: prevGroup.stories.length - 1 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: i < storyIndex ? "100%" : i === storyIndex ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-3 right-3 flex items-center justify-between z-10 px-1">
        <div className="flex items-center gap-2">
          <img src={group.user.profilePic || "/avatar.png"} className="size-9 rounded-full object-cover ring-2 ring-white/40" alt="" />
          <div>
            <p className="text-white text-sm font-semibold">{group.user.fullName}</p>
            <p className="text-white/60 text-xs">{new Date(story.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isOwn && (
            <button
              className="btn btn-ghost btn-sm btn-circle text-white/80 hover:text-red-400"
              onClick={async () => { await deleteStory(story._id); advance(); }}
              title="Delete story"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <button className="btn btn-ghost btn-sm btn-circle text-white" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div className="w-full max-w-sm h-full max-h-[85vh] rounded-2xl overflow-hidden relative">
        {story.type === "image" ? (
          <img src={story.content} alt="story" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-8 text-white text-2xl font-bold text-center"
            style={{ background: story.bgColor || "#16a34a" }}
          >
            {story.content}
          </div>
        )}
      </div>

      {/* Tap zones */}
      <button className="absolute left-0 top-0 bottom-0 w-1/3" onClick={retreat} />
      <button className="absolute right-0 top-0 bottom-0 w-1/3" onClick={advance} />

      {/* Nav buttons (visible on desktop) */}
      <button className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-white/20 text-white border-none hidden md:flex" onClick={retreat}>
        <ChevronLeft className="size-4" />
      </button>
      <button className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-white/20 text-white border-none hidden md:flex" onClick={advance}>
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
};

export default StoryBar;
