import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditEvent } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  UserCheck,
  FileText
} from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const { auditEvents } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');

  const actionTypes: AuditEvent['actionType'][] = [
    'Workflow Transition',
    'Application Created',
    'Officer Assigned',
    'Compliance Updated',
    'Compliance Verified',
    'Document Uploaded',
    'Document Verified',
    'EVC Scheduled',
    'EVC Rescheduled',
    'EVC Completed',
    'Alert Acknowledged',
    'Alert Resolved',
    'Configuration Changed'
  ];

  const filteredEvents = auditEvents.filter(ev => {
    const matchesSearch = 
      ev.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.affectedRecordId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = selectedActionType === 'all' || ev.actionType === selectedActionType;
    const matchesRecord = selectedRecordType === 'all' || ev.affectedRecordType === selectedRecordType;

    return matchesSearch && matchesAction && matchesRecord;
  });

  const handleExportCsv = () => {
    const headers = [
      'Event ID',
      'Timestamp',
      'Actor',
      'Actor Role',
      'Action Type',
      'Record Type',
      'Record ID',
      'Previous State',
      'New State',
      'Remarks'
    ];

    const rows = filteredEvents.map(e => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.actorName}"`,
      `"${e.actorRole}"`,
      `"${e.actionType}"`,
      `"${e.affectedRecordType}"`,
      `"${e.affectedRecordId}"`,
      `"${e.previousState || ''}"`,
      `"${e.newState || ''}"`,
      `"${e.remarks.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `AICTE_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Regulatory Audit Trail & Accountability Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable application-level audit logging capturing state transitions, officer assignments, and statutory verifications.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" /> Export Audit Log CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Actor, Record ID, or Remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Action Types ({auditEvents.length})</option>
            {actionTypes.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          <select
            value={selectedRecordType}
            onChange={(e) => setSelectedRecordType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Entity Types</option>
            <option value="Application">Application</option>
            <option value="Compliance">Compliance</option>
            <option value="EVC">EVC</option>
            <option value="Document">Document</option>
            <option value="Alert">Alert</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      {/* Audit Trail Timeline / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Event Stream</h3>
          <span className="text-xs text-slate-500">{filteredEvents.length} recorded events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Observations / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {event.timestamp}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{event.actorName}</p>
                    <p className="text-[10px] text-blue-700 font-medium">{event.actorRole}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {event.actionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">{event.affectedRecordType}</span>
                    {event.affectedRecordId}
                  </td>
                  <td className="py-3.5 px-4">
                    {event.previousState && event.newState ? (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500">{event.previousState}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span className="font-semibold text-blue-700">{event.newState}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">
                    {event.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
