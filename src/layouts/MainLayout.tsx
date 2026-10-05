import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">AI</div>
          <div>
            <h2>Datastraw CX</h2>
            <span>AI Reply Assistant</span>
          </div>
        </div>

        <nav className="nav">
          <button
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${isActive('/conversation') ? 'active' : ''}`}
            onClick={() => navigate('/conversation')}
          >
            <span>💬</span>
            Conversations
          </button>

          <button
            className={`nav-item ${isActive('/knowledge-base') ? 'active' : ''}`}
            onClick={() => navigate('/knowledge-base')}
          >
            <span>📚</span>
            Brand Knowledge Base
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user">
            <div className="avatar">RY</div>
            <div>
              <strong>Ritesh Yadav</strong>
              <span>CX Technical Lead</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
