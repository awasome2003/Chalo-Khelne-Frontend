import React, { useState, useEffect, useContext } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function CSocial() {
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;
  const token = localStorage.getItem("token");

  // Form state inside modal
  const [tournamentName, setTournamentName] = useState("");
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [location, setLocation] = useState("");

  // Posts state
  const [posts, setPosts] = useState([]);

  // Modal open state
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const extractTags = (text) => {
    const matches = text.match(/@(\w+)/g);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !tournamentName.trim() && !link.trim()) return;
    const tags = extractTags(caption);
    try {
      const res = await axios.post(
        `/api/posts`,
        { tournamentName, caption, tags, location, link },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPosts([res.data, ...posts]);
      // Reset form fields
      setTournamentName("");
      setCaption("");
      setLink("");
      setLocation("");
      // Close modal after submit
      setModalOpen(false);
    } catch (err) {
      console.error("Error creating post:", err.response || err);
      alert(err.response?.data?.message || "Post creation failed");
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await axios.post(
        `/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const toggleSave = async (postId) => {
    try {
      const res = await axios.post(
        `/api/posts/${postId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const formatDescription = (text) => {
    if (!text) return null;
    const words = text.split(/\s+/);
    return words.map((word, idx) => {
      if (word.startsWith("@")) {
        return (
          <span key={idx} className="text-blue-600 font-medium mr-1">
            {word}{" "}
          </span>
        );
      }
      if (word.startsWith("#")) {
        return (
          <span key={idx} className="text-purple-600 font-medium mr-1">
            {word}{" "}
          </span>
        );
      }
      return word + " ";
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 ">
      {/* Floating + button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6  text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
        aria-label="Create Post"
      >
        <FaPlus size={24} />
      </button>

      {/* Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-lg">
            {/* Modal header with title and close icon inline */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">
                Create a Post
              </h2>

              <button
                onClick={() => setModalOpen(false)}
                className="w-fit h-fit p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                aria-label="Close"
              >
                <FaTimes
                  size={20}
                  className="text-gray-600 hover:text-gray-900"
                />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Tournament Name"
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-300"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
              />
              <textarea
                rows="3"
                placeholder="Write caption with @tags and #hashtags..."
                className="w-full p-3 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring focus:ring-indigo-300"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location (optional)"
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-300"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <input
                type="text"
                placeholder="Optional Link (https://...)"
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-300"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition transform"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className=" mx-auto space-y-6 mt-2">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-10">
            No posts yet.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={
                    post.user?.profileImage ||
                    "https://i.pravatar.cc/150?img=22"
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {post.user?.name || "User"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {post.tournamentName && (
                <p className="text-sm text-gray-600 mb-1 italic">
                  {post.tournamentName}
                </p>
              )}

              <div className="text-gray-800 text-sm mb-3">
                {formatDescription(post.caption)}
              </div>

              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs underline block mb-3"
                >
                  {post.link}
                </a>
              )}

              <div className="flex justify-between items-center border-t pt-3 text-sm text-gray-500">
                <p>
                  {post.location && `${post.location} • `}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => toggleLike(post._id)}
                    className="flex items-center gap-1 group text-[#333] hover:bg-[#DBEAFE]"
                  >
                    <span>{post.likes?.length || 0}</span>
                    {post.likes?.some((like) => like._id === userId) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-[#333] group-hover:text-red-500" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleSave(post._id)}
                    className=" items-center gap-1 group text-[#333] hover:bg-[#DBEAFE]"
                  >
                    {post.saves?.some((save) => save._id === userId) ? (
                      <FaBookmark className="text-yellow-500" />
                    ) : (
                      <FaRegBookmark className="text-gray-400 hover:text-yellow-500" />
                    )}
                  </button>
                  <button className="items-center gap-1 group text-[#333] hover:bg-[#DBEAFE]">
                    <FaShareAlt className="text-gray-400 hover:text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CSocial;
