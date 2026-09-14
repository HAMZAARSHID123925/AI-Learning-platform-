"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning' | 'alert';
  timestamp: Date;
}

interface SSEContextType {
  isConnected: boolean;
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
}

const SSEContext = createContext<SSEContextType>({
  isConnected: false,
  toasts: [],
  removeToast: () => {},
});

export const useSSE = () => useContext(SSEContext);

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = {
      ...toast,
      id,
      timestamp: new Date(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 visible toasts

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  }, [removeToast]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;

    let abortController = new AbortController();
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
            if (!block.trim() || block.startsWith(':')) continue; // Heartbeat ping

            const eventMatch = block.match(/^event:\s*(.+)$/m);
            const dataMatch = block.match(/^data:\s*(.+)$/m);

            const eventType = eventMatch ? eventMatch[1].trim() : 'message';
            const rawData = dataMatch ? dataMatch[1].trim() : null;

            if (rawData) {
              try {
                const parsed = JSON.parse(rawData);
                if (eventType === 'notification' || parsed.title) {
                  addToast({
                    title: parsed.title || 'Live Notification',
                    body: parsed.body || parsed.message || 'You received a new update.',
                    type: parsed.notification_type === 'warning' ? 'warning' : 'info',
                  });
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
  }, [addToast]);

  return (
    <SSEContext.Provider value={{ isConnected, toasts, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-2xl bg-[#0f182c]/95 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
          >
            <div className="p-2 rounded-xl bg-[#027FFF]/10 text-[#5BC0EB] shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <Bell className="w-5 h-5 text-[#5BC0EB]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white leading-tight">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">{toast.body}</p>
              <span className="text-[10px] text-slate-500 mt-1.5 block">Just now</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </SSEContext.Provider>
  );
}
