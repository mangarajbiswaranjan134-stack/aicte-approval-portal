import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkflowStageConfig } from '../types';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  BellRing, 
  Clock, 
  FolderLock, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    workflowConfigs, 
    updateWorkflowConfigs, 
    resetToDefaultData, 
    activeUser,
    addToast 
  } = useApp();

  const [configs, setConfigs] = useState<WorkflowStageConfig[]>(workflowConfigs);
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [escalationThresholdHours, setEscalationThresholdHours] = useState('48');
  const [reminderWindows, setReminderWindows] = useState({
    w30: true,
    w14: true,
    w7: true,
    w3: true,
    w1: true
  });

  const handleStageDaysChange = (index: number, days: number) => {
    const updated = [...configs];
    updated[index].targetDays = Math.max(0, days);
    setConfigs(updated);
  };

  const handleSaveConfigs = () => {
    if (activeUser.role !== 'System Administrator') {
      addToast('Permission Denied', 'Only System Administrators can modify workflow turnaround SLAs.', 'error');
      return;
    }
    updateWorkflowConfigs(configs);
  };

  const handleReset = () => {
    if (window.confirm('Synchronize all database tables back to official Council Baseline state? Any unsaved edits will be refreshed.')) {
      resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">System Administration & Regulatory Configuration</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure stage turnaround SLAs, automated reminder triggers, and baseline regulatory parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restore Council Baseline
          </button>
          <button
            onClick={handleSaveConfigs}
            disabled={activeUser.role !== 'System Administrator'}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save SLA Rules
          </button>
        </div>
      </div>

      {/* Grid: Workflow Stage SLA Configuration & Reminder Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage Turnaround Days Configuration */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workflow Stage Turnaround SLA Targets (Days)</h3>
              <p className="text-xs text-slate-500">Benchmark processing thresholds triggering delay risk warnings</p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">APH 2026-27 Norms</span>
          </div>

          <div className="space-y-3">
            {configs.map((cfg, idx) => (
              <div 
                key={cfg.stage}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{cfg.stage}</h4>
                  <p className="text-[11px] text-slate-500">Responsible: {cfg.responsibleRole}</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-600 font-medium">Target Days:</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={cfg.targetDays}
                    onChange={(e) => handleStageDaysChange(idx, parseInt(e.target.value) || 0)}
                    disabled={activeUser.role !== 'System Administrator'}
                    className="w-16 text-center font-mono font-bold text-xs p-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                  />
                  <span className="text-[11px] text-slate-400">days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Thresholds & General Parameters */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Configurable Expiry Reminder Windows</h3>
            <p className="text-xs text-slate-500">
              Deterministic alerts dispatched prior to certificate expiration:
            </p>

            <div className="space-y-2 text-xs">
              {[
                { key: 'w30', label: '30 Days Prior (Early Advisory Notice)' },
                { key: 'w14', label: '14 Days Prior (Second Reminder)' },
                { key: 'w7', label: '7 Days Prior (Urgent Action Notification)' },
                { key: 'w3', label: '3 Days Prior (Critical Show-Cause Warning)' },
                { key: 'w1', label: '1 Day Prior (Immediate Expiry Notice)' }
              ].map(w => (
                <label key={w.key} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderWindows[w.key as keyof typeof reminderWindows]}
                    onChange={(e) => setReminderWindows(prev => ({ ...prev, [w.key]: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">{w.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Academic Year & Escalation Rule</h3>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Active Academic Cycle</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                >
                  <option value="2026-27">Academic Year 2026-27 (Current Active)</option>
                  <option value="2027-28">Academic Year 2027-28 (Future Planning)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Escalation Trigger Threshold</label>
                <select
                  value={escalationThresholdHours}
                  onChange={(e) => setEscalationThresholdHours(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                >
                  <option value="24">24 Hours of Unacknowledged SLA Breach</option>
                  <option value="48">48 Hours of Unacknowledged SLA Breach</option>
                  <option value="72">72 Hours of Unacknowledged SLA Breach</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
