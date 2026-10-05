import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import Toast from '../components/common/Toast';
import { getConversations, getConversationById, generateReply, sendMessage } from '../services/conversationService';
import { logInteraction } from '../services/logService';
import type { Conversation, ConversationDetail, AIAnalysis } from '../types/conversation';
import './ConversationPage.css';

function ConversationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedId = searchParams.get('id');

  // Role toggle: 'agent' or 'customer' for end-to-end loop testing
  const [activePersona, setActivePersona] = useState<'agent' | 'customer'>('agent');

  // Conversation list & detail
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [convLoading, setConvLoading] = useState(false);

  // AI panel state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [tone, setTone] = useState('Professional');
  const [aiReplyDraft, setAiReplyDraft] = useState('');

  // Inputs
  const [replyMessage, setReplyMessage] = useState('');
  const [customerInput, setCustomerInput] = useState('');

  // Toast & error
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Load conversation list */
  useEffect(() => {
    async function fetchList() {
      try {
        setListLoading(true);
        const data = await getConversations();
        setConversations(data);

        // Default to first conversation (flagship refund demo)
        if (!selectedId && data.length > 0) {
          navigate(`/conversation?id=${data[0].id}`, { replace: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setListLoading(false);
      }
    }
    fetchList();
  }, [navigate, selectedId]);

  /** Load selected conversation detail */
  useEffect(() => {
    if (!selectedId) return;

    async function fetchConversation() {
      try {
        setConvLoading(true);
        setAiAnalysis(null);
        setAiReplyDraft('');
        setReplyMessage('');
        setAiError(null);
        const data = await getConversationById(selectedId!);
        setConversation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
      } finally {
        setConvLoading(false);
      }
    }
    fetchConversation();
  }, [selectedId]);

  function getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /** Trigger AI reply generation through the RAG pipeline */
  const handleGenerateReply = useCallback(async () => {
    if (!selectedId) return;

    try {
      setAiLoading(true);
      setAiError(null);
      const analysis = await generateReply(selectedId, tone);
      setAiAnalysis(analysis);
      setAiReplyDraft(analysis.suggestedReply);
      setReplyMessage(analysis.suggestedReply);
      setToast({ message: 'AI reply generated using Knowledge Base', type: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate AI reply';
      setAiError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setAiLoading(false);
    }
  }, [selectedId, tone]);

  /** Send reply as Agent (Human-in-the-loop: approves edited response) */
  async function handleSendAgentReply() {
    const textToSend = (aiReplyDraft.trim() || replyMessage.trim());
    if (!selectedId || !textToSend) return;

    try {
      const updated = await sendMessage(selectedId, textToSend, 'agent');
      setConversation(updated);

      // Log interaction if AI was used for auditability
      if (aiAnalysis && conversation) {
        const customerMsgs = conversation.messages.filter((m) => m.sender === 'customer');
        const latestCustMsg = customerMsgs[customerMsgs.length - 1]?.message || '';
        await logInteraction({
          conversationId: selectedId,
          brandId: conversation.brandId,
          customerMessage: latestCustMsg,
          retrievedContext: aiAnalysis.retrievedContext,
          aiGeneratedReply: aiAnalysis.suggestedReply,
          agentEditedReply: textToSend,
          finalResponse: textToSend
        });
      }

      setReplyMessage('');
      setAiReplyDraft('');
      setAiAnalysis(null);
      setToast({ message: 'Reply successfully sent to customer', type: 'success' });
    } catch {
      setToast({ message: 'Failed to send message', type: 'error' });
    }
  }

  /** Send message as Customer (allows testing end-to-end loop live) */
  async function handleSendCustomerMessage() {
    if (!selectedId || !customerInput.trim()) return;

    try {
      const updated = await sendMessage(selectedId, customerInput.trim(), 'customer');
      setConversation(updated);
      setCustomerInput('');
      setToast({ message: 'Message sent as Customer. Switch to Agent Mode to reply!', type: 'info' });
    } catch {
      setToast({ message: 'Failed to send customer message', type: 'error' });
    }
  }

  function handleCopy(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToast({ message: 'Reply copied to clipboard', type: 'success' });
  }

  if (error && conversations.length === 0) {
    return (
      <div className="error-state">
        <h2>⚠️ Unable to load conversations</h2>
        <p>{error}</p>
        <button className="new-conversation" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="conversation-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header with Persona Switcher */}
      <div className="conversation-header">
        <div>
          <h1>Conversation Studio</h1>
          <p>AI-assisted customer support with Knowledge Base grounding and human-in-the-loop review.</p>
        </div>

        {/* Persona Switcher Toggle */}
        <div className="persona-toggle-container">
          <span className="persona-label">Testing Persona:</span>
          <button
            className={`persona-btn ${activePersona === 'agent' ? 'active-agent' : ''}`}
            onClick={() => setActivePersona('agent')}
          >
            🎧 Agent Mode
          </button>
          <button
            className={`persona-btn ${activePersona === 'customer' ? 'active-customer' : ''}`}
            onClick={() => setActivePersona('customer')}
          >
            👤 Customer Mode
          </button>
        </div>
      </div>

      <div className="conversation-three-col">
        {/* LEFT / MAIN AREA: Conversation List */}
        <div className="conv-list-panel">
          <div className="conv-list-header">
            <h3>Conversations</h3>
            <span className="conv-count">{conversations.length}</span>
          </div>

          {listLoading ? (
            <div className="panel-loading"><LoadingSpinner size="small" /></div>
          ) : (
            <div className="conv-list-items">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`conv-list-item ${selectedId === conv.id ? 'conv-list-item-active' : ''}`}
                  onClick={() => navigate(`/conversation?id=${conv.id}`)}
                >
                  <div className="conv-list-avatar">{getInitials(conv.customerName)}</div>
                  <div className="conv-list-info">
                    <div className="conv-list-name-row">
                      <strong>{conv.customerName}</strong>
                      <span className="brand-tag">{conv.brandName}</span>
                    </div>
                    <p className="conv-list-preview">{conv.lastMessage}</p>
                    <div className="conv-list-meta">
                      <PriorityBadge priority={conv.priority} />
                      <StatusBadge status={conv.status} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CENTER / MAIN: Customer Information & History */}
        <div className="conversation-panel">
          {convLoading ? (
            <div className="panel-loading"><LoadingSpinner message="Loading conversation..." /></div>
          ) : conversation ? (
            <>
              {/* Customer Profile & Brand Badge */}
              <div className="panel-header">
                <div className="customer-profile">
                  <div className="large-avatar">{getInitials(conversation.customerName)}</div>
                  <div>
                    <h2>{conversation.customerName}</h2>
                    <span className="customer-email-sub">{conversation.customerEmail} • {conversation.brandName}</span>
                  </div>
                </div>
                <StatusBadge status={conversation.status} />
              </div>

              {/* Basic Order Information Banner */}
              {conversation.orderInfo && (
                <div className="order-info-banner">
                  <div className="order-field">
                    <span>Order:</span> <strong>{conversation.orderInfo.orderId}</strong>
                  </div>
                  <div className="order-field">
                    <span>Item:</span> <strong>{conversation.orderInfo.item}</strong>
                  </div>
                  <div className="order-field">
                    <span>Delivery:</span> <strong>{conversation.orderInfo.deliveryDate}</strong>
                  </div>
                  <div className="order-field">
                    <span>Total:</span> <strong>{conversation.orderInfo.totalAmount}</strong>
                  </div>
                </div>
              )}

              {/* Message Stream */}
              <div className="messages">
                {conversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'customer' ? 'customer-message' : 'agent-message'}`}
                  >
                    <span className="message-label">
                      {msg.sender === 'customer' ? `👤 ${conversation.customerName}` : '🎧 Support Agent'}
                    </span>
                    <p>{msg.message}</p>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              {activePersona === 'customer' ? (
                <div className="message-input-area customer-mode-area">
                  <div className="mode-indicator customer-indicator">
                    👤 Customer Mode: Send a message to test how the AI assistant responds.
                  </div>
                  <textarea
                    placeholder="Type a customer message (e.g. 'I bought this product 3 days ago, can I get a refund?')..."
                    value={customerInput}
                    onChange={(e) => setCustomerInput(e.target.value)}
                  />
                  <div className="message-input-actions">
                    <button
                      className="send-customer-btn"
                      onClick={handleSendCustomerMessage}
                      disabled={!customerInput.trim()}
                    >
                      Send as Customer →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="message-input-area">
                  <textarea
                    placeholder="Type your reply here or use the AI Reply Assistant on the right..."
                    value={replyMessage}
                    onChange={(e) => {
                      setReplyMessage(e.target.value);
                      setAiReplyDraft(e.target.value);
                    }}
                  />
                  <div className="message-input-actions">
                    <button
                      className="generate-button"
                      onClick={handleGenerateReply}
                      disabled={aiLoading}
                    >
                      {aiLoading ? '⏳ Generating AI Reply...' : '✨ Generate Reply'}
                    </button>
                    <button
                      className="send-reply-button"
                      onClick={handleSendAgentReply}
                      disabled={!replyMessage.trim() && !aiReplyDraft.trim()}
                    >
                      Send Reply →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="panel-empty"><p>Select a conversation from the left to view.</p></div>
          )}
        </div>

        {/* RIGHT / AI ASSISTANT PANEL */}
        <div className="reply-panel">
          <div className="reply-header">
            <div>
              <h2>AI Reply Assistant</h2>
              <p>Grounded in Knowledge Base context</p>
            </div>
            <span className="ai-badge">Human-in-the-Loop</span>
          </div>

          {/* Tone Selector & Main Generate Action */}
          <div className="reply-controls">
            <div className="control">
              <label>Reply Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Professional</option>
                <option>Friendly</option>
                <option>Empathetic</option>
                <option>Concise</option>
              </select>
            </div>
            <div className="control">
              <button
                className="regenerate-btn"
                onClick={handleGenerateReply}
                disabled={aiLoading || !selectedId}
              >
                {aiAnalysis ? '↻ Regenerate' : '✨ Generate Reply'}
              </button>
            </div>
          </div>

          {/* AI Panel State Display */}
          {aiLoading ? (
            <div className="panel-loading">
              <LoadingSpinner message="Retrieving Knowledge Base articles & drafting reply..." />
            </div>
          ) : aiError ? (
            <div className="ai-error-box">
              <span className="error-icon">⚠️</span>
              <h4>AI Reply Error</h4>
              <p>{aiError}</p>
              <button className="secondary-btn" onClick={handleGenerateReply}>
                Retry Generation
              </button>
            </div>
          ) : aiAnalysis ? (
            <div className="ai-content-scroll">
              {/* Customer Intent & Sentiment */}
              <div className="ai-meta-grid">
                <div className="meta-card">
                  <span className="meta-label">Customer Intent</span>
                  <strong className="meta-value intent-value">{aiAnalysis.intent}</strong>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Sentiment</span>
                  <strong className={`meta-value sentiment-${aiAnalysis.sentiment.toLowerCase()}`}>
                    {aiAnalysis.sentiment}
                  </strong>
                </div>
              </div>

              {/* Relevant Knowledge Base Articles (Knowledge Used) */}
              <div className="retrieved-kb-section">
                <h3>Knowledge Used:</h3>
                <div className="sources-tag-list">
                  {aiAnalysis.sources && aiAnalysis.sources.length > 0 ? (
                    aiAnalysis.sources.map((src) => (
                      <span key={src.id} className="source-tag">
                        📄 {src.title}
                      </span>
                    ))
                  ) : (
                    <span className="source-tag muted">General Knowledge Guidelines</span>
                  )}
                </div>

                {/* Snippets from Retrieved Knowledge */}
                {aiAnalysis.retrievedContext && aiAnalysis.retrievedContext.map((kb) => (
                  <div key={kb.id} className="retrieved-kb-card">
                    <div className="kb-card-top">
                      <span className="kb-title">{kb.title}</span>
                      <span className="kb-category">{kb.category}</span>
                    </div>
                    <p>{kb.content}</p>
                  </div>
                ))}
              </div>

              {/* Guardrails Banner */}
              {aiAnalysis.guardrail && (
                <div
                  className={`guardrail-banner ${
                    !aiAnalysis.guardrail.policyFound
                      ? 'guardrail-warning'
                      : !aiAnalysis.guardrail.isWithinPolicy
                      ? 'guardrail-alert'
                      : 'guardrail-success'
                  }`}
                >
                  <div className="guardrail-title">
                    {!aiAnalysis.guardrail.policyFound
                      ? '⚠️ Information Not Found in KB'
                      : !aiAnalysis.guardrail.isWithinPolicy
                      ? '🛑 Policy Guardrail Active'
                      : '✓ Grounded in Company Policy'}
                  </div>
                  <p>{aiAnalysis.guardrail.notes}</p>
                </div>
              )}

              {/* AI Suggested Reply (Editable Textarea) */}
              <div className="ai-reply-section">
                <div className="section-label-row">
                  <h3>Suggested Reply</h3>
                </div>

                {/* Human-in-the-loop reminder */}
                <div className="review-notice-banner">
                  ℹ️ AI-generated suggestion — review and edit before sending.
                </div>

                <textarea
                  className="ai-editable-textarea"
                  value={aiReplyDraft}
                  onChange={(e) => {
                    setAiReplyDraft(e.target.value);
                    setReplyMessage(e.target.value);
                  }}
                  rows={5}
                  placeholder="Review or edit the suggested reply here..."
                />

                {/* Panel Actions */}
                <div className="ai-reply-actions-row">
                  <button
                    className="action-btn secondary-btn"
                    onClick={handleGenerateReply}
                    disabled={aiLoading}
                  >
                    ↻ Regenerate
                  </button>
                  <button
                    className="action-btn secondary-btn"
                    onClick={() => handleCopy(aiReplyDraft)}
                    disabled={!aiReplyDraft.trim()}
                  >
                    📋 Copy Reply
                  </button>
                  <button
                    className="action-btn primary-send-btn"
                    onClick={handleSendAgentReply}
                    disabled={!aiReplyDraft.trim()}
                  >
                    Send Reply →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="ai-empty-state">
              <div className="ai-empty-icon">💡</div>
              <h3>AI Reply Assistant Ready</h3>
              <p>Click "Generate Reply" to retrieve relevant Knowledge Base articles and draft an AI response.</p>
              <button
                className="generate-starter-btn"
                onClick={handleGenerateReply}
                disabled={aiLoading || !selectedId}
              >
                ✨ Generate Reply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationPage;