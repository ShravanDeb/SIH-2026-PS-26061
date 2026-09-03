import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, ShieldAlert, Cpu, Sparkles, AlertCircle, Zap, Wind, Battery, Shield } from "lucide-react";
import { sendOperatorChatMessage } from "../services/stationApi";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isError?: boolean;
}

const SUGGESTIONS = [
  { label: "Why generator standby?", icon: Zap },
  { label: "Blizzard forecast?", icon: Wind },
  { label: "Battery runway?", icon: Battery },
  { label: "Turbine T-2 vibration", icon: AlertCircle },
  { label: "Life support status", icon: Shield },
];

export default function AIChatDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "**SIAPS Mission Control Copilot Online**\nMonitoring **Bharati & Maitri Stations** (East Antarctica).\n\nAutonomous microgrid dispatch is active. Ask me about **energy dispatch reasoning, weather advisories, battery runway, or equipment prognostics**.",
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

  const handleSend = async (customQuery?: string) => {
    const textToSend = (customQuery || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInput("");
    setLoading(true);

    try {
      const res = await sendOperatorChatMessage(textToSend);
      const aiReply = res?.response || res?.content || "No response received from SIAPS AI.";
      
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
          text: "Communication Error: Telemetry gateway offline.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Basic Markdown-like renderer for bold and bullets
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Bold handling
      let formatted: React.ReactNode = line;
      if (line.includes("**")) {
        const parts = line.split("**");
        formatted = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} style={{ color: "#38bdf8", fontWeight: 700 }}>{part}</strong> : part));
      }

      if (line.startsWith("• ")) {
        return (
          <div key={idx} style={{ display: "flex", gap: 6, margin: "3px 0", paddingLeft: 4 }}>
            <span style={{ color: "#38bdf8" }}>•</span>
            <span style={{ color: "#e2e8f0" }}>{line.slice(2)}</span>
          </div>
        );
      }

      return (
        <p key={idx} style={{ margin: "3px 0", minHeight: line.trim() ? "auto" : 8, color: "#cbd5e1" }}>
          {formatted}
        </p>
      );
    });
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      width: 440,
      maxWidth: "calc(100vw - 36px)",
      height: 600,
      maxHeight: "calc(100vh - 80px)",
      background: "rgba(10, 15, 29, 0.96)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(56, 189, 248, 0.25)",
      borderRadius: 18,
      boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.18)",
      display: "flex",
      flexDirection: "column",
      zIndex: 99999,
      overflow: "hidden",
      animation: "pageFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      {/* ── Modern Polar Header ── */}
      <div style={{
        padding: "16px 20px",
        background: "linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)",
        borderBottom: "1px solid rgba(56, 189, 248, 0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            position: "relative", width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #0284c7, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 15px rgba(14, 165, 233, 0.4)"
          }}>
            <Bot size={20} color="#fff" />
            <span style={{
              position: "absolute", bottom: -2, right: -2, width: 10, height: 10,
              borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a",
              boxShadow: "0 0 8px #10b981"
            }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", letterSpacing: "0.02em" }}>
                SIAPS Copilot
              </span>
              <span style={{
                fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                background: "rgba(16, 185, 129, 0.18)", color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                padding: "2px 7px", borderRadius: 4, letterSpacing: "0.08em"
              }}>
                Polar AI
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
              Bharati Station · 69°24′S 76°11′E
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#94a3b8", cursor: "pointer", padding: "6px 8px", borderRadius: 8,
            transition: "all 0.15s"
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Messages Feed ── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: 14,
        background: "radial-gradient(circle at top right, rgba(14, 165, 233, 0.05), transparent 70%)"
      }}>
        {messages.map(m => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "90%",
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start"
              }}
            >
              <div style={{
                padding: "12px 16px",
                borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                background: isUser
                  ? "linear-gradient(135deg, #0284c7, #2563eb)"
                  : "rgba(15, 23, 42, 0.85)",
                border: isUser
                  ? "1px solid rgba(14, 165, 233, 0.4)"
                  : "1px solid rgba(56, 189, 248, 0.2)",
                borderLeft: !isUser ? "3px solid #38bdf8" : undefined,
                boxShadow: isUser
                  ? "0 4px 15px rgba(2, 132, 199, 0.3)"
                  : "0 4px 20px rgba(0, 0, 0, 0.4)",
                fontSize: 12.5,
                lineHeight: 1.6
              }}>
                {isUser ? (
                  <span style={{ color: "#ffffff", fontWeight: 500 }}>{m.text}</span>
                ) : (
                  renderMessageContent(m.text)
                )}
              </div>
              <span style={{ fontSize: 9.5, color: "#64748b", marginTop: 4, fontFamily: "monospace" }}>
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: 12, alignSelf: "flex-start", boxShadow: "0 0 15px rgba(56, 189, 248, 0.1)"
          }}>
            <Cpu size={15} color="#38bdf8" className="animate-spin" />
            <span style={{ fontSize: 11.5, color: "#94a3b8", fontFamily: "monospace" }}>
              Querying live Bharati Station telemetry...
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Quick Smart Prompts (Polar Chips) ── */}
      <div style={{
        padding: "8px 14px", display: "flex", gap: 6, overflowX: "auto",
        borderTop: "1px solid rgba(56, 189, 248, 0.12)", background: "rgba(15, 23, 42, 0.7)"
      }}>
        {SUGGESTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => handleSend(s.label)}
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                color: "#93c5fd",
                borderRadius: 20,
                padding: "5px 11px",
                fontSize: 11,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(14, 165, 233, 0.2)";
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(30, 41, 59, 0.6)";
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.2)";
                e.currentTarget.style.color = "#93c5fd";
              }}
            >
              <Icon size={12} color="#38bdf8" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Input Bar ── */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid rgba(56, 189, 248, 0.15)",
        background: "#080e1a",
        display: "flex",
        gap: 10,
        alignItems: "center"
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          placeholder="Ask SIAPS AI about station operations..."
          style={{
            flex: 1,
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#f8fafc",
            fontSize: 12.5,
            outline: "none",
            transition: "border 0.15s"
          }}
          onFocus={e => (e.target.style.borderColor = "#38bdf8")}
          onBlur={e => (e.target.style.borderColor = "rgba(56, 189, 248, 0.25)")}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading
              ? "linear-gradient(135deg, #0284c7, #2563eb)"
              : "rgba(30, 41, 59, 0.5)",
            border: "none",
            borderRadius: 10,
            width: 40,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() && !loading ? "pointer" : "default",
            color: "#fff",
            boxShadow: input.trim() && !loading ? "0 0 15px rgba(2, 132, 199, 0.4)" : "none",
            transition: "all 0.15s"
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
