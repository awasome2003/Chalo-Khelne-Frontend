import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Users, Plus, X, Clock, Loader2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useForums, useCreateForum } from "./useForumChat";
import { PageHeader, EmptyState, Button } from "../../shared/ui";

export default function ForumList() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;
  const isSuperAdmin = auth?.role?.toLowerCase() === "superadmin";

  const { data: forums = [], isLoading } = useForums(isSuperAdmin ? null : userId);
  const createMutation = useCreateForum();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("💬");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({
      name: newName.trim(),
      description: newDesc,
      createdBy: userId,
      createdByName: auth?.name || "SuperAdmin",
      icon: newIcon,
      members: [{ userId, name: auth?.name || "Admin", role: auth?.role || "SuperAdmin" }],
    });
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
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
      <PageHeader
        title="Forum Chat"
        subtitle={`${forums.length} rooms`}
        actions={
          isSuperAdmin && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Create Room
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="h-2 bg-gray-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : forums.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No forums yet"
          description={isSuperAdmin ? "Create a chat room to get started" : "You haven't been added to any forums yet"}
          action={isSuperAdmin && <Button onClick={() => setShowCreate(true)}>Create Room</Button>}
        />
      ) : (
        <div className="space-y-2">
          {forums.map((forum) => (
            <button
              key={forum._id}
              onClick={() => navigate(`/forum-chat/${forum._id}`)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all text-left flex gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                {forum.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{forum.name}</h3>
                  {forum.lastMessageAt && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {timeAgo(forum.lastMessageAt)}
                    </span>
                  )}
                </div>
                {forum.lastMessageText ? (
                  <p className="text-xs text-gray-500 truncate">
                    <span className="font-medium text-gray-600">{forum.lastMessageBy}:</span> {forum.lastMessageText}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No messages yet</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Users className="w-3 h-3" /> {forum.members?.length || 0}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <MessageCircle className="w-3 h-3" /> {forum.messageCount || 0}
                  </span>
                </div>
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
              <h3 className="text-lg font-bold text-gray-800">Create Chat Room</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg w-auto">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon</label>
                <div className="flex gap-2">
                  {["💬", "🏓", "🏸", "⚽", "🏏", "🎾", "🏆", "💪", "📢", "🔥"].map((emoji) => (
                    <button key={emoji} onClick={() => setNewIcon(emoji)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition w-auto ${newIcon === emoji ? "bg-orange-500/10 ring-2 ring-orange-500" : "bg-gray-100 hover:bg-gray-200"}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Room Name *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Table Tennis Strategy"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What's this room about?" rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-xl transition w-auto">Cancel</button>
                <button onClick={handleCreate} disabled={!newName.trim() || createMutation.isPending}
                  className="px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2 w-auto">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
