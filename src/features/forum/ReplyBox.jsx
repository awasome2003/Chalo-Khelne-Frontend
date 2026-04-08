import { useState } from "react";
import { Send, Heart, CornerDownRight, Clock } from "lucide-react";

export function ReplyInput({ onSubmit, submitting, parentReplyId = null, placeholder = "Write a reply..." }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit({ content: text.trim(), parentReplyId });
    setText("");
  };

  return (
    <div className={`flex gap-3 ${parentReplyId ? "ml-10" : ""}`}>
      <div className="flex-1 relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        className="self-end px-4 py-3 bg-orange-500 hover:bg-orange-700 text-white rounded-xl transition disabled:opacity-50 w-auto active:scale-[0.97]"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ReplyCard({ reply, userId, onLike, onReplyTo }) {
  const isLiked = reply.likes?.includes(userId);
  const isNested = !!reply.parentReplyId;

  const timeAgo = (d) => {
    if (!d) return "";
    const ms = Date.now() - new Date(d).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className={`${isNested ? "ml-10 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
          {reply.authorName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-800">{reply.authorName}</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {timeAgo(reply.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => onLike?.(reply._id)}
              className={`flex items-center gap-1 text-xs font-medium transition w-auto ${
                isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500" : ""}`} />
              {reply.likes?.length || 0}
            </button>
            {!isNested && (
              <button
                onClick={() => onReplyTo?.(reply._id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition w-auto"
              >
                <CornerDownRight className="w-3 h-3" /> Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
