import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StageBadge, SeverityBadge, RiskBadge } from '../components/common/Badge';
import { 
  FileCheck2, 
  Hourglass, 
  AlertCircle, 
  CalendarClock, 
  ShieldAlert, 
  CheckCircle2, 
  FileWarning, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Building2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { 
    applications, 
    complianceItems, 
    documents, 
    alerts, 
    setActiveTab, 
    setSelectedApplicationId,
    workflowConfigs
  } = useApp();

  // Metric Computations
  const totalApps = applications.length;
  const underReviewApps = applications.filter(a => ['Scrutiny', 'Re-scrutiny', 'SAC/SHC Review', 'Decision Pending'].includes(a.currentStage)).length;
  const awaitingInstAction = applications.filter(a => a.currentStage === 'Returned for Correction' || a.overallStatus === 'Action Required').length;
  const pendingEvc = applications.filter(a => a.currentStage === 'EVC Pending').length;
  const overdueApps = applications.filter(a => {
    const config = workflowConfigs.find(c => c.stage === a.currentStage);
    return config && a.daysInCurrentStage > config.targetDays;
  }).length;

  const today = new Date();
  const next7Days = new Date(today.getTime() + 7 * 86400000);
  const complianceDueSoon = complianceItems.filter(c => {
    const due = new Date(c.dueDate);
    return due >= today && due <= next7Days && c.status !== 'Compliant';
  }).length;

  const expiredDocs = documents.filter(d => d.verificationStatus === 'Expired' || (d.expiryDate && new Date(d.expiryDate) < today)).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;

  // Pipeline stages distribution
  const STAGES_LIST = [
    'Submitted',
    'Scrutiny',
    'Re-scrutiny',
    'EVC Pending',
    'EVC Completed',
    'SAC/SHC Review',
    'Decision Pending',
    'Approved',
    'Returned for Correction'
  ];

  const stageData = STAGES_LIST.map(st => ({
    stage: st,
    count: applications.filter(a => a.currentStage === st).length
  }));

  // Status Distribution for Donut Chart
  const statusPieData = [
    { name: 'Approved', value: applications.filter(a => a.overallStatus === 'Approved').length, color: '#0d9488' },
    { name: 'In Progress', value: applications.filter(a => a.overallStatus === 'In Progress').length, color: '#2563eb' },
    { name: 'Action Required', value: applications.filter(a => a.overallStatus === 'Action Required').length, color: '#f59e0b' },
    { name: 'Returned', value: applications.filter(a => a.overallStatus === 'Returned').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // High priority / delay risk applications queue
  const priorityQueue = [...applications]
    .sort((a, b) => b.delayRiskScore - a.delayRiskScore)
    .slice(0, 5);

  // Upcoming deadlines
  const upcomingDeadlines = [...complianceItems]
    .filter(c => c.status !== 'Compliant')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome / Regulatory Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm border border-slate-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Academic Cycle 2026-27
            </span>
            <span className="text-xs text-slate-300">• AICTE Approval Process Handbook Automated Engine</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Institutional Approval & Compliance Overview
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Centralized monitoring console tracking {totalApps} applications, statutory undertakings, peer inspection visits, and SLA pendency across all regional directorates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('ai_assistant')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4" /> AI Risk Scoring & APH QA
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold transition-all"
          >
            All Applications <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={totalApps}
          subtitle="Registered in 2026-27 cycle"
          icon={FileCheck2}
          variant="blue"
          onClick={() => setActiveTab('applications')}
        />
        <StatCard
          title="Under Active Review"
          value={underReviewApps}
          subtitle="Scrutiny, SAC & Review"
          icon={Hourglass}
          variant="indigo"
          onClick={() => setActiveTab('workflow')}
        />
        <StatCard
          title="Awaiting Inst. Action"
          value={awaitingInstAction}
          subtitle="Returned for corrections"
          icon={AlertCircle}
          variant="amber"
          alertBadge={awaitingInstAction > 0 ? 'Requires Action' : undefined}
          onClick={() => setActiveTab('applications')}
        />
        <StatCard
          title="Pending EVC Visit"
          value={pendingEvc}
          subtitle="Physical verification needed"
          icon={CalendarClock}
          variant="teal"
          onClick={() => setActiveTab('evc')}
        />
        <StatCard
          title="Overdue Beyond SLA"
          value={overdueApps}
          subtitle="Exceeding stage target days"
          icon={Clock}
          variant="rose"
          alertBadge={overdueApps > 0 ? `${overdueApps} Overdue` : undefined}
          onClick={() => setActiveTab('workflow')}
        />
        <StatCard
          title="Compliance Due Soon"
          value={complianceDueSoon}
          subtitle="Due within next 7 days"
          icon={ShieldAlert}
          variant="amber"
          onClick={() => setActiveTab('compliance')}
        />
        <StatCard
          title="Expired Documents"
          value={expiredDocs}
          subtitle="Fire NOC, Lease, Building"
          icon={FileWarning}
          variant="rose"
          alertBadge={expiredDocs > 0 ? 'Expired' : undefined}
          onClick={() => setActiveTab('documents')}
        />
        <StatCard
          title="Critical Alerts"
          value={criticalAlerts}
          subtitle="Immediate officer attention"
          icon={TrendingUp}
          variant="rose"
          alertBadge={criticalAlerts > 0 ? 'Active' : undefined}
          onClick={() => setActiveTab('alerts')}
        />
      </div>

      {/* Pipeline Stage Bar Chart & Overall Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage Pipeline Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Pipeline by Stage</h3>
              <p className="text-xs text-slate-500">Live count of cases traversing AICTE approval stages</p>
            </div>
            <button
              onClick={() => setActiveTab('workflow')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              Workflow Monitor <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis 
                  dataKey="stage" 
                  angle={-30} 
                  textAnchor="end" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" name="Applications" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Application Status Distribution</h3>
            <p className="text-xs text-slate-500">Overall regulatory disposition</p>
            <div className="h-52 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Approval Rate: <strong>{Math.round((applications.filter(a => a.overallStatus === 'Approved').length / totalApps) * 100)}%</strong></span>
            <span>Total Tracked: <strong>{totalApps}</strong></span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Priority Risk Work Queue & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Work Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Priority Work Queue & Delay Risk</h3>
                <p className="text-xs text-slate-500">Applications calculated with high estimated processing delay</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('applications')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {priorityQueue.map(app => (
              <div
                key={app.id}
                onClick={() => {
                  setSelectedApplicationId(app.id);
                  setActiveTab('applications');
                }}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{app.applicationNumber}</span>
                    <StageBadge stage={app.currentStage} />
                    <RiskBadge score={app.delayRiskScore} level={app.delayRiskLevel} />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-sm">
                    {app.institutionName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Next: {app.nextAction} • {app.daysInCurrentStage} days in stage
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                    {app.assignedOfficer.split(' ')[1]}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Compliance Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Statutory Compliance Deadlines</h3>
                <p className="text-xs text-slate-500">Critical institutional undertakings and inspection due dates</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('compliance')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Compliance Register
            </button>
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.map(item => {
              const isOverdue = new Date(item.dueDate) < today;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('compliance')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer hover:shadow-xs transition-all ${
                    isOverdue 
                      ? 'bg-rose-50/40 border-rose-200' 
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{item.category}</span>
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                      isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isOverdue ? 'OVERDUE: ' : 'Due: '} {item.dueDate}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] truncate">{item.institutionName}</p>
                  <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">{item.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Ref: {item.aphRuleReference.substring(0, 32)}...</span>
                    <span className="font-semibold text-blue-700">Review Compliance →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
