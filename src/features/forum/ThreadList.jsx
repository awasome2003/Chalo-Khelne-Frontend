import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, TrendingUp, Clock, Flame, Plus, RefreshCcw } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useCategories, useThreads, useLikeThread } from "./useThreads";
import ThreadCard from "./ThreadCard";
import { PageHeader, Badge, EmptyState, Button } from "../../shared/ui";

export default function ThreadList() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const userId = auth?._id;

  const [activeCategory, setActiveCategory] = useState(null);
  const [sort, setSort] = useState("newest");

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useThreads(activeCategory, sort);
  const likeMutation = useLikeThread(userId);

  const threads = data?.threads || [];

  const sortOptions = [
    { key: "newest", label: "Newest", icon: Clock },
    { key: "popular", label: "Popular", icon: Flame },
    { key: "active", label: "Active", icon: TrendingUp },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Forum"
        subtitle={`${data?.pagination?.total || 0} discussions`}
        actions={
          <Button variant="primary" onClick={() => navigate("/forum/new")}>
            <Plus className="w-4 h-4" /> New Thread
          </Button>
        }
      />

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition w-auto ${
            !activeCategory ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition w-auto flex items-center gap-1 ${
              activeCategory === cat._id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-6">
        {sortOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition w-auto flex items-center gap-1 ${
                sort === opt.key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-3 h-3" /> {opt.label}
            </button>
          );
        })}
      </div>

      {/* Threads */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-2 bg-gray-100 rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No threads yet"
          description="Start a discussion!"
          action={<Button onClick={() => navigate("/forum/new")}>Create Thread</Button>}
        />
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <ThreadCard
              key={thread._id}
              thread={thread}
              userId={userId}
              onLike={(id) => likeMutation.mutate({ threadId: id })}
              onClick={() => navigate(`/forum/thread/${thread._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
