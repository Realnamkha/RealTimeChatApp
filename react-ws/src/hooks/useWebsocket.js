import { useEffect, useRef, useState } from "react";

export function useWebSocket({ roomId, userId, name, onMessage }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ [WS OPEN] Connected to WebSocket server");
      setConnected(true);
      const joinPayload = {
        type: "JOIN_ROOM",
        payload: { name, userId, roomId },
      };
      ws.send(JSON.stringify(joinPayload));
    };

    ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        console.log("📥 Received:", type, payload);
        onMessage?.(type, payload);
      } catch (error) {
        console.error("❌ Message parse error:", error);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket closed");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [roomId, userId, name]);

  const send = (type, payload) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ Socket not ready");
      return;
    }
    socket.send(JSON.stringify({ type, payload }));
  };

  return { send, connected };
}
