export interface OrderInfo {
  orderId: string;
  item: string;
  orderDate: string;
  deliveryDate: string;
  status: 'delivered' | 'shipped' | 'processing';
  totalAmount: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
}

export interface KnowledgeItem {
  id: string;
  brandId: string;
  category: 'return' | 'refund' | 'shipping' | 'cancellation';
  title: string;
  content: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sender: 'customer' | 'agent';
  message: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  brandId: string;
  brandName: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'active' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  lastMessage: string;
  orderInfo: OrderInfo;
  updatedAt: string;
  createdAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface GuardrailCheck {
  isWithinPolicy: boolean;
  requiresEscalation: boolean;
  policyFound: boolean;
  notes: string;
}

export interface AIAnalysis {
  suggestedReply: string;
  intent: string;
  sentiment: string;
  sources: Array<{ id: string; title: string }>;
  retrievedContext: KnowledgeItem[];
  guardrail: GuardrailCheck;
  alternativeReply: string;
  confidence: number;
}

export interface InteractionLog {
  id: string;
  conversationId: string;
  brandId: string;
  customerMessage: string;
  retrievedContext: KnowledgeItem[];
  aiGeneratedReply: string;
  agentEditedReply: string;
  finalResponse: string;
  timestamp: string;
}

export interface AIReplyRequest {
  conversationId: string;
  tone: string;
}
