import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, ShieldAlert, Cpu, Sparkles, AlertCircle } from "lucide-react";
import { sendOperatorChatMessage } from "../services/stationApi";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isError?: boolean;
}

export default function AIChatDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "SIAPS AI Mission Control Copilot online. Monitoring Bharati & Maitri Antarctic Stations. You can ask me about renewable forecasting, battery runway, equipment anomalies, or energy dispatch reasoning.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendOperatorChatMessage(userMsg.text);
      const aiReply = res?.response || res?.content || "Unable to reach SIAPS AI Engine.";
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Communication error: SIAPS backend gateway is offline.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      width: 420,
      maxWidth: "calc(100vw - 48px)",
      height: 560,
      maxHeight: "calc(100vh - 100px)",
      background: "var(--sidebar)",
      border: "1px solid var(--sidebar-border)",
      borderRadius: 16,
      boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 25px rgba(99,102,241,0.15)",
      display: "flex",
      flexDirection: "column",
      zIndex: 9999,
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        background: "rgba(99,102,241,0.08)",
        borderBottom: "1px solid var(--sidebar-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Bot size={18} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>SIAPS Mission Copilot</span>
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                background: "rgba(16,185,129,0.15)", color: "#10b981",
                padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em"
              }}>
                Live AI
              </span>
            </div>
            <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0 }}>Bharati Station · 69°24′S 76°11′E</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "none", color: "var(--text-3)",
            cursor: "pointer", padding: 6, borderRadius: 6
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map(m => (
          <div
            key={m.id}
            style={{
              alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              display: "flex",
              flexDirection: "column",
              alignItems: m.sender === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div style={{
              padding: "10px 14px",
              borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
              background: m.sender === "user"
                ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                : "rgba(255,255,255,0.05)",
              border: m.sender === "user" ? "none" : "1px solid var(--sidebar-border)",
              color: m.isError ? "#ef4444" : "#f1f5f9",
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap"
            }}>
              {m.text}
            </div>
            <span style={{ fontSize: 9, color: "var(--text-3)", marginTop: 4 }}>{m.timestamp}</span>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, alignSelf: "flex-start" }}>
            <Cpu size={14} className="animate-spin" color="#6366f1" />
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>SIAPS AI evaluating telemetry...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: "6px 14px", display: "flex", gap: 6, overflowX: "auto", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        {["Battery runway?", "Why generator standby?", "Blizzard forecast?"].map(q => (
          <button
            key={q}
            onClick={() => { setInput(q); }}
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--sidebar-border)",
              color: "var(--text-2)", borderRadius: 6, padding: "4px 8px", fontSize: 10,
              cursor: "pointer", whiteSpace: "nowrap"
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: 12, borderTop: "1px solid var(--sidebar-border)", display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          placeholder="Ask SIAPS AI about station operations..."
          style={{
            flex: 1,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid var(--sidebar-border)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "#fff",
            fontSize: 12,
            outline: "none"
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? "#6366f1" : "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: 8,
            width: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() && !loading ? "pointer" : "default",
            color: "#fff"
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
