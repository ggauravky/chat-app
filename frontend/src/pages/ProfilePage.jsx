import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Info, Clock } from "lucide-react";
import { formatLastSeen } from "../lib/utils";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [about, setAbout] = useState(authUser?.about || "");
  const [editingAbout, setEditingAbout] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleAboutSave = async () => {
    await updateProfile({ about });
    setEditingAbout(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-base-300 rounded-xl shadow-lg p-6 space-y-6">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-sm text-base-content/50 mt-1">Your profile information</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                style={{ width: "128px", height: "128px", borderRadius: "50%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 w-9 h-9 flex items-center justify-center bg-base-content/20 hover:bg-base-content/30 rounded-full cursor-pointer shadow-md transition-colors duration-200 border border-base-content/10 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/50">
              {isUpdatingProfile ? "Uploading…" : "Click the camera icon to update your photo"}
            </p>
          </div>
            <div className="space-y-1">
              <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                <User className="size-3.5" /> Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-sm">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                <Mail className="size-3.5" /> Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-sm">{authUser?.email}</p>
            </div>

            {/* About - editable */}
            <div className="space-y-1">
              <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                <Info className="size-3.5" /> About
              </div>
              {editingAbout ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    maxLength={139}
                    autoFocus
                  />
                  <button className="btn btn-sm btn-primary" onClick={handleAboutSave} disabled={isUpdatingProfile}>
                    Save
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => { setAbout(authUser?.about || ""); setEditingAbout(false); }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  className="px-4 py-2.5 bg-base-200 rounded-lg border text-sm cursor-pointer hover:bg-base-300 transition-colors"
                  onClick={() => setEditingAbout(true)}
                  title="Click to edit"
                >
                  {authUser?.about || <span className="opacity-50">Add about</span>}
                </div>
              )}
            </div>

            {/* Account info */}
            <div className="bg-base-200 rounded-xl p-4">
              <h2 className="text-sm font-medium mb-3">Account Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-base-300">
                  <span className="text-base-content/60">Member Since</span>
                  <span>{authUser.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-base-300">
                  <span className="text-base-content/60 flex items-center gap-1">
                    <Clock className="size-3.5" /> Last Seen
                  </span>
                  <span className="text-xs">{formatLastSeen(authUser.lastSeen)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-base-content/60">Account Status</span>
                  <span className="text-green-500 font-medium">Active</span>
                </div>
              </div>
            </div>

        </div>{/* end card */}
      </div>
    </div>
  );
};
export default ProfilePage;
