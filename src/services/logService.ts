import { apiRequest } from './api';
import type { InteractionLog } from '../types/conversation';

export async function getInteractionLogs(conversationId?: string): Promise<InteractionLog[]> {
  const query = conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : '';
  return apiRequest<InteractionLog[]>(`/logs${query}`);
}

export async function logInteraction(data: {
  conversationId: string;
  brandId: string;
  customerMessage: string;
  retrievedContext: unknown[];
  aiGeneratedReply: string;
  agentEditedReply: string;
  finalResponse: string;
}): Promise<InteractionLog> {
  return apiRequest<InteractionLog>('/logs', {
    method: 'POST',
    body: data
  });
}
