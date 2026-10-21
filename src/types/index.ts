export type WorkflowStage = 
  | 'Submitted'
  | 'Scrutiny'
  | 'Re-scrutiny'
  | 'EVC Pending'
  | 'EVC Completed'
  | 'SAC/SHC Review'
  | 'Decision Pending'
  | 'Approved'
  | 'Returned for Correction'
  | 'Rejected';

export type ApplicationCategory = 
  | 'New Technical Institution'
  | 'Extension of Approval (EoA)'
  | 'Increase in Intake'
  | 'Introduction of New Course'
  | 'Change of Site/Location'
  | 'Closure of Program'
  | 'Conversion of Diploma to Degree';

export type InstitutionType = 
  | 'Government'
  | 'Government-Aided'
  | 'Private-Self Financing'
  | 'University Deemed'
  | 'State Private University'
  | 'Central University';

export type UserRole = 
  | 'System Administrator'
  | 'Approval Officer'
  | 'Scrutiny Reviewer'
  | 'EVC Coordinator'
  | 'Compliance Officer'
  | 'Institutional Representative'
  | 'Read-Only Auditor';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  state: string;
  district: string;
  pincode: string;
  address: string;
  establishedYear: number;
  principalName: string;
  email: string;
  phone: string;
  landAreaAcres: number;
  builtUpAreaSqM: number;
  aictePermanentId: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  institutionId: string;
  institutionName: string;
  institutionType: InstitutionType;
  state: string;
  district: string;
  category: ApplicationCategory;
  academicYear: string;
  submissionDate: string;
  currentStage: WorkflowStage;
  assignedOfficer: string;
  daysInCurrentStage: number;
  nextAction: string;
  overallStatus: 'In Progress' | 'Action Required' | 'Approved' | 'Returned' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  delayRiskScore: number; // 0-100
  delayRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  delayRiskFactors: string[];
  documentsCount: number;
  complianceCount: number;
  notes: ApplicationNote[];
}

export interface ApplicationNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  stage: WorkflowStage;
}

export interface WorkflowTransition {
  id: string;
  applicationId: string;
  fromStage: WorkflowStage;
  toStage: WorkflowStage;
  performedBy: string;
  role: string;
  timestamp: string;
  remarks: string;
  decision: 'Approved' | 'Recommended' | 'Returned' | 'Rejected' | 'Transitioned';
}

export type ComplianceCategory = 
  | 'Land & Built-up Norms'
  | 'Safety & Fire NOC'
  | 'Faculty Cadre & Pay'
  | 'Anti-Ragging & ICC'
  | 'Grievance Redressal'
  | 'AISHE / Mandatory Disclosure'
  | 'NBA / NAAC Accreditation'
  | 'Financial Undertaking';

export type ComplianceStatus = 
  | 'Not Started'
  | 'Awaiting Submission'
  | 'Submitted'
  | 'Under Verification'
  | 'Compliant'
  | 'Returned for Correction'
  | 'Overdue'
  | 'Waived';

export interface ComplianceObligation {
  id: string;
  complianceId: string;
  institutionId: string;
  institutionName: string;
  linkedApplicationId: string;
  category: ComplianceCategory;
  description: string;
  aphRuleReference: string;
  requiredDocument: string;
  dueDate: string;
  submissionDate?: string;
  status: ComplianceStatus;
  responsibleOfficer: string;
  lastUpdated: string;
  reviewerComments?: string;
  extensionRequested?: boolean;
  extensionReason?: string;
}

export type EvcStatus = 
  | 'Proposed'
  | 'Awaiting Confirmation'
  | 'Scheduled'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled';

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  organization: string;
  discipline: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  activeVisitsCount: number;
  available: boolean;
}

export interface EvcSchedule {
  id: string;
  visitCode: string;
  institutionId: string;
  institutionName: string;
  applicationId: string;
  applicationNumber: string;
  proposedDate: string;
  visitTime: string;
  location: string;
  status: EvcStatus;
  committeeMembers: string[]; // Member IDs or names
  reportStatus: 'Not Submitted' | 'Draft' | 'Submitted' | 'Verified';
  reportSubmissionDate?: string;
  reportOutcome?: 'Recommended' | 'Deficiencies Noted' | 'Not Recommended';
  notes?: string;
}

export type DocumentCategory = 
  | 'Land & Property Lease Deed'
  | 'Approved Building Plan'
  | 'Fire Safety NOC'
  | 'Institutional Undertaking'
  | 'Society/Trust Registration'
  | 'Pollution Control Certificate'
  | 'EVC Evaluation Report'
  | 'Financial Audit & FDR'
  | 'Affidavit for Faculty Cadre';

export interface RegisteredDocument {
  id: string;
  documentNumber: string;
  institutionId: string;
  institutionName: string;
  category: DocumentCategory;
  linkedApplicationId: string;
  fileName: string;
  fileSize: string;
  issueDate: string;
  expiryDate?: string;
  submissionDate: string;
  verificationStatus: 'Pending Verification' | 'Verified' | 'Flagged Discrepancy' | 'Expired';
  version: number;
  uploadedBy: string;
  lastUpdated: string;
  ocrExtractedData?: {
    institutionNameMatch: boolean;
    extractedInstitutionName?: string;
    extractedDate?: string;
    extractedExpiryDate?: string;
    extractedDocumentNo?: string;
    confidenceScore: number;
    humanVerified: boolean;
  };
  comments?: string;
}

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type AlertCategory = 
  | 'Application Pending Beyond Target'
  | 'Missing Information'
  | 'Compliance Deadline Approaching'
  | 'Compliance Overdue'
  | 'Document Expiring Soon'
  | 'Document Expired'
  | 'EVC Confirmation Pending'
  | 'EVC Scheduling Conflict'
  | 'EVC Report Pending'
  | 'Reviewer Assignment Pending'
  | 'High Delay Risk';

export interface AlertItem {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  institutionId: string;
  institutionName: string;
  linkedId: string; // ApplicationId or ComplianceId or DocId
  linkedType: 'Application' | 'Compliance' | 'Document' | 'EVC';
  createdAt: string;
  dueDate?: string;
  responsibleOfficer: string;
  explanation: string;
  recommendedAction: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  escalatedTo?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType: 
    | 'Workflow Transition'
    | 'Application Created'
    | 'Officer Assigned'
    | 'Compliance Updated'
    | 'Compliance Verified'
    | 'Document Uploaded'
    | 'Document Verified'
    | 'EVC Scheduled'
    | 'EVC Rescheduled'
    | 'EVC Completed'
    | 'Alert Acknowledged'
    | 'Alert Resolved'
    | 'Configuration Changed';
  affectedRecordId: string;
  affectedRecordType: 'Application' | 'Compliance' | 'Document' | 'EVC' | 'Alert' | 'System';
  previousState?: string;
  newState?: string;
  remarks: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  institutionId?: string; // if role is Institutional Representative
}

export interface WorkflowStageConfig {
  stage: WorkflowStage;
  targetDays: number;
  responsibleRole: UserRole;
  allowedNextStages: WorkflowStage[];
  requiredChecklist: string[];
}
