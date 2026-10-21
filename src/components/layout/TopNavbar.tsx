import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Search, 
  RotateCcw, 
  ChevronDown, 
  UserCheck, 
  Menu,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '../../types';

interface TopNavbarProps {
  onToggleMobileSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    activeTab,
    setActiveTab,
    activeUser,
    setActiveUser,
    users,
    alerts,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsNotificationDrawerOpen,
    resetToDefaultData,
    applications,
    setSelectedApplicationId
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.status !== 'Resolved').length;

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Overview Dashboard', subtitle: 'Executive regulatory pipeline status, pendency metrics and operational health' },
    applications: { title: 'Applications Register', subtitle: 'Manage, scrutinize, and process technical institution approval petitions' },
    workflow: { title: 'Workflow Automation Monitor', subtitle: 'Stage-wise pipeline tracking, bottleneck diagnostics and SLA compliance' },
    evc: { title: 'Expert Visit Committee (EVC)', subtitle: 'Physical inspection coordination, peer-expert allocation and conflict detection' },
    compliance: { title: 'Compliance & Undertakings Registry', subtitle: 'Statutory undertakings, safety certifications, and deficiency monitoring' },
    documents: { title: 'Document Intelligence & Registry', subtitle: 'Centralized document repository with automated OCR field extraction' },
    alerts: { title: 'Alerts & Escalations Management', subtitle: 'Deterministic SLA tracking, expiration windows, and rule-based escalations' },
    analytics: { title: 'Regulatory Analytics & Reports', subtitle: 'Inflow trends, stage aging distributions, and officer workload intelligence' },
    ai_assistant: { title: 'AI Regulatory Assistant', subtitle: 'Explainable delay risk scoring, grounded APH handbook search, and query engine' },
    roles: { title: 'User & Role-Based Access Control', subtitle: 'Administrative permission matrix and role governance' },
    audit: { title: 'System Audit Trail & Accountability', subtitle: 'Immutable-style record of regulatory transitions, assignments, and approvals' },
    settings: { title: 'System Administration & Configuration', subtitle: 'Configure turnaround targets, reminder windows, and baseline directories' }
  };

  const currentMeta = pageTitles[activeTab] || { title: 'AICTE Approval Intelligence', subtitle: 'Approval Workflow & Compliance Management' };

  // Filtered live search results preview
  const searchResults = globalSearchQuery.trim()
    ? applications.filter(a => 
        a.applicationNumber.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        a.institutionName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        a.state.toLowerCase().includes(globalSearchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Government Official Top Masthead Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            GOVERNMENT OF INDIA
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-medium hidden sm:inline">Ministry of Education • AICTE Integrated Regulatory Platform</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            HACKATHON PROTOTYPE (SIH26262)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hidden md:inline">
            DEMO DATA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden lg:inline">
            Active Officer: <strong className="text-white">{activeUser.role}</strong> ({activeUser.name})
          </span>
          <button
            onClick={resetToDefaultData}
            title="Synchronize portal records to baseline demo dataset"
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Sync Demo Data
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger, AICTE Logo & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            title="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <img 
            src="/aicte-logo.png" 
            alt="AICTE Logo" 
            className="h-9 w-9 object-contain hidden sm:block border border-slate-200 rounded-lg p-0.5 bg-white shadow-xs" 
          />

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Portal</span>
              <span>/</span>
              <span className="text-blue-700 font-semibold">{currentMeta.title}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">
              {currentMeta.title}
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Application ID, Institution, State, Document..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick Search Dropdown Preview */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <p className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">Quick Matches</p>
              {searchResults.map(app => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApplicationId(app.id);
                    setActiveTab('applications');
                    setGlobalSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-blue-700 font-mono">{app.applicationNumber}</span>
                    <p className="text-slate-600 text-[11px] truncate">{app.institutionName}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">{app.currentStage}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions, Notifications & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Open Regulatory Alerts"
          >
            <Bell className="h-5 w-5" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                {activeUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-none">{activeUser.name}</p>
                <p className="text-[10px] text-blue-700 font-medium leading-tight mt-0.5">{activeUser.role}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in"
                onMouseLeave={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Designated Officer Authority</p>
                  <p className="text-[11px] text-slate-500">Switch role profile session</p>
                </div>

                <div className="space-y-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActiveUser(u);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        activeUser.id === u.id 
                          ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.role}</p>
                      </div>
                      {activeUser.id === u.id && <UserCheck className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1">
                  <button
                    onClick={() => {
                      setActiveTab('roles');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    View Complete Permissions Matrix →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
