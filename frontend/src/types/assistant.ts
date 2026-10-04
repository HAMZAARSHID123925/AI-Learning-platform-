export interface RecommendationCard {
  tag?: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  courseId?: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  secondaryText?: string;
  recommendation?: RecommendationCard;
  followUps?: string[];
}

export interface AssistantReply {
  keywords: string[];
  text: string;
  secondaryText?: string;
  recommendation?: RecommendationCard;
  followUps?: string[];
}