import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import forumChatApi from "./forumChatApi";

export function useForums(userId) {
  return useQuery({
    queryKey: ["forum-rooms", userId || "all"],
    queryFn: () => userId ? forumChatApi.getForums(userId) : forumChatApi.getAllForums(),
  });
}

export function useForum(forumId) {
  return useQuery({
    queryKey: ["forum-room", forumId],
    queryFn: () => forumChatApi.getForum(forumId),
    enabled: !!forumId,
  });
}

export function useMessages(forumId) {
  return useQuery({
    queryKey: ["forum-messages", forumId],
    queryFn: () => forumChatApi.getMessages(forumId),
    enabled: !!forumId,
  });
}

export function useCreateForum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: forumChatApi.createForum,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-rooms"] }),
  });
}

export function useSendMessage(forumId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => forumChatApi.sendMessage({ forumId, ...data }),
    // Don't invalidate — socket handles cache update
  });
}

export function useAddMember(forumId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => forumChatApi.addMember({ forumId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-room", forumId] }),
  });
}

export function useRemoveMember(forumId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => forumChatApi.removeMember({ forumId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-room", forumId] }),
  });
}
