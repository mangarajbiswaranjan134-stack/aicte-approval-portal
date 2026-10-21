import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Application, WorkflowStage, ApplicationCategory, InstitutionType } from '../types';
import { StageBadge, RiskBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ChevronRight, 
  ArrowUpDown, 
  UserCheck, 
  FileText, 
  Send, 
  CheckCircle, 
  RotateCcw,
  Clock,
  Shield,
  Calendar,
  XCircle,
  Building
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const { 
    applications, 
    institutions, 
    activeUser, 
    transitionWorkflow, 
    assignOfficer, 
    addApplicationNote,
    createApplication,
    selectedApplicationId,
    setSelectedApplicationId,
    workflowConfigs,
    documents,
    complianceItems,
    evcSchedules,
    users
  } = useApp();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Application>('submissionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [targetTransitionStage, setTargetTransitionStage] = useState<WorkflowStage>('Scrutiny');
  const [transitionRemarks, setTransitionRemarks] = useState('');
  const [selectedOfficerToAssign, setSelectedOfficerToAssign] = useState('');

  // New Application Form State
  const [newAppInstitutionId, setNewAppInstitutionId] = useState(institutions[0]?.id || '');
  const [newAppCategory, setNewAppCategory] = useState<ApplicationCategory>('Extension of Approval (EoA)');
  const [newAppPriority, setNewAppPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // If user is Institutional Representative, restrict to their institution only!
  const isInstitutionalUser = activeUser.role === 'Institutional Representative';
  const userInstitutionId = activeUser.institutionId || 'inst-1';

  // Find currently selected application
  const selectedApp = applications.find(a => a.id === selectedApplicationId) || null;

  // Filter application list
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Institutional Rep boundary: cannot see other institutions' confidential dossiers
      if (isInstitutionalUser && app.institutionId !== userInstitutionId) {
        return false;
      }

      const matchesSearch = 
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.district.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = selectedStage === 'all' || app.currentStage === selectedStage;
      const matchesState = selectedState === 'all' || app.state === selectedState;
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || app.overallStatus === selectedStatus;

      return matchesSearch && matchesStage && matchesState && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [applications, searchTerm, selectedStage, selectedState, selectedCategory, selectedStatus, sortField, sortDirection, isInstitutionalUser, userInstitutionId]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const paginatedApplications = filteredApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Unique lists for filter dropdowns
  const uniqueStates = Array.from(new Set(institutions.map(i => i.state))).sort();
  const uniqueStages: WorkflowStage[] = [
    'Submitted', 'Scrutiny', 'Re-scrutiny', 'EVC Pending', 'EVC Completed', 'SAC/SHC Review', 'Decision Pending', 'Approved', 'Returned for Correction', 'Rejected'
  ];

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Application ID',
      'Institution',
      'Type',
      'State',
      'District',
      'Category',
      'Stage',
      'Status',
      'Assigned Officer',
      'Days in Stage',
      'Delay Risk Score',
      'Submission Date'
    ];

    const rows = filteredApplications.map(a => [
      `"${a.applicationNumber}"`,
      `"${a.institutionName}"`,
      `"${a.institutionType}"`,
      `"${a.state}"`,
      `"${a.district}"`,
      `"${a.category}"`,
      `"${a.currentStage}"`,
      `"${a.overallStatus}"`,
      `"${a.assignedOfficer}"`,
      a.daysInCurrentStage,
      `${a.delayRiskScore}%`,
      a.submissionDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_Applications_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApplication({
      institutionId: newAppInstitutionId,
      category: newAppCategory,
      priority: newAppPriority
    });
    setIsCreateModalOpen(false);
  };

  const handleTransitionSubmit = () => {
    if (!selectedApp) return;
    const res = transitionWorkflow(
      selectedApp.id,
      targetTransitionStage,
      transitionRemarks || `Transitioned to ${targetTransitionStage} per regulatory norms.`,
      targetTransitionStage === 'Approved' ? 'Approved' : targetTransitionStage === 'Returned for Correction' ? 'Returned' : 'Transitioned'
    );
    if (res.success) {
      setIsTransitionModalOpen(false);
      setTransitionRemarks('');
    }
  };

  const handleAssignSubmit = () => {
    if (!selectedApp || !selectedOfficerToAssign) return;
    assignOfficer(selectedApp.id, selectedOfficerToAssign);
    setIsAssignModalOpen(false);
  };

  const handleAddNote = () => {
    if (!selectedApp || !newNoteText.trim()) return;
    addApplicationNote(selectedApp.id, newNoteText);
    setNewNoteText('');
  };

  const selectedAppDocs = selectedApp ? documents.filter(d => d.linkedApplicationId === selectedApp.id || d.institutionId === selectedApp.institutionId) : [];
  const selectedAppCompliance = selectedApp ? complianceItems.filter(c => c.linkedApplicationId === selectedApp.id || c.institutionId === selectedApp.institutionId) : [];
  const selectedAppEvc = selectedApp ? evcSchedules.filter(e => e.applicationId === selectedApp.id) : [];

  const currentStageConfig = selectedApp ? workflowConfigs.find(c => c.stage === selectedApp.currentStage) : null;
  const allowedNextStages = currentStageConfig?.allowedNextStages || [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Application Number or Institution Name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => { setSelectedStage(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Stages ({applications.length})</option>
            {uniqueStages.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All States</option>
            {uniqueStates.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Download CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export CSV
          </button>

          {/* Create Application Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={activeUser.role === 'Read-Only Auditor'}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> New Application
          </button>
        </div>
      </div>

      {/* Main Table + Optional Detail Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Applications Data Table */}
        <div className={`${selectedApp ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200`}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Register</h3>
              <p className="text-xs text-slate-500">
                Showing {filteredApplications.length} records matching criteria
              </p>
            </div>
            {isInstitutionalUser && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Restricted to: {institutions.find(i => i.id === userInstitutionId)?.name}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => {
                      if (sortField === 'applicationNumber') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      else { setSortField('applicationNumber'); setSortDirection('asc'); }
                    }}
                  >
                    <div className="flex items-center gap-1">Application ID <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="py-3 px-4">Institution & Region</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Delay Risk</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-slate-600">No applications match your filter criteria.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setSelectedStage('all'); setSelectedState('all'); }}
                        className="mt-2 text-xs text-blue-600 underline font-medium"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map(app => {
                    const isSelected = selectedApp?.id === app.id;
                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApplicationId(isSelected ? null : app.id)}
                        className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/80 font-medium' : ''}`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {app.applicationNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 line-clamp-1">{app.institutionName}</p>
                          <p className="text-[11px] text-slate-500">{app.district}, {app.state}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {app.category}
                        </td>
                        <td className="py-3 px-4">
                          <StageBadge stage={app.currentStage} />
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {app.daysInCurrentStage}d
                        </td>
                        <td className="py-3 px-4">
                          <RiskBadge score={app.delayRiskScore} level={app.delayRiskLevel} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplicationId(app.id);
                            }}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-xs"
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={15}>15</option>
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Application Detail Drawer / Panel */}
        {selectedApp && (
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-700">{selectedApp.applicationNumber}</span>
                  <StageBadge stage={selectedApp.currentStage} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedApp.institutionName}</h3>
                <p className="text-xs text-slate-500">{selectedApp.category} • {selectedApp.academicYear}</p>
              </div>
              <button
                onClick={() => setSelectedApplicationId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                ✕
              </button>
            </div>

            {/* Stage Progress & Transition Action Panel */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Stage SLA & Processing</span>
                <span className="text-xs font-mono text-slate-500">{selectedApp.daysInCurrentStage} days elapsed</span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Next Regulatory Action:</strong> {selectedApp.nextAction}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (allowedNextStages.length > 0) {
                      setTargetTransitionStage(allowedNextStages[0]);
                    }
                    setIsTransitionModalOpen(true);
                  }}
                  disabled={activeUser.role === 'Read-Only Auditor'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Advance Workflow Stage
                </button>

                <button
                  onClick={() => {
                    setSelectedOfficerToAssign(selectedApp.assignedOfficer);
                    setIsAssignModalOpen(true);
                  }}
                  disabled={activeUser.role === 'Read-Only Auditor' || activeUser.role === 'Institutional Representative'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Reassign Officer
                </button>
              </div>
            </div>

            {/* Delay Risk Factors */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-amber-900">
                <span>AI Delay Risk Evaluation</span>
                <RiskBadge score={selectedApp.delayRiskScore} level={selectedApp.delayRiskLevel} />
              </div>
              <ul className="list-disc list-inside text-amber-800 space-y-1 text-[11px]">
                {selectedApp.delayRiskFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>

            {/* Related Tabs: Timeline, Documents, Compliance, EVC */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Related Dossier & Evidence
              </h4>

              {/* Connected Docs */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-blue-600" /> Attached Documents ({selectedAppDocs.length})
                  </span>
                  <button
                    onClick={() => {}}
                    className="text-[11px] text-blue-600 font-semibold"
                  >
                    View Registry
                  </button>
                </div>
                {selectedAppDocs.length === 0 ? (
                  <p className="text-slate-400 text-[11px]">No documents attached to this application record.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedAppDocs.slice(0, 3).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-[11px]">
                        <span className="truncate max-w-[200px] text-slate-800 font-medium">{doc.fileName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          doc.verificationStatus === 'Verified' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connected Compliance */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-teal-600" /> Compliance Obligations ({selectedAppCompliance.length})
                  </span>
                </div>
                {selectedAppCompliance.length === 0 ? (
                  <p className="text-slate-400 text-[11px]">No specific pending compliance items.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedAppCompliance.slice(0, 2).map(c => (
                      <div key={c.id} className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                        <div className="flex justify-between font-medium">
                          <span>{c.category}</span>
                          <span className={c.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5 truncate">{c.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Internal Notes & Timeline */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block">Officer Notes & Decisions</span>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {selectedApp.notes.map(note => (
                    <div key={note.id} className="bg-white p-2 rounded border border-slate-200 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="font-bold text-slate-800">{note.author} ({note.role})</span>
                        <span className="font-mono text-[10px]">{note.timestamp}</span>
                      </div>
                      <p className="text-slate-700">{note.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Add internal reviewer note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: New Application Creation */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register Technical Institution Application"
        subtitle="Initialize new regulatory filing for approval cycle 2026-27"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Institution</label>
            <select
              value={newAppInstitutionId}
              onChange={(e) => setNewAppInstitutionId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.district}, {inst.state} - {inst.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Application Category</label>
            <select
              value={newAppCategory}
              onChange={(e) => setNewAppCategory(e.target.value as ApplicationCategory)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            >
              <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
              <option value="New Technical Institution">New Technical Institution</option>
              <option value="Increase in Intake">Increase in Intake</option>
              <option value="Introduction of New Course">Introduction of New Course</option>
              <option value="Closure of Program">Closure of Program</option>
              <option value="Conversion of Diploma to Degree">Conversion of Diploma to Degree</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Initial Priority Classification</label>
            <div className="flex gap-4">
              {(['Low', 'Medium', 'High'] as const).map(p => (
                <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={newAppPriority === p}
                    onChange={() => setNewAppPriority(p)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{p} Priority</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
            Upon creation, an official application number is minted and the dossier is placed in the "Submitted" workflow stage for Scrutiny Reviewer assignment.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-xs"
            >
              Register Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Workflow Stage Transition */}
      <Modal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        title="Execute Workflow Stage Transition"
        subtitle={`Application: ${selectedApp?.applicationNumber} • Current: ${selectedApp?.currentStage}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Target Next Stage (APH Compliant)</label>
            <select
              value={targetTransitionStage}
              onChange={(e) => setTargetTransitionStage(e.target.value as WorkflowStage)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs font-semibold text-slate-800"
            >
              {allowedNextStages.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            {allowedNextStages.length === 0 && (
              <p className="text-rose-600 text-[11px] mt-1 font-semibold">
                No further automated transitions allowed from {selectedApp?.currentStage}.
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Regulatory Remarks & Observations</label>
            <textarea
              rows={3}
              value={transitionRemarks}
              onChange={(e) => setTransitionRemarks(e.target.value)}
              placeholder="Cite relevant APH clauses, checklist verification status, or grounds for return..."
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800">Authorization Check:</p>
            <p>Action executed by: <strong>{activeUser.name}</strong> ({activeUser.role}). This transition will be permanently recorded in the immutable audit trail.</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsTransitionModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleTransitionSubmit}
              disabled={allowedNextStages.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
            >
              Confirm Transition
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Assign Officer */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Responsible Officer"
        subtitle={`Application: ${selectedApp?.applicationNumber}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select AICTE Officer</label>
            <select
              value={selectedOfficerToAssign}
              onChange={(e) => setSelectedOfficerToAssign(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            >
              {users.filter(u => u.role !== 'Institutional Representative' && u.role !== 'Read-Only Auditor').map(u => (
                <option key={u.id} value={u.name}>
                  {u.name} — {u.role} ({u.region})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Assign Officer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
