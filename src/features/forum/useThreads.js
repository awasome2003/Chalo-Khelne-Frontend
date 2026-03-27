import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import forumApi from "./forumApi";

const KEYS = {
  categories: ["forum-categories"],
  threads: (categoryId, sort) => ["forum-threads", categoryId || "all", sort || "newest"],
  thread: (id) => ["forum-thread", id],
};

export function useCategories() {
  return useQuery({ queryKey: KEYS.categories, queryFn: forumApi.getCategories });
}

export function useThreads(categoryId, sort = "newest", page = 1) {
  return useQuery({
    queryKey: KEYS.threads(categoryId, sort),
    queryFn: () => forumApi.getThreads({ categoryId, page, sort }),
  });
}

export function useThread(threadId) {
  return useQuery({
    queryKey: KEYS.thread(threadId),
    queryFn: () => forumApi.getThread(threadId),
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: forumApi.createThread,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-threads"] }),
  });
}

export function useLikeThread(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId }) => forumApi.likeThread({ threadId, userId }),
    onMutate: async ({ threadId }) => {
      await qc.cancelQueries({ queryKey: ["forum-threads"] });
      // Optimistic update on thread detail
      qc.setQueryData(KEYS.thread(threadId), (old) => {
        if (!old) return old;
        const liked = old.likes?.includes(userId);
        return {
          ...old,
          likes: liked ? old.likes.filter((id) => id !== userId) : [...(old.likes || []), userId],
        };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["forum-threads"] }),
  });
}
