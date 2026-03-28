import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, X, Search, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useForum, useMessages, useSendMessage, useAddMember, useRemoveMember } from "./useForumChat";
import useRealtimeForum from "./useRealtimeForum";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ForumChatPage() {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;
  const isSuperAdmin = auth?.role?.toLowerCase() === "superadmin";
  const bottomRef = useRef(null);

  const { data: forum, isLoading: forumLoading } = useForum(forumId);
  const { data: messages = [], isLoading: msgLoading } = useMessages(forumId);
  const sendMutation = useSendMessage(forumId);
  const addMemberMutation = useAddMember(forumId);
  const removeMemberMutation = useRemoveMember(forumId);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useRealtimeForum(forumId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Search users
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 1) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await axios.get(`/api/forum-chat/search-users?q=${query}`);
      const users = res.data?.users || [];
      // Filter out existing members
      const memberIds = (forum?.members || []).map((m) => m.userId?.toString());
      setSearchResults(users.filter((u) => !memberIds.includes(u._id?.toString())));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (user) => {
    await addMemberMutation.mutateAsync({
      userId: user._id,
      name: user.name || user.userName || "User",
      role: user.role || "Player",
    });
    setSearchResults(searchResults.filter((u) => u._id !== user._id));
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Remove this member?")) return;
    await removeMemberMutation.mutateAsync({ userId: memberId });
  };

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
    sendMutation.mutate({ senderId: userId, senderName: auth?.name || "User", senderRole: auth?.role || "Player", text, files });
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
          <button onClick={() => setShowMembers(!showMembers)} className="text-xs text-gray-400 flex items-center gap-1 hover:text-[#004E93] transition w-auto">
            <Users className="w-3 h-3" /> {forum.members?.length || 0} members
          </button>
        </div>

        {/* Add Member Button */}
        {isSuperAdmin && (
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#004E93] hover:bg-[#073E73] text-white text-xs font-semibold rounded-xl transition w-auto active:scale-[0.97]"
          >
            <UserPlus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {/* Members Drawer */}
      {showMembers && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Members</h4>
            <button onClick={() => setShowMembers(false)} className="p-1 hover:bg-gray-100 rounded w-auto">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <div className="space-y-1.5">
            {(forum.members || []).map((member) => (
              <div key={member.userId} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#004E93]/10 flex items-center justify-center text-[#004E93] text-xs font-bold">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-800">{member.name}</span>
                    <span className="text-[9px] text-gray-400 ml-1.5 bg-gray-100 px-1 py-0.5 rounded">{member.role}</span>
                  </div>
                </div>
                {isSuperAdmin && member.userId?.toString() !== userId && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition w-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition"
                />
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searching && (
                  <div className="text-center py-4 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </div>
                )}

                {!searching && searchQuery.length >= 1 && searchResults.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">No users found</p>
                )}

                {searchResults.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#004E93] to-[#2DA5FF] flex items-center justify-center text-white text-xs font-bold">
                        {(user.name || user.userName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name || user.userName}</p>
                        <p className="text-[10px] text-gray-400">{user.role || "Player"} • {user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user)}
                      disabled={addMemberMutation.isPending}
                      className="px-3 py-1.5 bg-[#004E93] hover:bg-[#073E73] text-white text-xs font-semibold rounded-lg transition w-auto disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
