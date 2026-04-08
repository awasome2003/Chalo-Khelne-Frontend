import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageCircle, Users, Crown, X, Clock } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useChats, useCreateChat } from "./useGroupChat";

export default function ChatList() {
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;
  const navigate = useNavigate();

  const { data: chats = [], isLoading } = useChats(userId);
  const createMutation = useCreateChat(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    const chat = await createMutation.mutateAsync({
      name: name.trim(), description: desc, createdBy: userId,
      createdByName: auth?.name || "User", createdByRole: auth?.role || "Player",
    });
    setName(""); setDesc(""); setShowCreate(false);
    if (chat?._id) navigate(`/group-chat/${chat._id}`);
  };

  const timeAgo = (d) => {
    if (!d) return "";
    const ms = Date.now() - new Date(d).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Group Chats</h1>
          <p className="text-sm text-gray-500 mt-0.5">{chats.length} chat{chats.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-[#E55D00] text-white text-sm font-semibold rounded-xl transition shadow-sm w-auto active:scale-[0.97]">
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-20" />)}</div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No group chats yet</h3>
          <p className="text-sm text-gray-400 mt-1">Create one to start chatting!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <button key={chat._id} onClick={() => navigate(`/group-chat/${chat._id}`)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-[#2DA5FF] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {chat.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{chat.name}</h3>
                  {chat.isOwner && <Crown className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {chat.lastMessageText ? `${chat.lastMessageBy}: ${chat.lastMessageText}` : "No messages yet"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {chat.lastMessageAt && <span className="text-[10px] text-gray-400">{timeAgo(chat.lastMessageAt)}</span>}
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Users className="w-3 h-3" />{chat.members?.length}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Create Group Chat</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg w-auto"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Chat Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Table Tennis Squad"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
                <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's this chat about?"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-xl transition w-auto">Cancel</button>
                <button onClick={handleCreate} disabled={!name.trim() || createMutation.isPending}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 w-auto active:scale-[0.97]">
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
