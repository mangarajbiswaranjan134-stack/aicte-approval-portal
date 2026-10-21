import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Users2, 
  Check, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Building,
  ShieldAlert
} from 'lucide-react';

export const UserRolesPage: React.FC = () => {
  const { users, activeUser, setActiveUser } = useApp();

  const permissionMatrix: {
    capability: string;
    description: string;
    roles: Record<UserRole, boolean>;
  }[] = [
    {
      capability: 'View All Technical Institutions & Dossiers',
      description: 'Access complete multi-state database of applicant technical institutions',
      roles: {
        'System Administrator': true,
        'Approval Officer': true,
        'Scrutiny Reviewer': true,
        'EVC Coordinator': true,
        'Compliance Officer': true,
        'Institutional Representative': false, // Restricted only to their own institution!
        'Read-Only Auditor': true
      }
    },
    {
      capability: 'Advance Scrutiny & Re-scrutiny Stages',
      description: 'Evaluate physical infrastructure, faculty cadre formulas, and mark scrutiny complete',
      roles: {
        'System Administrator': true,
        'Approval Officer': true,
        'Scrutiny Reviewer': true,
        'EVC Coordinator': false,
        'Compliance Officer': false,
        'Institutional Representative': false,
        'Read-Only Auditor': false
      }
    },
    {
      capability: 'Schedule & Coordinate EVC Peer Visits',
      description: 'Allocate IIT/NIT experts, detect schedule conflicts, and verify inspection reports',
      roles: {
        'System Administrator': true,
        'Approval Officer': true,
        'Scrutiny Reviewer': false,
        'EVC Coordinator': true,
        'Compliance Officer': false,
        'Institutional Representative': false,
        'Read-Only Auditor': false
      }
    },
    {
      capability: 'Verify Statutory Compliance & Affidavits',
      description: 'Review and approve Fire Safety NOCs, AISHE portal uploads, and grievance cells',
      roles: {
        'System Administrator': true,
        'Approval Officer': true,
        'Scrutiny Reviewer': false,
        'EVC Coordinator': false,
        'Compliance Officer': true,
        'Institutional Representative': false,
        'Read-Only Auditor': false
      }
    },
    {
      capability: 'Execute Final Approval Decision',
      description: 'Sign and dispatch digital Extension of Approval (EoA) or Approval Orders',
      roles: {
        'System Administrator': true,
        'Approval Officer': true,
        'Scrutiny Reviewer': false,
        'EVC Coordinator': false,
        'Compliance Officer': false,
        'Institutional Representative': false,
        'Read-Only Auditor': false
      }
    },
    {
      capability: 'Reassign Reviewers & Officers',
      description: 'Modify assigned scrutiny reviewers or compliance officers on active dockets',
      roles: {
        'System Administrator': true,
        'Approval Officer': true,
        'Scrutiny Reviewer': false,
        'EVC Coordinator': false,
        'Compliance Officer': false,
        'Institutional Representative': false,
        'Read-Only Auditor': false
      }
    },
    {
      capability: 'Re-submit Returned Applications',
      description: 'Upload rectified compliance evidence and re-enter evaluation cycle',
      roles: {
        'System Administrator': true,
        'Approval Officer': false,
        'Scrutiny Reviewer': false,
        'EVC Coordinator': false,
        'Compliance Officer': false,
        'Institutional Representative': true,
        'Read-Only Auditor': false
      }
    },
    {
      capability: 'System Configuration & Turnaround SLA Adjustment',
      description: 'Modify stage SLA target days, escalation rules, and reminder thresholds',
      roles: {
        'System Administrator': true,
        'Approval Officer': false,
        'Scrutiny Reviewer': false,
        'EVC Coordinator': false,
        'Compliance Officer': false,
        'Institutional Representative': false,
        'Read-Only Auditor': false
      }
    }
  ];

  const roleList: UserRole[] = [
    'System Administrator',
    'Approval Officer',
    'Scrutiny Reviewer',
    'EVC Coordinator',
    'Compliance Officer',
    'Institutional Representative',
    'Read-Only Auditor'
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Role-Based Access Control & Governance Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforces strict regulatory separation of concerns across 7 administrative profiles.
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span>Active Identity: <strong>{activeUser.name}</strong> ({activeUser.role})</span>
        </div>
      </div>

      {/* Designated Officer Profile Directory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map(u => {
          const isActive = activeUser.id === u.id;
          return (
            <div
              key={u.id}
              onClick={() => setActiveUser(u)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                  {isActive && <UserCheck className="h-4 w-4 text-blue-600" />}
                </div>

                <h3 className="text-xs font-bold text-slate-900">{u.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{u.email}</p>
                <p className="text-[10px] text-slate-400 mt-2">{u.region}</p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={isActive ? 'font-bold text-blue-700' : 'text-slate-400'}>
                  {isActive ? 'Active Identity' : 'Click to Switch'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Permission Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Governance & Authorization Enforcement Matrix</h3>
          <p className="text-xs text-slate-500">
            Green checkmarks denote authorized regulatory actions. Red crosses indicate blocked operations.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                <th className="py-3 px-4 min-w-[240px]">Regulatory Capability</th>
                {roleList.map(role => (
                  <th 
                    key={role} 
                    className={`py-3 px-3 text-center text-[10px] uppercase font-bold tracking-tight ${
                      activeUser.role === role ? 'bg-blue-100/60 text-blue-900' : ''
                    }`}
                  >
                    {role.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{item.capability}</p>
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </td>
                  {roleList.map(role => {
                    const isPermitted = item.roles[role];
                    const isCurrentRole = activeUser.role === role;
                    return (
                      <td 
                        key={role} 
                        className={`py-3 px-3 text-center ${isCurrentRole ? 'bg-blue-50/40' : ''}`}
                      >
                        {isPermitted ? (
                          <div className="w-5 h-5 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
