import { apiRequest } from './api';
import type { Conversation, ConversationDetail, AIAnalysis } from '../types/conversation';

export async function getConversations(): Promise<Conversation[]> {
  return apiRequest<Conversation[]>('/conversations');
}

export async function getConversationById(id: string): Promise<ConversationDetail> {
  return apiRequest<ConversationDetail>(`/conversations/${id}`);
}

/**
 * Send message in conversation — supports both agent and customer personas
 * to test the complete loop end-to-end interactively.
 */
export async function sendMessage(
  conversationId: string,
  message: string,
  sender: 'customer' | 'agent' = 'agent'
): Promise<ConversationDetail> {
  return apiRequest<ConversationDetail>(`/conversations/${conversationId}/reply`, {
    method: 'POST',
    body: { message, sender }
  });
}

export async function generateReply(
  conversationId: string,
  tone: string = 'Professional',
  customerMessage?: string
): Promise<AIAnalysis> {
  return apiRequest<AIAnalysis>('/ai/generate-reply', {
    method: 'POST',
    body: { conversationId, tone, customerMessage }
  });
}
