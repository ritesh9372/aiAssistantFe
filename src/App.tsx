import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ConversationPage from './pages/ConversationPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/conversation" element={<ConversationPage />} />
          <Route path="/conversations" element={<ConversationPage />} />
          <Route path="/conversations/:id" element={<ConversationPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/knowledgebase" element={<KnowledgeBasePage />} />
          <Route path="/kb" element={<KnowledgeBasePage />} />
          <Route path="/brand-knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/knowledge" element={<KnowledgeBasePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;