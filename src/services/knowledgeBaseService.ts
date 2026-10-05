import { apiRequest } from './api';
import type { KnowledgeItem, Brand } from '../types/conversation';

export async function getBrands(): Promise<Brand[]> {
  return apiRequest<Brand[]>('/kb/brands');
}

export async function getKnowledgeItems(brandId?: string): Promise<KnowledgeItem[]> {
  const query = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
  return apiRequest<KnowledgeItem[]>(`/kb${query}`);
}

export async function createKnowledgeItem(
  data: Omit<KnowledgeItem, 'id' | 'updatedAt'>
): Promise<KnowledgeItem> {
  return apiRequest<KnowledgeItem>('/kb', {
    method: 'POST',
    body: data
  });
}

export async function updateKnowledgeItem(
  id: string,
  data: Partial<KnowledgeItem>
): Promise<KnowledgeItem> {
  return apiRequest<KnowledgeItem>(`/kb/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  return apiRequest<boolean>(`/kb/${id}`, {
    method: 'DELETE'
  });
}
