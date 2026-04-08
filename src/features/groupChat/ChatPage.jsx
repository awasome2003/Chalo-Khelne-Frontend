import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, Trash2, X, Search, Loader2, RefreshCcw, Crown, AlertTriangle } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useChat, useMessages, useSendMessage, useAddMember, useRemoveMember, useDeleteChat } from "./useGroupChat";
import useRealtimeGroupChat from "./useRealtimeGroupChat";
import groupChatApi from "./groupChatApi";

// Reuse MessageBubble and MessageInput from forumChat
import MessageBubble from "../forumChat/MessageBubble";
import MessageInput from "../forumChat/MessageInput";

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;
  const bottomRef = useRef(null);

  const { data: chat, isLoading: chatLoading } = useChat(chatId);
  const { data: messages = [], isLoading: msgLoading } = useMessages(chatId);
  const sendMutation = useSendMessage(chatId);
  const addMemberMutation = useAddMember(chatId);
  const removeMemberMutation = useRemoveMember(chatId);
  const deleteMutation = useDeleteChat(userId);

  const isOwner = chat?.createdBy === userId;

  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useRealtimeGroupChat(chatId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 1) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const users = await groupChatApi.searchUsers(q);
      const memberIds = (chat?.members || []).map((m) => m.userId);
      setSearchResults(users.filter((u) => !memberIds.includes(u._id)));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const handleAddMember = async (user) => {
    await addMemberMutation.mutateAsync({ requesterId: userId, userId: user._id, name: user.name, role: user.role });
    setSearchResults(searchResults.filter((u) => u._id !== user._id));
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Remove this member?")) return;
    await removeMemberMutation.mutateAsync({ requesterId: userId, userId: memberId });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ chatId, requesterId: userId });
    navigate("/group-chat");
  };

  if (chatLoading) return <div className="flex items-center justify-center h-[60vh]"><RefreshCcw className="w-6 h-6 text-gray-400 animate-spin" /></div>;
  if (!chat) return <div className="p-8 text-center"><p className="text-red-500 font-semibold">Chat not found</p></div>;

  const handleSend = ({ text, files }) => {
    sendMutation.mutate({ senderId: userId, senderName: auth?.name || "User", senderRole: auth?.role || "Player", text, files });
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Main chat */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => navigate("/group-chat")} className="p-2 hover:bg-gray-100 rounded-xl transition w-auto">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-800 text-sm truncate">{chat.name}</h2>
              {isOwner && <Crown className="w-3.5 h-3.5 text-orange-500" />}
            </div>
            <p className="text-xs text-gray-400">{chat.members?.length || 0} members {isOwner && "· You own this chat"}</p>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl transition w-auto">
                  <UserPlus className="w-4 h-4" /> Add
                </button>
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition w-auto" title="Delete chat">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => setShowMembers(!showMembers)}
              className={`p-2 rounded-xl transition w-auto ${showMembers ? "bg-orange-500 text-white" : "hover:bg-gray-100 text-gray-500"}`}>
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F5F7FA]">
          {msgLoading ? (
            <div className="text-center text-gray-400 py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p className="font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
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

        <MessageInput onSend={handleSend} sending={sendMutation.isPending} />
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Members ({chat.members?.length || 0})</h3>
            <button onClick={() => setShowMembers(false)} className="p-1 hover:bg-gray-100 rounded-lg w-auto"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {(chat.members || []).map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-[#2DA5FF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                      {member.userId === chat.createdBy && <Crown className="w-3 h-3 text-orange-500 flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded capitalize">{member.role}</span>
                  </div>
                </div>
                {isOwner && member.userId !== chat.createdBy && (
                  <button onClick={() => handleRemoveMember(member.userId)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 w-auto">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <div className="p-3 border-t border-gray-100">
              <button onClick={() => setShowAddMember(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl transition">
                <UserPlus className="w-4 h-4" /> Add Member
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Add Member</h3>
              <button onClick={() => { setShowAddMember(false); setSearchQuery(""); setSearchResults([]); }} className="p-1.5 hover:bg-gray-100 rounded-lg w-auto">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name..." autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searching && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>}
                {!searching && searchQuery.length >= 1 && searchResults.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No users found</p>}
                {searchResults.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-[#2DA5FF] flex items-center justify-center text-white text-xs font-bold">
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-[10px] text-gray-400">{user.role} {user.email && `· ${user.email}`}</p>
                      </div>
                    </div>
                    <button onClick={() => handleAddMember(user)} disabled={addMemberMutation.isPending}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition w-auto disabled:opacity-50">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Chat?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently delete the chat and all {chat.messageCount || 0} messages. This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition w-auto">Cancel</button>
              <button onClick={handleDelete} disabled={deleteMutation.isPending}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition disabled:opacity-50 w-auto">
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
