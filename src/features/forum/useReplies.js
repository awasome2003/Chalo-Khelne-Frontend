import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import forumApi from "./forumApi";

export function useReplies(threadId) {
  return useQuery({
    queryKey: ["forum-replies", threadId],
    queryFn: () => forumApi.getReplies(threadId),
    enabled: !!threadId,
  });
}

export function useAddReply(threadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => forumApi.addReply({ threadId, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum-replies", threadId] });
      qc.invalidateQueries({ queryKey: ["forum-thread", threadId] });
    },
  });
}

export function useLikeReply(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ replyId }) => forumApi.likeReply({ replyId, userId }),
    onSettled: (_, __, { threadId }) => {
      qc.invalidateQueries({ queryKey: ["forum-replies", threadId] });
    },
  });
}
