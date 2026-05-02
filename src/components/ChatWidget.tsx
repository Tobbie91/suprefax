import { useState, useEffect, useRef } from "react";
import { getSocket } from "../socket";
import type { ChatMessage } from "../types/api";

interface Props {
  roomId: string;
  currentUserId: string;
}

const ChatWidget = ({ roomId, currentUserId }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("joinRoom", { roomId });

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const socket = getSocket();
    if (!input.trim() || !socket) return;
    const msg: ChatMessage = { roomId, senderId: currentUserId, text: input };
    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        background: "#fafafa",
      }}
    >
      <div style={{ height: 220, overflowY: "auto", marginBottom: 8 }}>
        {messages.length === 0 && (
          <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 80 }}>
            No messages yet
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.senderId === currentUserId ? "right" : "left",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: m.senderId === currentUserId ? "#3b82f6" : "#e5e7eb",
                color: m.senderId === currentUserId ? "#fff" : "#111",
                padding: "6px 10px",
                borderRadius: 10,
                fontSize: 13,
                maxWidth: "75%",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 14px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
