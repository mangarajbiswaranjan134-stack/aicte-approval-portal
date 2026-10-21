import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, ArrowUpRight, ShieldAlert, Clock } from 'lucide-react';
import { SeverityBadge } from '../common/Badge';

export const NotificationDrawer: React.FC = () => {
  const { 
    isNotificationDrawerOpen, 
    setIsNotificationDrawerOpen, 
    alerts, 
    acknowledgeAlert, 
    resolveAlert,
    setActiveTab
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  const activeAlerts = alerts.filter(a => a.status !== 'Resolved');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationDrawerOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Regulatory Alert Center</h3>
                <p className="text-xs text-slate-500">{activeAlerts.length} actionable alerts pending attention</p>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List of alerts */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ShieldAlert className="h-10 w-10 text-teal-500 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-700">All alerts clear</p>
                <p className="text-xs text-slate-400 mt-1">No active compliance or SLA breaches currently pending.</p>
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    alert.severity === 'Critical'
                      ? 'bg-rose-50/50 border-rose-200'
                      : alert.severity === 'High'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" /> {alert.createdAt.substring(5, 16)}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900 text-xs mt-1">
                    {alert.category}
                  </h4>
                  <p className="text-slate-600 text-[11px] font-medium mt-0.5 line-clamp-1">
                    {alert.institutionName}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                    {alert.explanation}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-500">
                      Assigned: {alert.responsibleOfficer}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {alert.status === 'Active' && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
                      >
                        <Check className="h-3 w-3" /> Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab('alerts');
                setIsNotificationDrawerOpen(false);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Open Full Alert Center <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-slate-400">Automated Deduplication On</span>
          </div>
        </div>
      </div>
    </div>
  );
};
