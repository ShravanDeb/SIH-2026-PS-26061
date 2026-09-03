import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "warning" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastCtx {
  toast: (kind: ToastKind, title: string, message?: string) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() { return useContext(Ctx); }

let _id = 0;

const STYLE: Record<ToastKind, { bg: string; border: string; icon: ReactNode; accent: string }> = {
  success: { bg: "#ECFDF5", border: "#A7F3D0", accent: "#0B7B5A", icon: <CheckCircle size={15} /> },
  warning: { bg: "#FFFBEB", border: "#FDE68A", accent: "#B45309", icon: <AlertTriangle size={15} /> },
  error:   { bg: "#FFF1F3", border: "#FECDD3", accent: "#BE1239", icon: <XCircle size={15} /> },
  info:    { bg: "#EEF2FF", border: "#C7D7FE", accent: "#1A56DB", icon: <Info size={15} /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((kind: ToastKind, title: string, message?: string) => {
    const id = ++_id;
    setToasts(p => [...p, { id, kind, title, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  }, []);

  const dismiss = (id: number) => setToasts(p => p.filter(t => t.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {/* Toast portal */}
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const s = STYLE[t.kind];
          return (
            <div
              key={t.id}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderLeft: `4px solid ${s.accent}`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                minWidth: 300,
                maxWidth: 380,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                pointerEvents: "all",
                animation: "slideInRight 0.22s ease",
              }}
            >
              <span style={{ color: s.accent, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>{t.title}</p>
                {t.message && (
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 3, lineHeight: 1.5 }}>{t.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94A3B8", padding: 2, display: "flex", alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Ctx.Provider>
  );
}
