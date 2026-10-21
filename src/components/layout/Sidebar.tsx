import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileCheck2,
  GitBranch,
  CalendarDays,
  ShieldCheck,
  FolderLock,
  BellRing,
  BarChart3,
  Sparkles,
  Users2,
  History,
  Sliders,
  X,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    applications, 
    alerts, 
    complianceItems, 
    evcSchedules,
    documents 
  } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status !== 'Resolved').length;
  const overdueComplianceCount = complianceItems.filter(c => c.status === 'Overdue').length;
  const pendingEvcCount = evcSchedules.filter(e => e.status === 'Proposed' || e.status === 'Awaiting Confirmation').length;
  const inProgressAppsCount = applications.filter(a => a.overallStatus === 'In Progress' || a.overallStatus === 'Action Required').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: FileCheck2,
      badge: inProgressAppsCount > 0 ? inProgressAppsCount : null,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'workflow',
      label: 'Workflow Monitor',
      icon: GitBranch,
      badge: null
    },
    {
      id: 'evc',
      label: 'EVC Scheduling',
      icon: CalendarDays,
      badge: pendingEvcCount > 0 ? pendingEvcCount : null,
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'compliance',
      label: 'Compliance Management',
      icon: ShieldCheck,
      badge: overdueComplianceCount > 0 ? `${overdueComplianceCount} Overdue` : null,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    {
      id: 'documents',
      label: 'Document Registry',
      icon: FolderLock,
      badge: documents.length
    },
    {
      id: 'alerts',
      label: 'Alerts & Escalations',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeColor: 'bg-rose-600 text-white animate-pulse'
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'ai_assistant',
      label: 'AI Assistant',
      icon: Sparkles,
      badge: 'AI Core',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'roles',
      label: 'User & Role Access',
      icon: Users2,
      badge: null
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Sliders,
      badge: null
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Official AICTE Council Emblem Logo */}
            <div className="w-10 h-10 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-md border border-slate-700 flex-shrink-0">
              <img 
                src="/aicte-logo.png" 
                alt="AICTE Official Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">ApprovaLens</span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-600">
                  APH 2026-27
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-semibold truncate leading-tight">
                AICTE Approval Intelligence
              </p>
              <p className="text-[9px] text-slate-400 truncate">Ministry of Education • Govt. of India</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Regulatory Workflows
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info Box */}
        <div className="p-3 m-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold text-slate-200">Approval Handbook</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">APH 2026-27</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Centralized Regulatory Approval & Compliance System • Govt. of India
          </p>
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> NIC Cloud Secured
            </span>
            <span className="text-slate-500 font-mono">v4.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
