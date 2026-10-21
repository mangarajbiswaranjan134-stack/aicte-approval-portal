import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { APH_KNOWLEDGE_BASE, AphKnowledgeChunk } from '../data/mockData';
import { StageBadge, RiskBadge, SeverityBadge } from '../components/common/Badge';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Bot
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const { 
    applications, 
    complianceItems, 
    documents, 
    evcSchedules, 
    workflowConfigs,
    setActiveTab,
    setSelectedApplicationId
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'risk' | 'handbook' | 'queries'>('risk');

  // Risk Assessment State
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || '');

  // APH Handbook Assistant State
  const [handbookQuery, setHandbookQuery] = useState('');
  const [selectedClause, setSelectedClause] = useState<AphKnowledgeChunk | null>(null);

  // Operational Query State
  const [activeQueryKey, setActiveQueryKey] = useState<string>('overdue_apps');

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];

  // Dynamic Explainable Risk Factor Calculation
  const currentConfig = workflowConfigs.find(c => c.stage === selectedApp?.currentStage);
  const targetDays = currentConfig?.targetDays || 7;
  const isSlaBreached = selectedApp ? selectedApp.daysInCurrentStage > targetDays : false;

  const appDocs = selectedApp ? documents.filter(d => d.linkedApplicationId === selectedApp.id || d.institutionId === selectedApp.institutionId) : [];
  const hasExpiredDoc = appDocs.some(d => d.verificationStatus === 'Expired' || (d.expiryDate && new Date(d.expiryDate) < new Date()));
  const appCompliance = selectedApp ? complianceItems.filter(c => c.linkedApplicationId === selectedApp.id || c.institutionId === selectedApp.institutionId) : [];
  const hasOverdueCompliance = appCompliance.some(c => c.status === 'Overdue');

  // Filtered APH clauses based on search
  const filteredClauses = handbookQuery.trim()
    ? APH_KNOWLEDGE_BASE.filter(chunk => 
        chunk.topic.toLowerCase().includes(handbookQuery.toLowerCase()) ||
        chunk.clause.toLowerCase().includes(handbookQuery.toLowerCase()) ||
        chunk.chapter.toLowerCase().includes(handbookQuery.toLowerCase()) ||
        chunk.content.toLowerCase().includes(handbookQuery.toLowerCase()) ||
        chunk.keywords.some(k => k.toLowerCase().includes(handbookQuery.toLowerCase()))
      )
    : APH_KNOWLEDGE_BASE;

  // Natural Language Queries Execution
  const runOperationalQuery = () => {
    switch (activeQueryKey) {
      case 'overdue_apps':
        return applications.filter(a => {
          const cfg = workflowConfigs.find(c => c.stage === a.currentStage);
          return cfg && a.daysInCurrentStage > cfg.targetDays;
        });
      case 'compliance_7_days': {
        const today = new Date();
        const next7 = new Date(today.getTime() + 7 * 86400000);
        return complianceItems.filter(c => {
          const d = new Date(c.dueDate);
          return d >= today && d <= next7 && c.status !== 'Compliant';
        });
      }
      case 'expired_docs':
        return documents.filter(d => d.verificationStatus === 'Expired' || (d.expiryDate && new Date(d.expiryDate) < new Date()));
      case 'upcoming_evc':
        return evcSchedules.filter(e => e.status === 'Scheduled' || e.status === 'Proposed');
      default:
        return [];
    }
  };

  const queryResults = runOperationalQuery();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-blue-300">Explainable Decision Intelligence</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">AICTE Regulatory AI Assistant</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Transparent rules-grounded intelligence for delay risk scoring, verified Approval Process Handbook (APH 2026-27) clause citations, and instant natural language database queries.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveSubTab('risk')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeSubTab === 'risk' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Delay Risk Engine
            </button>
            <button
              onClick={() => setActiveSubTab('handbook')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeSubTab === 'handbook' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              APH Policy QA & Citations
            </button>
            <button
              onClick={() => setActiveSubTab('queries')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeSubTab === 'queries' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Operational Queries
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: DELAY RISK ASSESSMENT */}
      {activeSubTab === 'risk' && (
        <div className="space-y-6">
          {/* Application Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Application to Analyze Delay Factors:
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.applicationNumber} — {app.institutionName} ({app.currentStage})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge score={selectedApp?.delayRiskScore || 0} level={selectedApp?.delayRiskLevel || 'Low'} />
              <button
                onClick={() => {
                  setSelectedApplicationId(selectedApp.id);
                  setActiveTab('applications');
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Open Dossier <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Risk Breakdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Score Gauge & Verdict */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Calculated Risk Index
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                    {selectedApp.delayRiskScore}
                  </span>
                  <span className="text-lg text-slate-400 font-semibold">/ 100</span>
                </div>
                <div className="mt-2">
                  <RiskBadge score={selectedApp.delayRiskScore} level={selectedApp.delayRiskLevel} />
                </div>
                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                  Estimated based on real-time stage elapsed time ({selectedApp.daysInCurrentStage}d / target {targetDays}d), document validity, and statutory compliance status.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">Evaluation Algorithm Version</p>
                <p className="text-xs font-semibold text-slate-700">Deterministic Weighted Decision Tree V2.4</p>
              </div>
            </div>

            {/* Center: Factor Weights Breakdown */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Explainable Delay Factors & Evidence</h3>

              <div className="space-y-3 text-xs">
                {/* Factor 1: Stage Elapsed Days */}
                <div className={`p-3 rounded-lg border ${
                  isSlaBreached ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">1. Stage Turnaround Time vs Target Benchmark</span>
                    <span className={isSlaBreached ? 'text-rose-700 font-bold' : 'text-teal-700'}>
                      {isSlaBreached ? `BREACHED (+${selectedApp.daysInCurrentStage - targetDays}d)` : 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Application has spent <strong>{selectedApp.daysInCurrentStage} days</strong> in {selectedApp.currentStage} stage (Target turnaround: {targetDays} days).
                  </p>
                </div>

                {/* Factor 2: Document Health */}
                <div className={`p-3 rounded-lg border ${
                  hasExpiredDoc ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">2. Statutory Document Clearances (Fire NOC, Lease, Building)</span>
                    <span className={hasExpiredDoc ? 'text-rose-700 font-bold' : 'text-teal-700'}>
                      {hasExpiredDoc ? 'DOCUMENT DISCREPANCY DETECTED' : 'ALL CLEAR'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {hasExpiredDoc 
                      ? 'One or more required certificates (e.g. Fire Safety / Lease) are expired or pending verification.' 
                      : 'All required documents verified with valid expiry dates.'}
                  </p>
                </div>

                {/* Factor 3: Compliance Obligations */}
                <div className={`p-3 rounded-lg border ${
                  hasOverdueCompliance ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">3. Statutory Undertakings & Deficiencies</span>
                    <span className={hasOverdueCompliance ? 'text-amber-700 font-bold' : 'text-teal-700'}>
                      {hasOverdueCompliance ? 'OVERDUE DEFICIENCIES ON RECORD' : 'COMPLIANT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {hasOverdueCompliance 
                      ? 'Institution has unrectified deficiencies from previous scrutiny or expired extension requests.'
                      : 'No critical outstanding compliance obligations flagged.'}
                  </p>
                </div>
              </div>

              {/* Recommended Next Action */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Recommended Next Regulatory Step:</span>
                  <p className="text-[11px] text-blue-800 mt-0.5">{selectedApp.nextAction}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: APH HANDBOOK ASSISTANT (GROUNDED POLICY SEARCH) */}
      {activeSubTab === 'handbook' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search APH 2026-27 clauses (e.g. 'land requirement', 'cadre ratio', 'evc sop', 'fire noc', '15 days')..."
                value={handbookQuery}
                onChange={(e) => setHandbookQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Quick Topics:</span>
              {['Land Norms', 'Faculty Cadre Ratio', 'Fire NOC', 'EVC Protocol', 'Scrutiny 15 Days', 'Hearing SHC'].map(topic => (
                <button
                  key={topic}
                  onClick={() => setHandbookQuery(topic)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Grounded Clause Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClauses.map(chunk => (
              <div
                key={chunk.id}
                onClick={() => setSelectedClause(chunk)}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-blue-700 font-semibold mb-1">
                    <span>{chunk.chapter}</span>
                    <span className="font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{chunk.id}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{chunk.clause}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                    {chunk.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Topic: {chunk.topic}</span>
                  <span className="font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                    Read Verified Clause <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: NATURAL LANGUAGE OPERATIONAL QUERIES */}
      {activeSubTab === 'queries' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Deterministic Natural-Language Operational Queries</h3>
            <p className="text-xs text-slate-500">
              Run structured queries against live application, compliance, and document registries:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => setActiveQueryKey('overdue_apps')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeQueryKey === 'overdue_apps'
                    ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Applications Overdue SLA</span>
                  <Clock className="h-3.5 w-3.5 text-rose-600" />
                </div>
                <p className="text-[11px] font-normal text-slate-500">Exceeding stage turnaround limits</p>
              </button>

              <button
                onClick={() => setActiveQueryKey('compliance_7_days')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeQueryKey === 'compliance_7_days'
                    ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Compliance Due in 7 Days</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <p className="text-[11px] font-normal text-slate-500">Upcoming statutory deadlines</p>
              </button>

              <button
                onClick={() => setActiveQueryKey('expired_docs')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeQueryKey === 'expired_docs'
                    ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Expired Institutional Docs</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                </div>
                <p className="text-[11px] font-normal text-slate-500">Fire NOC, Lease, Land encumbrance</p>
              </button>

              <button
                onClick={() => setActiveQueryKey('upcoming_evc')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeQueryKey === 'upcoming_evc'
                    ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Upcoming EVC Visits</span>
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-[11px] font-normal text-slate-500">Proposed and scheduled visits</p>
              </button>
            </div>
          </div>

          {/* Query Results Display Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Query Results ({queryResults.length} records matching)
              </h4>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {queryResults.map((item: any, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {item.applicationNumber || item.complianceId || item.documentNumber || item.visitCode}
                    </span>
                    <p className="font-semibold text-slate-900 mt-0.5">{item.institutionName}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.category || item.explanation || item.proposedDate}
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {item.currentStage || item.status || item.verificationStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Grounded Clause Reader */}
      {selectedClause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-blue-700 font-mono">{selectedClause.id}</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedClause.clause}</h3>
                <p className="text-xs text-slate-500">{selectedClause.chapter}</p>
              </div>
              <button
                onClick={() => setSelectedClause(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800">
              {selectedClause.content}
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>Verified against official AICTE Approval Process Handbook (APH 2026-27).</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClause(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Close Clause Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
