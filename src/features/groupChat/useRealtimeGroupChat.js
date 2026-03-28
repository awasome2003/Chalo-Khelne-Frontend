import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, initSocket } from "../realtime/socketService";

export default function useRealtimeGroupChat(chatId) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!chatId) return;
    let socket = getSocket();
    if (!socket) socket = initSocket();
    if (!socket) return;

    socket.emit("join:gchat", { chatId });

    const onMessage = (msg) => {
      if (msg.chatId !== chatId) return;
      qc.setQueryData(["group-chat-msgs", chatId], (old) => {
        if (!old) return [msg];
        if (old.some((m) => m._id === msg._id)) return old;
        return [...old, msg];
      });
    };

    const onUpdated = (data) => {
      if (data.chatId !== chatId) return;
      qc.invalidateQueries({ queryKey: ["group-chat", chatId] });
    };

    const onDeleted = (data) => {
      if (data.chatId !== chatId) return;
      qc.invalidateQueries({ queryKey: ["group-chats"] });
    };

    socket.on("gchat:message", onMessage);
    socket.on("gchat:updated", onUpdated);
    socket.on("gchat:deleted", onDeleted);

    return () => {
      socket.emit("leave:gchat", { chatId });
      socket.off("gchat:message", onMessage);
      socket.off("gchat:updated", onUpdated);
      socket.off("gchat:deleted", onDeleted);
    };
  }, [chatId, qc]);
}
