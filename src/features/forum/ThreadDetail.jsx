import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Eye, Pin, Lock, Clock, Tag } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useThread, useLikeThread } from "./useThreads";
import { useReplies, useAddReply, useLikeReply } from "./useReplies";
import { ReplyInput, ReplyCard } from "./ReplyBox";

export default function ThreadDetail() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;

  const { data: thread, isLoading } = useThread(threadId);
  const { data: replies = [] } = useReplies(threadId);
  const addReply = useAddReply(threadId);
  const likeMutation = useLikeThread(userId);
  const likeReplyMutation = useLikeReply(userId);

  const [replyingTo, setReplyingTo] = useState(null);

  const isLiked = thread?.likes?.includes(userId);

  const formatText = (text) => {
    if (!text) return null;
    return text.split(/(@\w+|#\w+)/g).map((part, i) => {
      if (part.startsWith("@")) return <span key={i} className="text-orange-500 font-semibold">{part}</span>;
      if (part.startsWith("#")) return <span key={i} className="text-orange-500 font-semibold">{part}</span>;
      return <span key={i}>{part}</span>;
    });
  };

  const timeAgo = (d) => {
    if (!d) return "";
    const ms = Date.now() - new Date(d).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  // Group replies: top-level + nested
  const topReplies = replies.filter((r) => !r.parentReplyId);
  const nestedReplies = replies.filter((r) => r.parentReplyId);

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Thread not found</p>
        <button onClick={() => navigate("/forum")} className="mt-4 text-orange-500 underline w-auto">Back to Forum</button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate("/forum")} className="p-2 hover:bg-gray-100 rounded-xl transition w-auto">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <span className="text-sm text-gray-400">Forum</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium truncate">{thread.title}</span>
      </div>

      {/* Thread */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="p-6">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-[#2DA5FF] flex items-center justify-center text-white font-bold text-sm">
              {thread.authorName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-gray-800 text-sm">{thread.authorName}</span>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="font-medium text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">{thread.authorRole}</span>
                <Clock className="w-3 h-3" />
                <span>{timeAgo(thread.createdAt)}</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {thread.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
              {thread.isLocked && <Lock className="w-4 h-4 text-red-400" />}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-black text-gray-900 mb-3 leading-tight">{thread.title}</h1>

          {/* Content */}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
            {formatText(thread.content)}
          </div>

          {/* Tags */}
          {thread.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {thread.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
            <button
              onClick={() => likeMutation.mutate({ threadId: thread._id })}
              className={`flex items-center gap-1.5 text-sm font-medium transition w-auto ${
                isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
              {thread.likes?.length || 0}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageCircle className="w-4 h-4" /> {thread.replyCount || 0} replies
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Eye className="w-4 h-4" /> {thread.viewCount || 0} views
            </span>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">Replies ({replies.length})</h3>
        </div>

        <div className="px-6 divide-y divide-gray-50">
          {topReplies.map((reply) => (
            <div key={reply._id}>
              <ReplyCard
                reply={reply}
                userId={userId}
                onLike={(id) => likeReplyMutation.mutate({ replyId: id, threadId })}
                onReplyTo={(id) => setReplyingTo(replyingTo === id ? null : id)}
              />
              {/* Nested replies */}
              {nestedReplies.filter((nr) => nr.parentReplyId === reply._id).map((nested) => (
                <ReplyCard
                  key={nested._id}
                  reply={nested}
                  userId={userId}
                  onLike={(id) => likeReplyMutation.mutate({ replyId: id, threadId })}
                />
              ))}
              {/* Inline reply input */}
              {replyingTo === reply._id && (
                <ReplyInput
                  onSubmit={(data) => {
                    addReply.mutate({ ...data, authorId: userId, authorName: auth?.name, authorRole: auth?.role });
                    setReplyingTo(null);
                  }}
                  submitting={addReply.isPending}
                  parentReplyId={reply._id}
                  placeholder={`Reply to ${reply.authorName}...`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main reply input */}
        {!thread.isLocked && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <ReplyInput
              onSubmit={(data) => addReply.mutate({ ...data, authorId: userId, authorName: auth?.name, authorRole: auth?.role })}
              submitting={addReply.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
