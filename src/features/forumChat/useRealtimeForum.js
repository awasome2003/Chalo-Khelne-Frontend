import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, initSocket } from "../realtime/socketService";

export default function useRealtimeForum(forumId) {
  const qc = useQueryClient();
  const joinedRef = useRef(null);

  useEffect(() => {
    if (!forumId) return;

    let socket = getSocket();
    if (!socket) {
      initSocket();
      socket = getSocket();
    }
    if (!socket) return;

    // Join forum room
    if (joinedRef.current !== forumId) {
      if (joinedRef.current) socket.emit("leave:forum", { forumId: joinedRef.current });
      socket.emit("join:forum", { forumId });
      joinedRef.current = forumId;
    }

    // Listen for new messages
    const onMessage = (data) => {
      if (data.forumId !== forumId) return;
      qc.setQueryData(["forum-messages", forumId], (old) => {
        if (!old) return [data.message];
        // Prevent duplicates
        if (old.some((m) => m._id === data.message._id)) return old;
        return [...old, data.message];
      });
    };

    // Listen for forum updates (member add/remove)
    const onForumUpdate = (data) => {
      if (data.forumId !== forumId) return;
      qc.invalidateQueries({ queryKey: ["forum-room", forumId] });
    };

    socket.on("forum:message", onMessage);
    socket.on("forum:updated", onForumUpdate);

    return () => {
      socket.off("forum:message", onMessage);
      socket.off("forum:updated", onForumUpdate);
      if (joinedRef.current) {
        socket.emit("leave:forum", { forumId: joinedRef.current });
        joinedRef.current = null;
      }
    };
  }, [forumId, qc]);
}
