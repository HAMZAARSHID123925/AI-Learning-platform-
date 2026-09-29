export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  followUps?: string[];
}

export interface AssistantReply {
  keywords: string[];
  text: string;
  followUps?: string[];
}