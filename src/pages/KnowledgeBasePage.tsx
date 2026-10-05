import { useState, useEffect } from 'react';
import { getBrands, getKnowledgeItems, createKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem } from '../services/knowledgeBaseService';
import type { KnowledgeItem, Brand } from '../types/conversation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import './KnowledgeBasePage.css';

function KnowledgeBasePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('brand-glow');
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Edit / Create Modal state
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formCategory, setFormCategory] = useState<'refund' | 'return' | 'shipping' | 'cancellation'>('refund');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const brandList = await getBrands();
        setBrands(brandList);
        if (brandList.length > 0) {
          setSelectedBrand(brandList[0].id);
        }
      } catch (err) {
        setToast({ message: 'Failed to load brands', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedBrand) return;
    loadPolicies(selectedBrand);
  }, [selectedBrand]);

  async function loadPolicies(brandId: string) {
    try {
      setLoading(true);
      const data = await getKnowledgeItems(brandId);
      setItems(data);
    } catch {
      setToast({ message: 'Failed to load brand policies', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function handleStartCreate() {
    setIsCreating(true);
    setEditingItem(null);
    setFormCategory('refund');
    setFormTitle('');
    setFormContent('');
  }

  function handleStartEdit(item: KnowledgeItem) {
    setEditingItem(item);
    setIsCreating(false);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormContent(item.content);
  }

  async function handleSave() {
    if (!formTitle.trim() || !formContent.trim()) {
      setToast({ message: 'Please provide both title and content', type: 'error' });
      return;
    }

    try {
      if (isCreating) {
        await createKnowledgeItem({
          brandId: selectedBrand,
          category: formCategory,
          title: formTitle.trim(),
          content: formContent.trim()
        });
        setToast({ message: 'New policy added to Knowledge Base', type: 'success' });
      } else if (editingItem) {
        await updateKnowledgeItem(editingItem.id, {
          category: formCategory,
          title: formTitle.trim(),
          content: formContent.trim()
        });
        setToast({ message: 'Policy successfully updated', type: 'success' });
      }
      setIsCreating(false);
      setEditingItem(null);
      loadPolicies(selectedBrand);
    } catch {
      setToast({ message: 'Failed to save policy', type: 'error' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this policy from the knowledge base?')) return;
    try {
      await deleteKnowledgeItem(id);
      setToast({ message: 'Policy deleted', type: 'info' });
      loadPolicies(selectedBrand);
    } catch {
      setToast({ message: 'Failed to delete policy', type: 'error' });
    }
  }

  return (
    <div className="kb-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="header">
        <div>
          <h1>Brand Knowledge Base</h1>
          <p>Manage and test brand-specific policies (Return, Refund, Shipping, Cancellation) in real-time.</p>
        </div>
        <button className="new-conversation" onClick={handleStartCreate}>
          + Add New Policy
        </button>
      </header>

      {/* Brand Selector Tabs */}
      <div className="brand-selector-tabs">
        {brands.map((b) => (
          <button
            key={b.id}
            className={`brand-tab ${selectedBrand === b.id ? 'active' : ''}`}
            onClick={() => setSelectedBrand(b.id)}
          >
            <strong>{b.name}</strong>
            <span>{b.category}</span>
          </button>
        ))}
      </div>

      {/* Policy List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <LoadingSpinner message="Loading policies..." />
        </div>
      ) : (
        <div className="policy-grid">
          {items.map((item) => (
            <div key={item.id} className="policy-card">
              <div className="policy-card-header">
                <span className={`policy-category-badge category-${item.category}`}>
                  {item.category.toUpperCase()}
                </span>
                <div className="policy-card-actions">
                  <button className="btn-icon" onClick={() => handleStartEdit(item)} title="Edit policy">
                    ✏️
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDelete(item.id)} title="Delete policy">
                    🗑️
                  </button>
                </div>
              </div>

              <h3>{item.title}</h3>
              <p className="policy-card-content">{item.content}</p>

              <div className="policy-card-footer">
                <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreating || editingItem) && (
        <div className="kb-modal-backdrop">
          <div className="kb-modal">
            <h2>{isCreating ? 'Add Brand Policy' : 'Edit Policy'}</h2>
            <p className="modal-sub">Changes take effect immediately in the AI reply generator.</p>

            <div className="form-group">
              <label>Policy Category</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as any)}>
                <option value="refund">Refund Policy</option>
                <option value="return">Return Policy</option>
                <option value="shipping">Shipping Policy</option>
                <option value="cancellation">Cancellation Policy</option>
              </select>
            </div>

            <div className="form-group">
              <label>Policy Title</label>
              <input
                type="text"
                placeholder="e.g. 7-Day Broken Bottle Replacement Policy"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Policy Text / Rules</label>
              <textarea
                rows={5}
                placeholder="Enter the exact policy instructions for the AI to enforce..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </button>
              <button className="new-conversation" onClick={handleSave}>
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeBasePage;
