import { Heart, Bookmark, Share2, MapPin, ExternalLink, Trophy } from "lucide-react";
import { formatDescription } from "./formatText";

/**
 * Reusable post card. Works for all roles.
 *
 * Props:
 * - post: object
 * - userId: string (null for public/unauthenticated)
 * - onLike: (postId) => void
 * - onSave: (postId) => void
 * - readOnly: boolean (true = all actions gated)
 * - onGatedAction: () => void (called when readOnly user tries to interact)
 */
export default function PostCard({ post, userId, onLike, onSave, readOnly, onGatedAction }) {
  const isLiked = userId && post.likes?.includes(userId);
  const isSaved = userId && post.saves?.includes(userId);

  const handleAction = (action) => {
    if (readOnly && onGatedAction) {
      onGatedAction();
      return;
    }
    action();
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {post.user?.name?.charAt(0) || post.user?.userName?.charAt(0) || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 text-sm truncate">
              {post.user?.name || post.user?.userName || "User"}
            </span>
            {post.user?.role && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {post.user.role}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* Tournament Badge */}
      {post.tournamentName && (
        <div className="px-5 pb-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
            <Trophy className="w-3 h-3" />
            {post.tournamentName}
          </span>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-5 pb-3 text-sm text-gray-700 leading-relaxed">
          {formatDescription(post.caption)}
        </div>
      )}

      {/* Media */}
      {post.videoThumbnail && (
        <div className="px-5 pb-3">
          <img
            src={post.videoThumbnail}
            alt="Post media"
            className="w-full rounded-xl object-cover max-h-80"
          />
        </div>
      )}

      {/* Link */}
      {post.link && (
        <div className="px-5 pb-3">
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {post.link.length > 40 ? post.link.substring(0, 40) + "..." : post.link}
          </a>
        </div>
      )}

      {/* Location */}
      {post.location && (
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {post.location}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center border-t border-gray-50 px-5 py-3 gap-1">
        <button
          onClick={() => handleAction(() => onLike?.(post._id))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition w-auto ${
            isLiked
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => handleAction(() => onSave?.(post._id))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition w-auto ${
            isSaved
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-blue-600" : ""}`} />
          <span>{post.saves?.length || 0}</span>
        </button>

        <button
          onClick={() => handleAction(() => {})}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition w-auto"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
