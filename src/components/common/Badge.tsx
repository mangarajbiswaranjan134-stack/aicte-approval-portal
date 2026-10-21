import React from 'react';
import { WorkflowStage, AlertSeverity, ComplianceStatus, EvcStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  size = 'md',
  className = '' 
}) => {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-teal-50 text-teal-700 border-teal-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export const StageBadge: React.FC<{ stage: WorkflowStage }> = ({ stage }) => {
  switch (stage) {
    case 'Approved':
      return <Badge variant="success">✓ Approved</Badge>;
    case 'Rejected':
      return <Badge variant="danger">✗ Rejected</Badge>;
    case 'Returned for Correction':
      return <Badge variant="warning">↺ Returned for Correction</Badge>;
    case 'Scrutiny':
    case 'Re-scrutiny':
      return <Badge variant="info">🔍 {stage}</Badge>;
    case 'EVC Pending':
    case 'EVC Completed':
      return <Badge variant="primary">🏛️ {stage}</Badge>;
    case 'SAC/SHC Review':
      return <Badge variant="warning">⚖️ SAC/SHC Review</Badge>;
    case 'Decision Pending':
      return <Badge variant="primary">⏳ Decision Pending</Badge>;
    case 'Submitted':
    default:
      return <Badge variant="neutral">📄 {stage}</Badge>;
  }
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'Critical':
      return <Badge variant="danger" className="animate-pulse font-semibold">🔴 Critical</Badge>;
    case 'High':
      return <Badge variant="danger">🟠 High</Badge>;
    case 'Medium':
      return <Badge variant="warning">🟡 Medium</Badge>;
    case 'Low':
    default:
      return <Badge variant="secondary">🟢 Low</Badge>;
  }
};

export const ComplianceStatusBadge: React.FC<{ status: ComplianceStatus }> = ({ status }) => {
  switch (status) {
    case 'Compliant':
      return <Badge variant="success">✓ Compliant</Badge>;
    case 'Overdue':
      return <Badge variant="danger">⚠️ Overdue</Badge>;
    case 'Returned for Correction':
      return <Badge variant="warning">↺ Correction Needed</Badge>;
    case 'Under Verification':
      return <Badge variant="info">👁️ Under Verification</Badge>;
    case 'Submitted':
      return <Badge variant="primary">📥 Submitted</Badge>;
    case 'Awaiting Submission':
    default:
      return <Badge variant="neutral">⏳ Awaiting Submission</Badge>;
  }
};

export const EvcStatusBadge: React.FC<{ status: EvcStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return <Badge variant="success">✓ Completed</Badge>;
    case 'Scheduled':
      return <Badge variant="primary">📅 Scheduled</Badge>;
    case 'Proposed':
      return <Badge variant="info">📝 Proposed</Badge>;
    case 'Awaiting Confirmation':
      return <Badge variant="warning">⏳ Awaiting Confirmation</Badge>;
    case 'Cancelled':
      return <Badge variant="danger">Cancelled</Badge>;
    case 'Rescheduled':
      return <Badge variant="warning">↺ Rescheduled</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const RiskBadge: React.FC<{ score: number; level: string }> = ({ score, level }) => {
  if (level === 'Critical' || score >= 80) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">⚠️ Risk {score}% (Critical)</span>;
  }
  if (level === 'High' || score >= 60) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">⚡ Risk {score}% (High)</span>;
  }
  if (level === 'Medium' || score >= 35) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">ℹ️ Risk {score}% (Medium)</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Risk {score}% (Low)</span>;
};
