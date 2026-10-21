import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkflowStage } from '../types';
import { StageBadge, Badge } from '../components/common/Badge';
import { 
  GitBranch, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const WorkflowMonitorPage: React.FC = () => {
  const { 
    applications, 
    workflowConfigs, 
    activeUser, 
    transitionWorkflow,
    setActiveTab,
    setSelectedApplicationId,
    addToast
  } = useApp();

  const [selectedAppForTest, setSelectedAppForTest] = useState(applications[0]?.id || '');
  const [testTargetStage, setTestTargetStage] = useState<WorkflowStage>('Scrutiny');
  const [testResult, setTestResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  // SLA Turnaround Time Analysis data
  const slaChartData = workflowConfigs
    .filter(c => c.targetDays > 0)
    .map(c => {
      const stageApps = applications.filter(a => a.currentStage === c.stage);
      const avgDays = stageApps.length > 0 
        ? Math.round((stageApps.reduce((sum, a) => sum + a.daysInCurrentStage, 0) / stageApps.length) * 10) / 10
        : 0;

      return {
        stage: c.stage,
        targetDays: c.targetDays,
        actualAvgDays: avgDays,
        activeCount: stageApps.length
      };
    });

  // Calculate bottlenecks: stages where actualAvgDays > targetDays
  const bottleneckStages = slaChartData.filter(d => d.actualAvgDays > d.targetDays && d.activeCount > 0);

  const handleTestTransition = () => {
    const app = applications.find(a => a.id === selectedAppForTest);
    if (!app) return;

    const currentConfig = workflowConfigs.find(c => c.stage === app.currentStage);
    const isStageAllowed = currentConfig?.allowedNextStages.includes(testTargetStage);

    if (!isStageAllowed) {
      setTestResult({
        allowed: false,
        reason: `Disallowed by APH Policy! Applications in stage "${app.currentStage}" cannot transition directly to "${testTargetStage}". Permitted target stages are: ${currentConfig?.allowedNextStages.join(', ') || 'None'}.`
      });
      return;
    }

    // Role check
    if (activeUser.role === 'Read-Only Auditor') {
      setTestResult({
        allowed: false,
        reason: 'Blocked by RBAC: The "Read-Only Auditor" role is restricted from altering regulatory states.'
      });
      return;
    }

    if (testTargetStage === 'Approved' && activeUser.role !== 'Approval Officer' && activeUser.role !== 'System Administrator') {
      setTestResult({
        allowed: false,
        reason: `Blocked by RBAC: Transition to "Approved" mandates signing authority of an Approval Officer or System Administrator (Current user is ${activeUser.role}).`
      });
      return;
    }

    setTestResult({
      allowed: true,
      reason: `Validation Passed! Transition from "${app.currentStage}" to "${testTargetStage}" meets APH stage succession rules and role requirements for ${activeUser.role}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Regulatory Workflow Engine & SLA Monitor</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stage-wise workflow automation based on Approval Process Handbook (APH) 2026-27 procedural regulations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Deterministic Rules Active
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> SLA Tracking Enabled
          </span>
        </div>
      </div>

      {/* SLA Target vs Actual Turnaround Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stage Turnaround Days: Target SLA vs Actual Average</h3>
              <p className="text-xs text-slate-500">Compares configured target SLA against current processing duration</p>
            </div>
            {bottleneckStages.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                {bottleneckStages.length} Bottlenecks Identified
              </span>
            )}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                <YAxis unit="d" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="targetDays" name="Configured SLA Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualAvgDays" name="Actual Average Days" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottleneck Alert Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Identified Bottlenecks</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Stages where real-time application processing has breached configured turnaround targets:
            </p>

            <div className="space-y-3">
              {bottleneckStages.length === 0 ? (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-xs">
                  All active stages operating within SLA turnaround limits.
                </div>
              ) : (
                bottleneckStages.map(b => (
                  <div key={b.stage} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span>{b.stage}</span>
                      <span className="font-mono text-rose-600">+{Math.round((b.actualAvgDays - b.targetDays)*10)/10}d Over SLA</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Average {b.actualAvgDays} days spent vs {b.targetDays} days benchmark across {b.activeCount} applications.
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Escalation triggers fire automatically upon 120% target duration breach.
          </div>
        </div>
      </div>

      {/* Visual Workflow Stage Progression Sequence */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Approval Process Handbook (APH) Stage Matrix</h3>
          <p className="text-xs text-slate-500">Configured entry conditions, responsible roles and mandatory checklist gates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowConfigs.map((config, idx) => {
            const appsInStage = applications.filter(a => a.currentStage === config.stage);
            return (
              <div 
                key={config.stage} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{config.stage}</h4>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    {appsInStage.length} active
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <p><strong>Target SLA:</strong> {config.targetDays > 0 ? `${config.targetDays} calendar days` : 'Terminal Stage'}</p>
                  <p><strong>Custodian Role:</strong> {config.responsibleRole}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Checklist Gates:</p>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                    {config.requiredChecklist.map((chk, i) => (
                      <li key={i} className="truncate">{chk}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Permitted Next:</span>
                  <span className="text-blue-700 font-semibold truncate max-w-[150px]">
                    {config.allowedNextStages.length > 0 ? config.allowedNextStages.join(', ') : 'End of Cycle'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Stage Transition Tester */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Transition Rule & RBAC Validator</h3>
            <p className="text-xs text-slate-400">
              Test whether a specific application can advance to a target stage under current APH regulations and active role permissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Application</label>
            <select
              value={selectedAppForTest}
              onChange={(e) => { setSelectedAppForTest(e.target.value); setTestResult(null); }}
              className="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.applicationNumber} — {app.institutionName.substring(0, 28)}... ({app.currentStage})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Proposed Target Stage</label>
            <select
              value={testTargetStage}
              onChange={(e) => { setTestTargetStage(e.target.value as WorkflowStage); setTestResult(null); }}
              className="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workflowConfigs.map(c => (
                <option key={c.stage} value={c.stage}>{c.stage}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTestTransition}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              Validate Transition Feasibility
            </button>
          </div>
        </div>

        {/* Validation Output Box */}
        {testResult && (
          <div className={`p-4 rounded-xl border text-xs leading-relaxed animate-fade-in ${
            testResult.allowed 
              ? 'bg-teal-950/80 border-teal-700 text-teal-200' 
              : 'bg-rose-950/80 border-rose-700 text-rose-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold mb-1">
                {testResult.allowed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-teal-400" />
                    <span className="text-teal-300">Transition Permitted under Statutory Rules</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span className="text-rose-300">Transition Blocked by Governance Policy</span>
                  </>
                )}
              </div>
              {testResult.allowed && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedApplicationId(selectedAppForTest);
                      setActiveTab('applications');
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded border border-slate-700 transition-colors"
                  >
                    Open Dossier
                  </button>
                  <button
                    onClick={() => {
                      transitionWorkflow(
                        selectedAppForTest,
                        testTargetStage,
                        `Transition validated and executed via Workflow Policy Engine by ${activeUser.name} (${activeUser.role})`
                      );
                      addToast(
                        'Stage Advanced Successfully',
                        `Application transitioned to ${testTargetStage}`,
                        'success'
                      );
                      setTestResult(null);
                    }}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded shadow-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Advance Workflow Now
                  </button>
                </div>
              )}
            </div>
            <p className="text-[11px] opacity-90 mt-1">{testResult.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};
