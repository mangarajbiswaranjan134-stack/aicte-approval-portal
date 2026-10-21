import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvcStatus, EvcSchedule } from '../types';
import { EvcStatusBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  CalendarDays, 
  ListFilter, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  FileText,
  Calendar,
  Building2
} from 'lucide-react';

export const EvcSchedulingPage: React.FC = () => {
  const { 
    evcSchedules, 
    committeeMembers, 
    institutions, 
    applications, 
    scheduleEvcVisit, 
    updateEvcStatus, 
    activeUser,
    addToast
  } = useApp();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedVisitForAction, setSelectedVisitForAction] = useState<EvcSchedule | null>(null);

  // New Visit Form State
  const [newInstitutionId, setNewInstitutionId] = useState(institutions[0]?.id || '');
  const [newApplicationId, setNewApplicationId] = useState(applications[0]?.id || '');
  const [newVisitDate, setNewVisitDate] = useState('2026-10-30');
  const [newVisitTime, setNewVisitTime] = useState('10:00 AM');
  const [newLocation, setNewLocation] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [newNotes, setNewNotes] = useState('');

  // Outcome recording state
  const [reportOutcome, setReportOutcome] = useState<'Recommended' | 'Deficiencies Noted' | 'Not Recommended'>('Recommended');
  const [reportStatus, setReportStatus] = useState<'Draft' | 'Submitted' | 'Verified'>('Verified');
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);

  // Filtered schedules
  const filteredSchedules = evcSchedules.filter(s => {
    return statusFilter === 'all' || s.status === statusFilter;
  });

  const handleExpertToggle = (expertId: string) => {
    setSelectedExperts(prev => 
      prev.includes(expertId) ? prev.filter(id => id !== expertId) : [...prev, expertId]
    );
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExperts.length === 0) {
      addToast('Experts Required', 'Please assign at least one subject expert from the directory.', 'warning');
      return;
    }

    const res = scheduleEvcVisit({
      institutionId: newInstitutionId,
      applicationId: newApplicationId,
      proposedDate: newVisitDate,
      visitTime: newVisitTime,
      location: newLocation,
      committeeMembers: selectedExperts,
      status: 'Proposed',
      notes: newNotes
    });

    if (res.success) {
      setIsScheduleModalOpen(false);
      setSelectedExperts([]);
      setNewNotes('');
    } else {
      addToast('Scheduling Failed', res.message, 'error');
    }
  };

  const handleRecordCompletion = (visit: EvcSchedule) => {
    setSelectedVisitForAction(visit);
    setIsOutcomeModalOpen(true);
  };

  const handleOutcomeSubmit = () => {
    if (!selectedVisitForAction) return;
    updateEvcStatus(selectedVisitForAction.id, 'Completed', reportOutcome, reportStatus);
    setIsOutcomeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Expert Visit Committee (EVC) Operations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate physical peer inspections, expert member assignments, and geo-tagged report verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendar Schedule
            </button>
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            disabled={activeUser.role === 'Read-Only Auditor' || activeUser.role === 'Institutional Representative'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Propose EVC Visit
          </button>
        </div>
      </div>

      {/* Committee Member Directory Summary Bar */}
      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-white">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span>National Expert Repository (IIT/NIT/Central University Faculty)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {committeeMembers.filter(m => m.available).length} of {committeeMembers.length} Experts Currently Available
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
          {committeeMembers.map(member => (
            <div
              key={member.id}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-[11px] transition-all ${
                member.available 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200' 
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${member.available ? 'bg-teal-400' : 'bg-rose-400'}`} />
                <span>{member.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{member.organization} • {member.discipline}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: List View or Calendar View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Scheduled Inspections Register</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Visit Statuses ({evcSchedules.length})</option>
              <option value="Proposed">Proposed</option>
              <option value="Awaiting Confirmation">Awaiting Confirmation</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Visit Code</th>
                  <th className="py-3 px-4">Institution & Application</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Assigned Committee</th>
                  <th className="py-3 px-4">Visit Status</th>
                  <th className="py-3 px-4">EVC Report</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map(visit => {
                  const assignedMembers = committeeMembers.filter(m => visit.committeeMembers.includes(m.id));
                  return (
                    <tr key={visit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {visit.visitCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{visit.institutionName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">App: {visit.applicationNumber}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" /> {visit.proposedDate}
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {visit.visitTime}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {assignedMembers.map(m => (
                            <div key={m.id} className="text-[11px] font-medium text-slate-800 truncate max-w-[200px]">
                              • {m.name} ({m.organization})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <EvcStatusBadge status={visit.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          visit.reportStatus === 'Verified' 
                            ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                            : visit.reportStatus === 'Submitted' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {visit.reportStatus}
                        </span>
                        {visit.reportOutcome && (
                          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Outcome: {visit.reportOutcome}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {visit.status === 'Proposed' && (
                            <button
                              onClick={() => updateEvcStatus(visit.id, 'Scheduled')}
                              disabled={activeUser.role === 'Read-Only Auditor'}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-40"
                            >
                              Confirm
                            </button>
                          )}
                          {visit.status === 'Scheduled' && (
                            <button
                              onClick={() => handleRecordCompletion(visit)}
                              disabled={activeUser.role === 'Read-Only Auditor'}
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors disabled:opacity-40"
                            >
                              Mark Completed
                            </button>
                          )}
                          {(visit.status === 'Proposed' || visit.status === 'Scheduled') && (
                            <button
                              onClick={() => updateEvcStatus(visit.id, 'Rescheduled')}
                              disabled={activeUser.role === 'Read-Only Auditor'}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                              title="Reschedule"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
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
      ) : (
        /* Calendar Schedule Cards View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Upcoming EVC Inspection Calendar</h3>
            <span className="text-xs text-slate-500">October - November 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evcSchedules.map(visit => {
              const assignedMembers = committeeMembers.filter(m => visit.committeeMembers.includes(m.id));
              return (
                <div key={visit.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">{visit.visitCode}</span>
                    <EvcStatusBadge status={visit.status} />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{visit.institutionName}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> {visit.location}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{visit.proposedDate}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{visit.visitTime}</span>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-700 mb-1">Assigned Experts:</p>
                    {assignedMembers.map(m => (
                      <p key={m.id} className="truncate">• {m.name} ({m.discipline})</p>
                    ))}
                  </div>

                  {visit.notes && (
                    <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-2">
                      "{visit.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Propose EVC Visit with Conflict Detection */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Propose Expert Visit Committee Inspection"
        subtitle="AI conflict detection evaluates expert date availability automatically"
        maxWidth="2xl"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Institution</label>
              <select
                value={newInstitutionId}
                onChange={(e) => {
                  setNewInstitutionId(e.target.value);
                  const inst = institutions.find(i => i.id === e.target.value);
                  if (inst) setNewLocation(`${inst.district} Campus`);
                }}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Linked Application</label>
              <select
                value={newApplicationId}
                onChange={(e) => setNewApplicationId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs font-mono"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>{app.applicationNumber} ({app.currentStage})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Proposed Inspection Date</label>
              <input
                type="date"
                value={newVisitDate}
                onChange={(e) => setNewVisitDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Time of Inspection</label>
              <input
                type="text"
                value={newVisitTime}
                onChange={(e) => setNewVisitTime(e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Committee Experts (Min 2 recommended per APH norms)
            </label>
            <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50">
              {committeeMembers.map(exp => {
                const isSelected = selectedExperts.includes(exp.id);
                // Check if this expert has a conflict on newVisitDate!
                const isConflicted = evcSchedules.some(s => 
                  s.proposedDate === newVisitDate && 
                  (s.status === 'Scheduled' || s.status === 'Proposed') &&
                  s.committeeMembers.includes(exp.id)
                );

                return (
                  <label
                    key={exp.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200' 
                        : isConflicted 
                        ? 'bg-rose-50/50 border border-rose-200 opacity-60' 
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isConflicted}
                      onChange={() => handleExpertToggle(exp.id)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{exp.name}</span>
                        {isConflicted && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                            CONFLICT ON THIS DATE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600">{exp.organization} • {exp.discipline}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Inspection Focus Notes</label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="e.g. Physical verification of AI lab computing clusters and safety clearances..."
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Schedule Visit & Check Conflicts
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record EVC Completion & Report Outcome */}
      <Modal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        title="Record EVC Physical Inspection Outcome"
        subtitle={`Visit Code: ${selectedVisitForAction?.visitCode}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Inspection Committee Recommendation</label>
            <select
              value={reportOutcome}
              onChange={(e) => setReportOutcome(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs font-semibold"
            >
              <option value="Recommended">Recommended (Unconditional Grant)</option>
              <option value="Deficiencies Noted">Deficiencies Noted (Requires SAC Hearing or Rectification)</option>
              <option value="Not Recommended">Not Recommended (Severe Infrastructural Shortfall)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">EVC Report Verification State</label>
            <select
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            >
              <option value="Verified">Verified by Regional Director</option>
              <option value="Submitted">Submitted (Under Review)</option>
              <option value="Draft">Draft on Record</option>
            </select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-relaxed">
            Submitting this record will mark visit {selectedVisitForAction?.visitCode} as Completed and create an immutable audit record signed by {activeUser.name}.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsOutcomeModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleOutcomeSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Confirm Completion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
