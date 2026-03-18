import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type JobUpdate = {
  jobId: string;
  status: "processing" | "done" | "failed";
  resultUrl?: string;
  errorMessage?: string;
};

export function useJobSocket(
  jobId: string | null,
  onUpdate: (update: JobUpdate) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const socket = io(`${WS_URL}/upscale`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("subscribe:job", jobId);
    });

    socket.on("job:updated", (data: JobUpdate) => {
      onUpdateRef.current(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId]);
}
