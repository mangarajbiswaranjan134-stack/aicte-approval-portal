import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertItem, AlertSeverity, AlertCategory } from '../types';
import { SeverityBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  BellRing, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Send, 
  Mail, 
  MessageSquare, 
  ShieldAlert,
  Flame,
  CheckCheck
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { 
    alerts, 
    acknowledgeAlert, 
    resolveAlert, 
    escalateAlert, 
    activeUser, 
    setActiveTab, 
    setSelectedApplicationId,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [selectedAlertForEscalate, setSelectedAlertForEscalate] = useState<AlertItem | null>(null);
  const [escalateTarget, setEscalateTarget] = useState('Chairman AICTE / Member Secretary');
  const [dispatchModal, setDispatchModal] = useState<AlertItem | null>(null);

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.explanation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'all' || a.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleEscalateSubmit = () => {
    if (!selectedAlertForEscalate) return;
    escalateAlert(selectedAlertForEscalate.id, escalateTarget);
    setIsEscalateModalOpen(false);
  };

  const handleDispatchPreview = (alert: AlertItem) => {
    setDispatchModal(alert);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">Regulatory Alerts, Reminders & Escalations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proactive early-warning engine detecting SLA breaches, expiry windows (30d, 14d, 7d, 3d, 1d) and statutory deficiencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            Deduplication: Active
          </span>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 font-semibold border border-teal-200">
            {alerts.filter(a => a.status === 'Resolved').length} Resolved
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Institution, Alert Category, or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Severities ({alerts.length})</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Alert States</option>
            <option value="Active">Active</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
            <CheckCheck className="h-10 w-10 mx-auto mb-2 text-teal-500 opacity-60" />
            <p className="font-semibold text-slate-700">No alerts found</p>
            <p className="text-xs text-slate-400 mt-1">All conditions are normal under the selected filters.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'Critical';
            const isResolved = alert.status === 'Resolved';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-slate-50/60 border-slate-200 opacity-75'
                    : isCritical
                    ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={alert.severity} />
                      <span className="font-mono text-xs font-bold text-slate-700">{alert.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" /> {alert.createdAt}
                      </span>
                      {alert.escalatedTo && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          Escalated to: {alert.escalatedTo}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {alert.institutionName}
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed mt-1">
                      {alert.explanation}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200/80 text-xs text-slate-800 mt-2 flex items-start gap-2">
                      <span className="font-semibold text-blue-700">Recommended Regulatory Action:</span>
                      <span>{alert.recommendedAction}</span>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-[11px] text-slate-500">
                      Custodian: <strong>{alert.responsibleOfficer}</strong>
                    </span>

                    <div className="flex items-center gap-2 mt-2">
                      {/* Official SMS/Email Dispatch Preview button */}
                      <button
                        onClick={() => handleDispatchPreview(alert)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200"
                        title="View Official Dispatch Payload (SMS/Email)"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </button>

                      {/* Acknowledge Button */}
                      {alert.status === 'Active' && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}

                      {/* Escalate Button */}
                      {!isResolved && !alert.escalatedTo && (
                        <button
                          onClick={() => {
                            setSelectedAlertForEscalate(alert);
                            setIsEscalateModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                        >
                          Escalate
                        </button>
                      )}

                      {/* Resolve Button */}
                      {!isResolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
                        >
                          Resolve Alert
                        </button>
                      )}

                      {isResolved && (
                        <span className="text-xs font-semibold text-teal-700 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Escalate Alert */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title="Escalate Alert to Higher Regulatory Authority"
        subtitle={`Alert: ${selectedAlertForEscalate?.category}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Escalating this alert elevates its severity to <strong>Critical</strong> and notifies senior council authorities for intervention.
          </p>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Escalate To</label>
            <select
              value={escalateTarget}
              onChange={(e) => setEscalateTarget(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs font-semibold"
            >
              <option value="Chairman AICTE / Member Secretary">Chairman AICTE / Member Secretary</option>
              <option value="Standing Complaints Committee (SCC)">Standing Complaints Committee (SCC)</option>
              <option value="Regional Director, Western Regional Office">Regional Director, Regional Office</option>
              <option value="Legal Cell Directorate">Legal Cell Directorate</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsEscalateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleEscalateSubmit}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Confirm Escalation
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Official Regulatory Notification Dispatch Preview */}
      <Modal
        isOpen={Boolean(dispatchModal)}
        onClose={() => setDispatchModal(null)}
        title="Official Regulatory Notification Dispatch"
        subtitle="Automated notification dispatch via National e-Governance Gateway"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
            <strong>Security Notice:</strong> All official regulatory notices are cryptographically signed with AICTE Digital Attestation and recorded in the permanent audit ledger.
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-2 border border-slate-800">
            <p className="text-teal-400 font-bold">// SECURE OUTGOING DISPATCH PAYLOAD</p>
            <p><span className="text-slate-400">TO (OFFICER):</span> {dispatchModal?.responsibleOfficer} &lt;officer@aicte-india.org&gt;</p>
            <p><span className="text-slate-400">CC (REGISTRAR):</span> registrar@{dispatchModal?.institutionId}.ac.in</p>
            <p><span className="text-slate-400">SUBJECT:</span> [AICTE URGENT] {dispatchModal?.category} — {dispatchModal?.institutionName}</p>
            <div className="pt-2 border-t border-slate-800 text-slate-300">
              Dear Officer,<br/>
              Notice of regulatory action required for institution {dispatchModal?.institutionName}.<br/>
              Reason: {dispatchModal?.explanation}<br/>
              Action Mandated: {dispatchModal?.recommendedAction}<br/>
              Ref: AICTE-NOTIF-2026-{dispatchModal?.id}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setDispatchModal(null)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
