import { Heart, MessageCircle, Eye, Pin, Lock, Clock } from "lucide-react";

export default function ThreadCard({ thread, userId, onLike, onClick }) {
  const isLiked = thread.likes?.includes(userId);
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
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-[#2DA5FF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {thread.authorName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <span className="text-sm font-bold text-gray-800">{thread.authorName}</span>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="font-medium text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">{thread.authorRole}</span>
              <Clock className="w-3 h-3" />
              <span>{timeAgo(thread.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {thread.isPinned && <Pin className="w-3.5 h-3.5 text-orange-500" />}
          {thread.isLocked && <Lock className="w-3.5 h-3.5 text-red-400" />}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-orange-500 transition-colors leading-snug">
        {thread.title}
      </h3>

      {/* Preview */}
      <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
        {thread.content}
      </p>

      {/* Tags */}
      {thread.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {thread.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
        <button
          onClick={(e) => { e.stopPropagation(); onLike?.(thread._id); }}
          className={`flex items-center gap-1 text-xs font-medium transition w-auto ${
            isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500" : ""}`} />
          {thread.likes?.length || 0}
        </button>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <MessageCircle className="w-3.5 h-3.5" /> {thread.replyCount || 0}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Eye className="w-3.5 h-3.5" /> {thread.viewCount || 0}
        </span>
        {thread.lastReplyBy && (
          <span className="ml-auto text-[10px] text-gray-400">
            Last reply by <span className="font-semibold text-gray-500">{thread.lastReplyBy}</span>
          </span>
        )}
      </div>
    </div>
  );
}
