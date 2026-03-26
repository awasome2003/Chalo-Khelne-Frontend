import { useState, useContext } from "react";
import { Plus, MessageCircle } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import usePosts from "./usePosts";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";

/**
 * Unified Social Feed component.
 * Renders the same feed for Manager, ClubAdmin, or any authenticated role.
 *
 * Props:
 * - canCreate: boolean (default true) — show create post button
 * - readOnly: boolean (default false) — gate all interactions
 * - onGatedAction: () => void — called when readOnly user tries to interact
 * - className: string — extra classes on wrapper
 */
export default function SocialFeed({
  canCreate = true,
  readOnly = false,
  onGatedAction,
  className = "",
}) {
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;
  const { posts, loading, createPost, creating, toggleLike, toggleSave } = usePosts(userId);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Social Feed</h1>
          <p className="text-sm text-gray-500">{posts.length} posts</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-2 bg-gray-100 rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No posts yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to share something!</p>
        </div>
      )}

      {/* Posts Grid */}
      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              userId={userId}
              onLike={toggleLike}
              onSave={toggleSave}
              readOnly={readOnly}
              onGatedAction={onGatedAction}
            />
          ))}
        </div>
      )}

      {/* Floating Create Button */}
      {canCreate && !readOnly && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#004E93] hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={createPost}
        loading={creating}
      />
    </div>
  );
}
