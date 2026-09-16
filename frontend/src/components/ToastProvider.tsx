"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type?: ToastType;
  timestamp: Date;
}

interface ToastContextType {
  showToast: (title: string, body: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  isConnected: boolean;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  removeToast: () => {},
  isConnected: false,
});

export const useToast = () => useContext(ToastContext);

// Global helper so non-component files or callbacks can trigger toasts
let globalShowToast: ((title: string, body: string, type?: ToastType) => void) | null = null;

export const toast = {
  success: (title: string, body: string = '') => globalShowToast?.(title, body, 'success'),
  error: (title: string, body: string = '') => globalShowToast?.(title, body, 'error'),
  warning: (title: string, body: string = '') => globalShowToast?.(title, body, 'warning'),
  info: (title: string, body: string = '') => globalShowToast?.(title, body, 'info'),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, body: string = '', type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = {
      id,
      title,
      body,
      type,
      timestamp: new Date(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, [showToast]);

  // Real-time SSE Stream listener (auto-connects if token exists)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;

    if (token.startsWith('jwt_session_')) {
      setIsConnected(true);
      return;
    }

    const abortController = new AbortController();
    let isCancelled = false;

    async function startSSEStream() {
      try {
        const response = await fetch(`${API_BASE}/students/me/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          setIsConnected(false);
          return;
        }

        setIsConnected(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (!isCancelled) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const block of lines) {
            if (!block.trim() || block.startsWith(':')) continue; // Heartbeat

            const eventMatch = block.match(/^event:\s*(.+)$/m);
            const dataMatch = block.match(/^data:\s*(.+)$/m);

            const eventType = eventMatch ? eventMatch[1].trim() : 'message';
            const rawData = dataMatch ? dataMatch[1].trim() : null;

            if (rawData) {
              try {
                const parsed = JSON.parse(rawData);
                if (eventType === 'notification' || parsed.title) {
                  showToast(
                    parsed.title || 'Live Notification',
                    parsed.body || parsed.message || 'You received a new update.',
                    parsed.notification_type === 'warning' ? 'warning' : 'info'
                  );
                }
              } catch {
                // Ignore plain string parsing errors
              }
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setIsConnected(false);
        }
      }
    }

    startSSEStream();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, isConnected }}>
      {children}

      {/* Global Floating Toast Container (Top-Right) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-5 duration-300 ${
              t.type === 'success'
                ? 'bg-[#0f241d]/95 border-emerald-500/30'
                : t.type === 'error'
                ? 'bg-[#2a1215]/95 border-red-500/30'
                : t.type === 'warning'
                ? 'bg-[#2a1e0f]/95 border-amber-500/30'
                : 'bg-[#0f182c]/95 border-blue-500/30'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                t.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : t.type === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : t.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-[#027FFF]/20 text-[#5BC0EB]'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : t.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white leading-tight">{t.title}</h4>
              {t.body && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">{t.body}</p>
              )}
              <span className="text-[10px] text-slate-500 mt-1.5 block">Just now</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
