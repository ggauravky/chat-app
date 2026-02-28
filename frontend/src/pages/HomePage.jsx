import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    // Full-screen layout — on mobile: show only sidebar OR chat, not both
    <div className="h-screen flex bg-base-200 overflow-hidden">
      {/* Sidebar: hidden on mobile when a chat is open */}
      <div className={`${selectedUser ? "hidden md:flex" : "flex"} h-full`}>
        <Sidebar />
      </div>

      {/* Chat panel: hidden on mobile when no chat selected */}
      <div className={`${!selectedUser ? "hidden md:flex" : "flex"} flex-1 h-full`}>
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};
export default HomePage;
