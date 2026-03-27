import { useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Settings, RefreshCcw } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useForum, useMessages, useSendMessage } from "./useForumChat";
import useRealtimeForum from "./useRealtimeForum";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ForumChatPage() {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;
  const bottomRef = useRef(null);

  const { data: forum, isLoading: forumLoading } = useForum(forumId);
  const { data: messages = [], isLoading: msgLoading } = useMessages(forumId);
  const sendMutation = useSendMessage(forumId);

  // Real-time subscription
  useRealtimeForum(forumId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (forumLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><RefreshCcw className="w-6 h-6 text-gray-400 animate-spin" /></div>;
  }

  if (!forum) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Forum not found</p>
        <button onClick={() => navigate("/forum-chat")} className="mt-4 text-[#004E93] underline w-auto">Back</button>
      </div>
    );
  }

  const handleSend = ({ text, files }) => {
    sendMutation.mutate({
      senderId: userId,
      senderName: auth?.name || "User",
      senderRole: auth?.role || "Player",
      text,
      files,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate("/forum-chat")} className="p-2 hover:bg-gray-100 rounded-xl transition w-auto">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{forum.icon}</span>
            <h2 className="font-bold text-gray-800 text-sm truncate">{forum.name}</h2>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3" /> {forum.members?.length || 0} members
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F5F7FA]">
        {msgLoading ? (
          <div className="text-center text-gray-400 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg">{forum.icon}</p>
            <p className="font-medium mt-2">No messages yet</p>
            <p className="text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg._id} message={msg} isOwn={msg.senderId === userId} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} sending={sendMutation.isPending} />
    </div>
  );
}
