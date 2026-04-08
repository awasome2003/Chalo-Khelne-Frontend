import { useState } from "react";
import { X } from "lucide-react";

/**
 * Modal for creating a new post.
 * Used by Manager and ClubAdmin roles.
 */
export default function CreatePostModal({ isOpen, onClose, onSubmit, loading }) {
  const [tournamentName, setTournamentName] = useState("");
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [location, setLocation] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!caption.trim()) return;
    await onSubmit({
      tournamentName,
      caption,
      tags: [],
      location,
      link,
    });
    setTournamentName("");
    setCaption("");
    setLink("");
    setLocation("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Create Post</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition w-auto">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name</label>
            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="e.g. Pune Open 2026"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption *</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening in sports?"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition w-auto">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!caption.trim() || loading}
            className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition disabled:opacity-50 w-auto"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
