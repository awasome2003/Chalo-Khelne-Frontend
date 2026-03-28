import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import groupChatApi from "./groupChatApi";

export function useChats(userId) {
  return useQuery({
    queryKey: ["group-chats", userId],
    queryFn: () => groupChatApi.getChats(userId),
    enabled: !!userId,
  });
}

export function useChat(chatId) {
  return useQuery({
    queryKey: ["group-chat", chatId],
    queryFn: () => groupChatApi.getChat(chatId),
    enabled: !!chatId,
  });
}

export function useMessages(chatId) {
  return useQuery({
    queryKey: ["group-chat-msgs", chatId],
    queryFn: () => groupChatApi.getMessages(chatId),
    enabled: !!chatId,
    refetchInterval: 10000,
  });
}

export function useCreateChat(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: groupChatApi.createChat,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-chats", userId] }),
  });
}

export function useSendMessage(chatId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => groupChatApi.sendMessage({ chatId, ...data }),
    onSuccess: (msg) => {
      qc.setQueryData(["group-chat-msgs", chatId], (old) => [...(old || []), msg]);
    },
  });
}

export function useAddMember(chatId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => groupChatApi.addMember({ chatId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-chat", chatId] }),
  });
}

export function useRemoveMember(chatId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => groupChatApi.removeMember({ chatId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-chat", chatId] }),
  });
}

export function useDeleteChat(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: groupChatApi.deleteChat,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-chats", userId] }),
  });
}
