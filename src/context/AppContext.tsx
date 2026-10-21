import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Application,
  Institution,
  ComplianceObligation,
  EvcSchedule,
  CommitteeMember,
  RegisteredDocument,
  AlertItem,
  AuditEvent,
  UserProfile,
  WorkflowStageConfig,
  WorkflowStage,
  ComplianceStatus,
  EvcStatus
} from '../types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_INSTITUTIONS,
  INITIAL_COMPLIANCE,
  INITIAL_EVC_SCHEDULES,
  INITIAL_COMMITTEE_MEMBERS,
  INITIAL_DOCUMENTS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_TRAIL,
  INITIAL_USERS,
  WORKFLOW_CONFIGS
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Navigation & UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedApplicationId: string | null;
  setSelectedApplicationId: (id: string | null) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;

  // Active User / Role
  users: UserProfile[];
  activeUser: UserProfile;
  setActiveUser: (user: UserProfile) => void;

  // State entities
  applications: Application[];
  institutions: Institution[];
  complianceItems: ComplianceObligation[];
  evcSchedules: EvcSchedule[];
  committeeMembers: CommitteeMember[];
  documents: RegisteredDocument[];
  alerts: AlertItem[];
  auditEvents: AuditEvent[];
  workflowConfigs: WorkflowStageConfig[];

  // Feedback
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Actions
  transitionWorkflow: (
    applicationId: string, 
    toStage: WorkflowStage, 
    remarks: string, 
    decision?: 'Approved' | 'Recommended' | 'Returned' | 'Rejected' | 'Transitioned'
  ) => { success: boolean; message: string };
  
  createApplication: (data: Partial<Application>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  assignOfficer: (applicationId: string, officerName: string) => void;
  addApplicationNote: (applicationId: string, content: string) => void;

  createComplianceItem: (item: Partial<ComplianceObligation>) => void;
  updateComplianceStatus: (id: string, status: ComplianceStatus, remarks?: string) => void;
  requestComplianceExtension: (id: string, reason: string) => void;

  scheduleEvcVisit: (data: Partial<EvcSchedule>) => { success: boolean; message: string };
  updateEvcStatus: (id: string, status: EvcStatus, outcome?: 'Recommended' | 'Deficiencies Noted' | 'Not Recommended', reportStatus?: 'Draft' | 'Submitted' | 'Verified') => void;

  uploadDocument: (doc: Partial<RegisteredDocument>) => void;
  verifyDocument: (id: string, status: 'Verified' | 'Flagged Discrepancy' | 'Expired', comments?: string) => void;

  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  escalateAlert: (id: string, escalateTo: string) => void;

  // System
  updateWorkflowConfigs: (newConfigs: WorkflowStageConfig[]) => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'aicte_approval_system_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage or fallback to defaults
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);

  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [activeUser, setActiveUserState] = useState<UserProfile>(() => loadInitial('activeUser', INITIAL_USERS[0]));

  const [applications, setApplications] = useState<Application[]>(() => loadInitial('applications', INITIAL_APPLICATIONS));
  const [institutions, setInstitutions] = useState<Institution[]>(() => loadInitial('institutions', INITIAL_INSTITUTIONS));
  const [complianceItems, setComplianceItems] = useState<ComplianceObligation[]>(() => loadInitial('complianceItems', INITIAL_COMPLIANCE));
  const [evcSchedules, setEvcSchedules] = useState<EvcSchedule[]>(() => loadInitial('evcSchedules', INITIAL_EVC_SCHEDULES));
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => loadInitial('committeeMembers', INITIAL_COMMITTEE_MEMBERS));
  const [documents, setDocuments] = useState<RegisteredDocument[]>(() => loadInitial('documents', INITIAL_DOCUMENTS));
  const [alerts, setAlerts] = useState<AlertItem[]>(() => loadInitial('alerts', INITIAL_ALERTS));
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => loadInitial('auditEvents', INITIAL_AUDIT_TRAIL));
  const [workflowConfigs, setWorkflowConfigs] = useState<WorkflowStageConfig[]>(() => loadInitial('workflowConfigs', WORKFLOW_CONFIGS));

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_activeUser`, JSON.stringify(activeUser));
      localStorage.setItem(`${STORAGE_KEY}_applications`, JSON.stringify(applications));
      localStorage.setItem(`${STORAGE_KEY}_institutions`, JSON.stringify(institutions));
      localStorage.setItem(`${STORAGE_KEY}_complianceItems`, JSON.stringify(complianceItems));
      localStorage.setItem(`${STORAGE_KEY}_evcSchedules`, JSON.stringify(evcSchedules));
      localStorage.setItem(`${STORAGE_KEY}_committeeMembers`, JSON.stringify(committeeMembers));
      localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
      localStorage.setItem(`${STORAGE_KEY}_auditEvents`, JSON.stringify(auditEvents));
      localStorage.setItem(`${STORAGE_KEY}_workflowConfigs`, JSON.stringify(workflowConfigs));
    } catch (e) {
      console.warn('Storage sync issue', e);
    }
  }, [activeUser, applications, institutions, complianceItems, evcSchedules, committeeMembers, documents, alerts, auditEvents, workflowConfigs]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditEvent = (
    actionType: AuditEvent['actionType'],
    affectedRecordId: string,
    affectedRecordType: AuditEvent['affectedRecordType'],
    remarks: string,
    previousState?: string,
    newState?: string
  ) => {
    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: activeUser.name,
      actorRole: activeUser.role,
      actionType,
      affectedRecordId,
      affectedRecordType,
      previousState,
      newState,
      remarks
    };
    setAuditEvents(prev => [newEvent, ...prev]);
  };

  const setActiveUser = (user: UserProfile) => {
    setActiveUserState(user);
    addToast('Role Switched', `Active identity changed to: ${user.name} (${user.role})`, 'info');
    addAuditEvent('Configuration Changed', user.id, 'System', `Switched active role session to ${user.role}`);
  };

  // Workflow transition logic with strict rule & permission validation
  const transitionWorkflow = (
    applicationId: string,
    toStage: WorkflowStage,
    remarks: string,
    decision: 'Approved' | 'Recommended' | 'Returned' | 'Rejected' | 'Transitioned' = 'Transitioned'
  ) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) {
      return { success: false, message: 'Application not found.' };
    }

    // Role-based authorization checks
    if (activeUser.role === 'Read-Only Auditor') {
      return { success: false, message: 'Read-Only Auditor role cannot execute stage transitions.' };
    }
    if (activeUser.role === 'Institutional Representative') {
      if (app.currentStage !== 'Returned for Correction') {
        return { success: false, message: 'Institutional Representatives can only re-submit applications from "Returned for Correction".' };
      }
    }
    if (activeUser.role === 'Scrutiny Reviewer') {
      if (app.currentStage !== 'Scrutiny' && app.currentStage !== 'Re-scrutiny') {
        return { success: false, message: 'Scrutiny Reviewers are only authorized to transition applications in Scrutiny or Re-scrutiny stages.' };
      }
    }
    if (toStage === 'Approved' && activeUser.role !== 'Approval Officer' && activeUser.role !== 'System Administrator') {
      return { success: false, message: 'Final approval requires an authorized Approval Officer or System Administrator role.' };
    }

    const currentConfig = workflowConfigs.find(c => c.stage === app.currentStage);
    if (currentConfig && !currentConfig.allowedNextStages.includes(toStage)) {
      return {
        success: false,
        message: `Invalid transition! APH guidelines do not permit moving from "${app.currentStage}" directly to "${toStage}". Allowed targets: ${currentConfig.allowedNextStages.join(', ')}`
      };
    }

    const previousStage = app.currentStage;
    
    // Calculate new overall status
    let overallStatus: Application['overallStatus'] = 'In Progress';
    if (toStage === 'Approved') overallStatus = 'Approved';
    else if (toStage === 'Rejected') overallStatus = 'Rejected';
    else if (toStage === 'Returned for Correction') overallStatus = 'Action Required';

    // Update risk score
    let delayRiskScore = app.delayRiskScore;
    let delayRiskLevel = app.delayRiskLevel;
    if (toStage === 'Approved') {
      delayRiskScore = 5;
      delayRiskLevel = 'Low';
    } else if (toStage === 'Returned for Correction') {
      delayRiskScore = Math.min(95, delayRiskScore + 15);
      delayRiskLevel = delayRiskScore > 75 ? 'Critical' : 'High';
    } else {
      delayRiskScore = Math.max(15, delayRiskScore - 10);
      delayRiskLevel = delayRiskScore > 70 ? 'High' : delayRiskScore > 40 ? 'Medium' : 'Low';
    }

    const newNote = {
      id: `n-${Date.now()}`,
      author: activeUser.name,
      role: activeUser.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: `${decision}: ${remarks}`,
      stage: toStage
    };

    setApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          currentStage: toStage,
          daysInCurrentStage: 0,
          overallStatus,
          delayRiskScore,
          delayRiskLevel,
          nextAction: `Pending action for ${toStage}`,
          notes: [newNote, ...a.notes]
        };
      }
      return a;
    }));

    addAuditEvent(
      'Workflow Transition',
      applicationId,
      'Application',
      `Stage changed from ${previousStage} to ${toStage}. Decision: ${decision}. Remarks: ${remarks}`,
      previousStage,
      toStage
    );

    addToast('Workflow Transition Recorded', `${app.applicationNumber} moved to ${toStage}`, 'success');
    return { success: true, message: `Application transitioned successfully to ${toStage}` };
  };

  const createApplication = (data: Partial<Application>) => {
    const institution = institutions.find(i => i.id === data.institutionId) || institutions[0];
    const newAppNumber = `AICTE/2026/1-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newApp: Application = {
      id: `app-${Date.now()}`,
      applicationNumber: newAppNumber,
      institutionId: institution.id,
      institutionName: institution.name,
      institutionType: institution.type,
      state: institution.state,
      district: institution.district,
      category: data.category || 'Extension of Approval (EoA)',
      academicYear: '2026-27',
      submissionDate: new Date().toISOString().substring(0, 10),
      currentStage: 'Submitted',
      assignedOfficer: data.assignedOfficer || 'Smt. Ananya Sengupta',
      daysInCurrentStage: 0,
      nextAction: 'Initial fee and affidavit verification',
      overallStatus: 'In Progress',
      priority: data.priority || 'Medium',
      delayRiskScore: 20,
      delayRiskLevel: 'Low',
      delayRiskFactors: ['Newly submitted application in normal processing cycle'],
      documentsCount: 4,
      complianceCount: 2,
      notes: [
        {
          id: `n-${Date.now()}`,
          author: activeUser.name,
          role: activeUser.role,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          content: 'Application successfully created and registered on AICTE portal.',
          stage: 'Submitted'
        }
      ]
    };

    setApplications(prev => [newApp, ...prev]);
    addAuditEvent('Application Created', newApp.id, 'Application', `Created application ${newAppNumber} for ${institution.name}`);
    addToast('Application Registered', `Application ${newAppNumber} generated successfully.`, 'success');
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addAuditEvent('Workflow Transition', id, 'Application', `Application record updated.`);
    addToast('Updated', 'Application details updated.', 'info');
  };

  const assignOfficer = (applicationId: string, officerName: string) => {
    setApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return { ...a, assignedOfficer: officerName };
      }
      return a;
    }));
    addAuditEvent('Officer Assigned', applicationId, 'Application', `Assigned officer: ${officerName}`);
    addToast('Officer Assigned', `Application assigned to ${officerName}`, 'success');
  };

  const addApplicationNote = (applicationId: string, content: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;
    const newNote = {
      id: `n-${Date.now()}`,
      author: activeUser.name,
      role: activeUser.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content,
      stage: app.currentStage
    };
    setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, notes: [newNote, ...a.notes] } : a));
    addToast('Note Added', 'Internal note added to application log.', 'info');
  };

  const createComplianceItem = (item: Partial<ComplianceObligation>) => {
    const institution = institutions.find(i => i.id === item.institutionId) || institutions[0];
    const newComp: ComplianceObligation = {
      id: `cmp-${Date.now()}`,
      complianceId: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      institutionId: institution.id,
      institutionName: institution.name,
      linkedApplicationId: item.linkedApplicationId || '',
      category: item.category || 'Land & Built-up Norms',
      description: item.description || '',
      aphRuleReference: item.aphRuleReference || 'APH 2026-27 Norms',
      requiredDocument: item.requiredDocument || 'Supporting proof',
      dueDate: item.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      status: 'Awaiting Submission',
      responsibleOfficer: item.responsibleOfficer || 'Shri Vikram Malhotra',
      lastUpdated: new Date().toISOString().substring(0, 10),
      reviewerComments: 'Requirement issued.'
    };
    setComplianceItems(prev => [newComp, ...prev]);
    addAuditEvent('Compliance Updated', newComp.id, 'Compliance', `Created compliance obligation ${newComp.complianceId}`);
    addToast('Compliance Record Created', `Obligation ${newComp.complianceId} recorded.`, 'success');
  };

  const updateComplianceStatus = (id: string, status: ComplianceStatus, remarks?: string) => {
    const prevItem = complianceItems.find(c => c.id === id);
    if (!prevItem) return;

    if (status === 'Compliant' && activeUser.role === 'Institutional Representative') {
      addToast('Permission Denied', 'Institutional Representatives cannot mark compliance items as Compliant. Only Compliance Officers or Approval Officers can verify.', 'error');
      return;
    }

    setComplianceItems(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          reviewerComments: remarks || c.reviewerComments,
          lastUpdated: new Date().toISOString().substring(0, 10),
          submissionDate: status === 'Submitted' || status === 'Under Verification' ? new Date().toISOString().substring(0, 10) : c.submissionDate
        };
      }
      return c;
    }));

    addAuditEvent(
      'Compliance Verified',
      id,
      'Compliance',
      `Compliance status changed to ${status}. Remarks: ${remarks || 'None'}`,
      prevItem.status,
      status
    );
    addToast('Compliance Updated', `Status updated to ${status}`, 'success');
  };

  const requestComplianceExtension = (id: string, reason: string) => {
    setComplianceItems(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          extensionRequested: true,
          extensionReason: reason,
          lastUpdated: new Date().toISOString().substring(0, 10)
        };
      }
      return c;
    }));
    addAuditEvent('Compliance Updated', id, 'Compliance', `Extension requested: ${reason}`);
    addToast('Extension Request Filed', 'Extension request logged for compliance review.', 'info');
  };

  const scheduleEvcVisit = (data: Partial<EvcSchedule>): { success: boolean; message: string } => {
    // Conflict detection: Check if any assigned member is already booked on the proposedDate in another scheduled/proposed visit
    const members = data.committeeMembers || [];
    const date = data.proposedDate;

    if (!date) {
      return { success: false, message: 'Please select a proposed visit date.' };
    }

    const conflicts = evcSchedules.filter(s => 
      s.proposedDate === date && 
      (s.status === 'Scheduled' || s.status === 'Proposed') &&
      s.committeeMembers.some(m => members.includes(m))
    );

    if (conflicts.length > 0) {
      const conflictingMemberNames = committeeMembers
        .filter(cm => members.includes(cm.id))
        .map(cm => cm.name)
        .join(', ');
      return {
        success: false,
        message: `Scheduling Conflict Detected! Expert member(s) (${conflictingMemberNames}) are already assigned to visit ${conflicts[0].visitCode} on ${date}. Please choose another expert or alternate date.`
      };
    }

    const institution = institutions.find(i => i.id === data.institutionId) || institutions[0];
    const app = applications.find(a => a.id === data.applicationId) || applications[0];

    const newSchedule: EvcSchedule = {
      id: `evc-${Date.now()}`,
      visitCode: `EVC/2026/VIS-${Math.floor(100 + Math.random() * 900)}`,
      institutionId: institution.id,
      institutionName: institution.name,
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      proposedDate: date,
      visitTime: data.visitTime || '10:00 AM',
      location: data.location || `${institution.district} Campus`,
      status: (data.status as EvcStatus) || 'Proposed',
      committeeMembers: members,
      reportStatus: 'Not Submitted',
      notes: data.notes || 'Proposed physical verification visit'
    };

    setEvcSchedules(prev => [newSchedule, ...prev]);
    addAuditEvent('EVC Scheduled', newSchedule.id, 'EVC', `Scheduled EVC visit ${newSchedule.visitCode} for ${newSchedule.proposedDate}`);
    addToast('EVC Visit Scheduled', `Visit ${newSchedule.visitCode} created without conflicts.`, 'success');
    return { success: true, message: 'Visit scheduled successfully.' };
  };

  const updateEvcStatus = (
    id: string, 
    status: EvcStatus, 
    outcome?: 'Recommended' | 'Deficiencies Noted' | 'Not Recommended', 
    reportStatus?: 'Draft' | 'Submitted' | 'Verified'
  ) => {
    const item = evcSchedules.find(e => e.id === id);
    if (!item) return;

    setEvcSchedules(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status,
          reportOutcome: outcome || e.reportOutcome,
          reportStatus: reportStatus || e.reportStatus,
          reportSubmissionDate: status === 'Completed' ? new Date().toISOString().substring(0, 10) : e.reportSubmissionDate
        };
      }
      return e;
    }));

    addAuditEvent('EVC Completed', id, 'EVC', `EVC visit ${item.visitCode} status updated to ${status}. Outcome: ${outcome || 'N/A'}`);
    addToast('EVC Visit Updated', `Visit status set to ${status}`, 'success');
  };

  const uploadDocument = (doc: Partial<RegisteredDocument>) => {
    const institution = institutions.find(i => i.id === doc.institutionId) || institutions[0];
    const newDoc: RegisteredDocument = {
      id: `doc-${Date.now()}`,
      documentNumber: `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      institutionId: institution.id,
      institutionName: institution.name,
      category: doc.category || 'Land & Property Lease Deed',
      linkedApplicationId: doc.linkedApplicationId || '',
      fileName: doc.fileName || 'uploaded_document.pdf',
      fileSize: doc.fileSize || '2.4 MB',
      issueDate: doc.issueDate || new Date().toISOString().substring(0, 10),
      expiryDate: doc.expiryDate,
      submissionDate: new Date().toISOString().substring(0, 10),
      verificationStatus: 'Pending Verification',
      version: 1,
      uploadedBy: activeUser.name,
      lastUpdated: new Date().toISOString().substring(0, 10),
      ocrExtractedData: doc.ocrExtractedData || {
        institutionNameMatch: true,
        extractedInstitutionName: institution.name,
        extractedDate: doc.issueDate || new Date().toISOString().substring(0, 10),
        extractedExpiryDate: doc.expiryDate,
        extractedDocumentNo: `REG-${Math.floor(10000 + Math.random() * 90000)}`,
        confidenceScore: 95.8,
        humanVerified: false
      },
      comments: doc.comments || 'Uploaded via portal.'
    };

    setDocuments(prev => [newDoc, ...prev]);
    addAuditEvent('Document Uploaded', newDoc.id, 'Document', `Uploaded document ${newDoc.documentNumber} (${newDoc.fileName})`);
    addToast('Document Uploaded', `${newDoc.fileName} registered in Document Registry.`, 'success');
  };

  const verifyDocument = (id: string, status: 'Verified' | 'Flagged Discrepancy' | 'Expired', comments?: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          verificationStatus: status,
          comments: comments || d.comments,
          lastUpdated: new Date().toISOString().substring(0, 10),
          ocrExtractedData: d.ocrExtractedData ? {
            ...d.ocrExtractedData,
            humanVerified: true
          } : undefined
        };
      }
      return d;
    }));

    addAuditEvent('Document Verified', id, 'Document', `Document verification set to ${status}. Comments: ${comments || 'None'}`);
    addToast('Document Verification Updated', `Status marked as ${status}`, 'success');
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'Acknowledged',
          acknowledgedBy: activeUser.name,
          acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return a;
    }));
    addAuditEvent('Alert Acknowledged', id, 'Alert', `Alert acknowledged by ${activeUser.name}`);
    addToast('Alert Acknowledged', 'Alert has been acknowledged.', 'info');
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'Resolved',
          resolvedBy: activeUser.name,
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return a;
    }));
    addAuditEvent('Alert Resolved', id, 'Alert', `Alert marked resolved by ${activeUser.name}`);
    addToast('Alert Resolved', 'Alert status moved to Resolved.', 'success');
  };

  const escalateAlert = (id: string, escalateTo: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          severity: 'Critical',
          escalatedTo: escalateTo
        };
      }
      return a;
    }));
    addAuditEvent('Alert Acknowledged', id, 'Alert', `Alert escalated to ${escalateTo}`);
    addToast('Alert Escalated', `Escalated to ${escalateTo} with Critical priority.`, 'warning');
  };

  const updateWorkflowConfigs = (newConfigs: WorkflowStageConfig[]) => {
    setWorkflowConfigs(newConfigs);
    addAuditEvent('Configuration Changed', 'WORKFLOW_CONFIG', 'System', 'Workflow stage targets and rules updated by administrator.');
    addToast('Configuration Saved', 'Workflow turnaround targets updated.', 'success');
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setApplications(INITIAL_APPLICATIONS);
    setInstitutions(INITIAL_INSTITUTIONS);
    setComplianceItems(INITIAL_COMPLIANCE);
    setEvcSchedules(INITIAL_EVC_SCHEDULES);
    setCommitteeMembers(INITIAL_COMMITTEE_MEMBERS);
    setDocuments(INITIAL_DOCUMENTS);
    setAlerts(INITIAL_ALERTS);
    setAuditEvents(INITIAL_AUDIT_TRAIL);
    setWorkflowConfigs(WORKFLOW_CONFIGS);
    setActiveUserState(INITIAL_USERS[0]);
    addToast('Database Synchronized', 'All council records synchronized with baseline ledger.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedApplicationId,
        setSelectedApplicationId,
        globalSearchQuery,
        setGlobalSearchQuery,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        users,
        activeUser,
        setActiveUser,
        applications,
        institutions,
        complianceItems,
        evcSchedules,
        committeeMembers,
        documents,
        alerts,
        auditEvents,
        workflowConfigs,
        toasts,
        addToast,
        removeToast,
        transitionWorkflow,
        createApplication,
        updateApplication,
        assignOfficer,
        addApplicationNote,
        createComplianceItem,
        updateComplianceStatus,
        requestComplianceExtension,
        scheduleEvcVisit,
        updateEvcStatus,
        uploadDocument,
        verifyDocument,
        acknowledgeAlert,
        resolveAlert,
        escalateAlert,
        updateWorkflowConfigs,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
