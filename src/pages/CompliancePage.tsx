import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ComplianceObligation, ComplianceStatus, ComplianceCategory } from '../types';
import { ComplianceStatusBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const CompliancePage: React.FC = () => {
  const { 
    complianceItems, 
    institutions, 
    applications, 
    updateComplianceStatus, 
    requestComplianceExtension, 
    createComplianceItem, 
    activeUser,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [selectedComplianceItem, setSelectedComplianceItem] = useState<ComplianceObligation | null>(null);

  // Form states
  const [verifyStatus, setVerifyStatus] = useState<ComplianceStatus>('Compliant');
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [extensionReason, setExtensionReason] = useState('');

  // New Compliance Form State
  const [newInstitutionId, setNewInstitutionId] = useState(institutions[0]?.id || '');
  const [newCategory, setNewCategory] = useState<ComplianceCategory>('Safety & Fire NOC');
  const [newDescription, setNewDescription] = useState('');
  const [newAphRef, setNewAphRef] = useState('APH 2026-27 Appendix 4 Clause 4.1.2');
  const [newRequiredDoc, setNewRequiredDoc] = useState('Fire Inspection Certificate from Municipal Dept');
  const [newDueDate, setNewDueDate] = useState('2026-11-15');

  const categories: ComplianceCategory[] = [
    'Land & Built-up Norms',
    'Safety & Fire NOC',
    'Faculty Cadre & Pay',
    'Anti-Ragging & ICC',
    'Grievance Redressal',
    'AISHE / Mandatory Disclosure',
    'NBA / NAAC Accreditation',
    'Financial Undertaking'
  ];

  // If user is Institutional Representative, restrict to their institution
  const isInstitutionalUser = activeUser.role === 'Institutional Representative';
  const userInstitutionId = activeUser.institutionId || 'inst-1';

  const filteredItems = useMemo(() => {
    return complianceItems.filter(item => {
      if (isInstitutionalUser && item.institutionId !== userInstitutionId) {
        return false;
      }
      const matchesSearch = 
        item.complianceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complianceItems, searchTerm, categoryFilter, statusFilter, isInstitutionalUser, userInstitutionId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      addToast('Description Required', 'Please enter a description of the compliance obligation.', 'warning');
      return;
    }

    createComplianceItem({
      institutionId: newInstitutionId,
      category: newCategory,
      description: newDescription,
      aphRuleReference: newAphRef,
      requiredDocument: newRequiredDoc,
      dueDate: newDueDate
    });

    setIsCreateModalOpen(false);
    setNewDescription('');
  };

  const handleVerifySubmit = () => {
    if (!selectedComplianceItem) return;
    updateComplianceStatus(selectedComplianceItem.id, verifyStatus, verifyRemarks);
    setIsVerifyModalOpen(false);
    setVerifyRemarks('');
  };

  const handleExtensionSubmit = () => {
    if (!selectedComplianceItem || !extensionReason.trim()) return;
    requestComplianceExtension(selectedComplianceItem.id, extensionReason);
    setIsExtensionModalOpen(false);
    setExtensionReason('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Compliance ID',
      'Institution',
      'Category',
      'Description',
      'APH Reference',
      'Due Date',
      'Status',
      'Responsible Officer',
      'Comments'
    ];

    const rows = filteredItems.map(c => [
      `"${c.complianceId}"`,
      `"${c.institutionName}"`,
      `"${c.category}"`,
      `"${c.description.replace(/"/g, '""')}"`,
      `"${c.aphRuleReference}"`,
      c.dueDate,
      `"${c.status}"`,
      `"${c.responsibleOfficer}"`,
      `"${(c.reviewerComments || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `AICTE_Compliance_Register_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Institutional Compliance & Statutory Registry</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track mandatory affidavits, Fire NOCs, AISHE portal compliance, and faculty cadre undertakings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export Register
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={activeUser.role === 'Read-Only Auditor' || activeUser.role === 'Institutional Representative'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Issue Compliance Requirement
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Compliance ID, Institution, or Requirement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Categories ({complianceItems.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Submitted">Submitted</option>
            <option value="Awaiting Submission">Awaiting Submission</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Main Compliance Obligation Cards & Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Statutory Obligations Register</h3>
          <span className="text-xs text-slate-500">
            {filteredItems.length} records in active ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Compliance ID</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Category & Requirement</th>
                <th className="py-3 px-4">APH Regulatory Ref</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'Compliant';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {item.complianceId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{item.institutionName}</p>
                      <p className="text-[11px] text-slate-500">Officer: {item.responsibleOfficer}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800">{item.category}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{item.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic">Proof: {item.requiredDocument}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-[180px]">
                      {item.aphRuleReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono text-xs font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {item.dueDate}
                      </span>
                      {isOverdue && (
                        <p className="text-[10px] font-bold text-rose-600 uppercase">Overdue</p>
                      )}
                      {item.extensionRequested && (
                        <span className="block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Extension Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <ComplianceStatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Verify button for officers */}
                        {activeUser.role !== 'Institutional Representative' && activeUser.role !== 'Read-Only Auditor' && (
                          <button
                            onClick={() => {
                              setSelectedComplianceItem(item);
                              setVerifyStatus(item.status);
                              setVerifyRemarks(item.reviewerComments || '');
                              setIsVerifyModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                          >
                            Verify
                          </button>
                        )}

                        {/* Extension Request for Institutional Reps or Officers */}
                        {!item.extensionRequested && item.status !== 'Compliant' && (
                          <button
                            onClick={() => {
                              setSelectedComplianceItem(item);
                              setIsExtensionModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            Extension
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Compliance Requirement */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Issue Statutory Compliance Obligation"
        subtitle="Mandate institutional submission under AICTE APH regulations"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Target Institution</label>
            <select
              value={newInstitutionId}
              onChange={(e) => setNewInstitutionId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Compliance Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ComplianceCategory)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Requirement Description</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g. Upload renewed NOC from State Pollution Control Board for effluent disposal..."
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">APH Rule / Clause Reference</label>
              <input
                type="text"
                value={newAphRef}
                onChange={(e) => setNewAphRef(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Statutory Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                required
              />
            </div>
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Issue Obligation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Verify Compliance */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify Statutory Compliance Submission"
        subtitle={`ID: ${selectedComplianceItem?.complianceId} • ${selectedComplianceItem?.institutionName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="font-semibold text-slate-800">{selectedComplianceItem?.category}</p>
            <p className="text-slate-600 mt-1">{selectedComplianceItem?.description}</p>
            <p className="text-slate-400 mt-1 font-mono text-[10px]">Reference: {selectedComplianceItem?.aphRuleReference}</p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Verification Status Decision</label>
            <select
              value={verifyStatus}
              onChange={(e) => setVerifyStatus(e.target.value as ComplianceStatus)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs font-semibold"
            >
              <option value="Compliant">Compliant (Verified & Approved)</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Returned for Correction">Returned for Correction (Deficient Submission)</option>
              <option value="Waived">Waived / Not Applicable</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Verification Remarks</label>
            <textarea
              rows={3}
              value={verifyRemarks}
              onChange={(e) => setVerifyRemarks(e.target.value)}
              placeholder="Record verification findings or reasons for returning for correction..."
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifySubmit}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Confirm Verification
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Request Extension */}
      <Modal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        title="File Statutory Extension Request"
        subtitle={`ID: ${selectedComplianceItem?.complianceId}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Institutions may request an extension for statutory compliance submission citing governmental audit schedules or delays.
          </p>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reason for Extension Request</label>
            <textarea
              rows={3}
              value={extensionReason}
              onChange={(e) => setExtensionReason(e.target.value)}
              placeholder="e.g. Municipal Fire Inspection scheduled on 28th October; awaiting inspection team..."
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsExtensionModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleExtensionSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Submit Extension Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
