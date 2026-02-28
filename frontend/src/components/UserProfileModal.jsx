import { X } from "lucide-react";

/* Shows when clicking a contact's avatar — name, photo, bio only */
const UserProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover strip */}
        <div className="h-24 bg-gradient-to-br from-green-400 to-teal-500 relative">
          <button
            className="absolute top-3 right-3 btn btn-circle btn-sm bg-black/30 border-none text-white hover:bg-black/50"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Avatar — overlaps cover */}
        <div className="flex flex-col items-center -mt-12 px-6 pb-8">
          <img
            src={user.profilePic || "/avatar.png"}
            alt={user.fullName}
            className="size-24 rounded-full object-cover ring-4 ring-base-100 shadow-lg"
          />
          <h2 className="mt-3 text-xl font-bold">{user.fullName}</h2>
          <p className="mt-1 text-sm text-base-content/60 text-center leading-relaxed max-w-xs">
            {user.about || "Hey there! I am using Zapp."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
