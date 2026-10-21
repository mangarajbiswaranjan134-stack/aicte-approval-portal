import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  Users, 
  FileCheck2, 
  ShieldCheck, 
  Filter 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { 
    applications, 
    complianceItems, 
    evcSchedules, 
    documents, 
    users 
  } = useApp();

  const [dateRangeFilter, setDateRangeFilter] = useState('2026-cycle');

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  applications.forEach(a => {
    stageCounts[a.currentStage] = (stageCounts[a.currentStage] || 0) + 1;
  });
  const stageData = Object.keys(stageCounts).map(stage => ({
    stage,
    count: stageCounts[stage]
  }));

  // Officer workload
  const officerWorkload: Record<string, { inProgress: number; approved: number }> = {};
  applications.forEach(a => {
    const officer = a.assignedOfficer;
    if (!officerWorkload[officer]) {
      officerWorkload[officer] = { inProgress: 0, approved: 0 };
    }
    if (a.overallStatus === 'Approved') officerWorkload[officer].approved += 1;
    else officerWorkload[officer].inProgress += 1;
  });
  const officerData = Object.keys(officerWorkload).map(officer => ({
    officer: officer.split(' ')[1] || officer,
    inProgress: officerWorkload[officer].inProgress,
    approved: officerWorkload[officer].approved
  }));

  // Monthly inflow trend (realistic simulated trend for 2026)
  const inflowTrendData = [
    { month: 'Jun 2026', applications: 8, clearances: 3 },
    { month: 'Jul 2026', applications: 18, clearances: 9 },
    { month: 'Aug 2026', applications: 35, clearances: 22 },
    { month: 'Sep 2026', applications: 54, clearances: 38 },
    { month: 'Oct 2026', applications: 72, clearances: 45 }
  ];

  // Compliance Breakdown Pie
  const complianceStatusCounts = [
    { name: 'Compliant', value: complianceItems.filter(c => c.status === 'Compliant').length, color: '#0d9488' },
    { name: 'Under Verification', value: complianceItems.filter(c => c.status === 'Under Verification').length, color: '#3b82f6' },
    { name: 'Awaiting', value: complianceItems.filter(c => c.status === 'Awaiting Submission').length, color: '#94a3b8' },
    { name: 'Overdue', value: complianceItems.filter(c => c.status === 'Overdue').length, color: '#ef4444' }
  ];

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export Summary Report CSV
  const handleExportSummaryCsv = () => {
    const headers = ['Category', 'Metric', 'Value'];
    const rows = [
      ['Applications', 'Total Received', applications.length],
      ['Applications', 'Approved', applications.filter(a => a.overallStatus === 'Approved').length],
      ['Applications', 'In Progress', applications.filter(a => a.overallStatus === 'In Progress').length],
      ['Compliance', 'Total Obligations', complianceItems.length],
      ['Compliance', 'Compliant', complianceItems.filter(c => c.status === 'Compliant').length],
      ['Compliance', 'Overdue', complianceItems.filter(c => c.status === 'Overdue').length],
      ['EVC', 'Total Visits Scheduled', evcSchedules.length],
      ['EVC', 'Completed Visits', evcSchedules.filter(e => e.status === 'Completed').length],
      ['Documents', 'Total Documents Registered', documents.length],
      ['Documents', 'Verified Documents', documents.filter(d => d.verificationStatus === 'Verified').length]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `AICTE_Analytics_Executive_Summary_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Regulatory Analytics & Intelligence Reports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional processing velocities, officer case distribution, and compliance indices.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="2026-cycle">Approval Cycle 2026-27 (Full Period)</option>
            <option value="last-30">Last 30 Days</option>
            <option value="last-90">Last Quarter</option>
          </select>

          <button
            onClick={handleExportSummaryCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export Metrics CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Print Dossier Report
          </button>
        </div>
      </div>

      {/* Primary Charts: Monthly Inflow Trend & Officer Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Inflow vs Clearances */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Inflow vs Regulatory Dispositions</h3>
              <p className="text-xs text-slate-500">Monthly progression of submissions against clearances</p>
            </div>
            <span className="text-xs font-mono text-blue-600 font-semibold">+18% MoM Velocity</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inflowTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="applications" name="Applications Received" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="clearances" name="Completed Clearances" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Officer Workload Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Officer Workload & Docket Distribution</h3>
              <p className="text-xs text-slate-500">Active vs approved cases per assigned officer</p>
            </div>
            <span className="text-xs text-slate-500">Balanced Allocation</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officerData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="officer" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="inProgress" name="In Progress Cases" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved Cases" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Compliance Distribution & Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Rate Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Statutory Compliance Health</h3>
          <p className="text-xs text-slate-500 mb-2">Overall status across all institutional obligations</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceStatusCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {complianceStatusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Wise Pendency Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Stage Pendency & Case Volume Summary</h3>
          <p className="text-xs text-slate-500 mb-4">Complete breakdown of currently active applications</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {stageData.map(st => (
              <div key={st.stage} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 truncate block">{st.stage}</span>
                <span className="text-xl font-bold text-slate-900 block font-mono">{st.count}</span>
                <span className="text-[10px] text-slate-400">cases on docket</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
