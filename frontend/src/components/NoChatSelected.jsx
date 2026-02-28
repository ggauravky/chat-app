import { Lock, Zap } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/60">
      <div className="max-w-md text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="size-24 rounded-3xl bg-green-500 flex items-center justify-center shadow-xl">
            <Zap className="size-14 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight">
          <span className="text-green-500">Z</span>app Web
        </h2>
        <p className="text-base-content/60 text-sm leading-relaxed max-w-xs mx-auto">
          Send and receive messages without keeping your phone online.
          <br />
          Use Zapp on multiple devices simultaneously.
        </p>

        <div className="flex items-center justify-center gap-2 text-base-content/40 text-xs pt-6 border-t border-base-300">
          <Lock className="size-3" />
          <span>Your personal messages are end-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
