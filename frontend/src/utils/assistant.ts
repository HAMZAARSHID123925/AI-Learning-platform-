import { assistantFallback, assistantReplies } from '../data/assistant';
import { AssistantReply } from '../types/assistant';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findAssistantReply(input: string): AssistantReply {
  const text = input.toLowerCase();
  const match = assistantReplies.find((reply) =>
  reply.keywords.some((k) => new RegExp(`(^|[^a-z0-9/])${escapeRegex(k)}`).test(text))
  );
  return match ?? assistantFallback;
}