import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getDashboardStats } from '../services/dashboardService';
import { getConversations } from '../services/conversationService';
import type { DashboardStats } from '../types/dashboard';
import type { Conversation } from '../types/conversation';

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, convsData] = await Promise.all([
          getDashboardStats(),
          getConversations(),
        ]);
        setStats(statsData);
        setConversations(convsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /** Get initials from a full name */
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  /** Format timestamp to relative time display */
  function formatTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>⚠️ Unable to load dashboard</h2>
        <p>{error}</p>
        <button className="new-conversation" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <div>
          <h1>Dashboard</h1>
          <p>Manage customer conversations with AI assistance.</p>
        </div>
        <button className="new-conversation" onClick={() => navigate('/conversation')}>
          + New Conversation
        </button>
      </header>

      {/* Stats */}
      {stats && (
        <section className="stats">
          <StatCard icon="💬" label="Total Conversations" value={stats.totalConversations} />
          <StatCard icon="⏳" label="Pending Conversations" value={stats.pendingConversations} />
          <StatCard icon="✓" label="Resolved Conversations" value={stats.resolvedConversations} />
          <StatCard icon="✨" label="AI Suggested Replies" value={stats.aiSuggestedReplies} />
        </section>
      )}

      {/* Recent Conversations */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2>Recent Conversations</h2>
            <p>Latest customer conversations requiring attention.</p>
          </div>
          <button className="view-all" onClick={() => navigate('/conversation')}>
            View All
          </button>
        </div>

        <div className="conversation-list">
          {conversations.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className="conversation"
                onClick={() => navigate(`/conversation?id=${conv.id}`)}
              >
                <div className="customer-avatar">{getInitials(conv.customerName)}</div>

                <div className="conversation-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <strong>{conv.customerName}</strong>
                    <span className="brand-tag">{conv.brandName}</span>
                    {conv.orderInfo && (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>• {conv.orderInfo.orderId}</span>
                    )}
                  </div>
                  <p>{conv.lastMessage}</p>
                </div>

                <PriorityBadge priority={conv.priority} />
                <StatusBadge status={conv.status} />
                <span className="time">{formatTime(conv.updatedAt)}</span>
              </button>
            ))
          )}
        </div>
      </section>
    </>
  );
}

export default DashboardPage;