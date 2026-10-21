import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { ToastContainer } from './components/common/ToastContainer';

// 12 Page Modules
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { WorkflowMonitorPage } from './pages/WorkflowMonitorPage';
import { EvcSchedulingPage } from './pages/EvcSchedulingPage';
import { CompliancePage } from './pages/CompliancePage';
import { DocumentRegistryPage } from './pages/DocumentRegistryPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { UserRolesPage } from './pages/UserRolesPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'applications':
        return <ApplicationsPage />;
      case 'workflow':
        return <WorkflowMonitorPage />;
      case 'evc':
        return <EvcSchedulingPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'documents':
        return <DocumentRegistryPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ai_assistant':
        return <AiAssistantPage />;
      case 'roles':
        return <UserRolesPage />;
      case 'audit':
        return <AuditTrailPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Top Navbar */}
        <TopNavbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-fade-in">
          {renderActivePage()}
        </main>

        {/* Global Government Enterprise Footer */}
        <footer className="px-6 py-4 border-t border-slate-200 bg-white text-slate-500 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">All India Council for Technical Education (AICTE)</span>
            <span>•</span>
            <span className="text-slate-600">Ministry of Education, Government of India</span>
            <span>•</span>
            <span className="text-slate-400">Nelson Mandela Marg, Vasant Kunj, New Delhi-110070</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Approval Process Handbook: <strong>2026-27</strong></span>
            <span>•</span>
            <span className="text-teal-700 font-medium">STQC Audited & ISO 27001 Certified</span>
            <span>•</span>
            <span className="text-slate-400">Hosted on NIC Cloud</span>
          </div>
        </footer>
      </div>

      {/* Notification Slide-Over Drawer */}
      <NotificationDrawer />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
