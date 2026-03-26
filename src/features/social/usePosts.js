import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import socialApi from "./socialApi";

const POSTS_KEY = ["posts"];

export default function usePosts(userId) {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: POSTS_KEY,
    queryFn: socialApi.fetchPosts,
  });

  const createMutation = useMutation({
    mutationFn: socialApi.createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POSTS_KEY }),
  });

  const likeMutation = useMutation({
    mutationFn: socialApi.toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: POSTS_KEY });
      const prev = queryClient.getQueryData(POSTS_KEY);
      queryClient.setQueryData(POSTS_KEY, (old) =>
        (old || []).map((p) => {
          if (p._id !== postId) return p;
          const liked = p.likes?.includes(userId);
          return {
            ...p,
            likes: liked
              ? p.likes.filter((id) => id !== userId)
              : [...(p.likes || []), userId],
          };
        })
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(POSTS_KEY, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: POSTS_KEY }),
  });

  const saveMutation = useMutation({
    mutationFn: socialApi.toggleSave,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: POSTS_KEY });
      const prev = queryClient.getQueryData(POSTS_KEY);
      queryClient.setQueryData(POSTS_KEY, (old) =>
        (old || []).map((p) => {
          if (p._id !== postId) return p;
          const saved = p.saves?.includes(userId);
          return {
            ...p,
            saves: saved
              ? p.saves.filter((id) => id !== userId)
              : [...(p.saves || []), userId],
          };
        })
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(POSTS_KEY, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: POSTS_KEY }),
  });

  return {
    posts,
    loading: isLoading,
    error,
    createPost: createMutation.mutateAsync,
    creating: createMutation.isPending,
    toggleLike: (postId) => likeMutation.mutate(postId),
    toggleSave: (postId) => saveMutation.mutate(postId),
  };
}
