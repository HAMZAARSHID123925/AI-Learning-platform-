import { useCallback, useEffect, useRef, useState } from 'react';
import { findAssistantReply } from '../utils/assistant';
import { ChatMessage } from '../types/assistant';

const REPLY_DELAY_MS = 900;

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const counter = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const nextId = () => {
    counter.current += 1;
    return `msg-${counter.current}`;
  };

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: trimmed }]);
      setIsTyping(true);
      timer.current = window.setTimeout(() => {
        const reply = findAssistantReply(trimmed);
        setMessages((prev) => [
          ...prev,
          { 
            id: nextId(), 
            role: 'assistant', 
            text: reply.text, 
            secondaryText: reply.secondaryText,
            recommendation: reply.recommendation,
            followUps: reply.followUps 
          }
        ]);
        setIsTyping(false);
      }, REPLY_DELAY_MS);
    },
    [isTyping]
  );

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setMessages([]);
    setIsTyping(false);
  }, []);

  return { messages, isTyping, send, reset };
}