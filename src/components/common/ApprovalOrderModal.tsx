import React from 'react';
import { Modal } from './Modal';
import { Application, Institution } from '../../types';
import { Award, Printer, ShieldCheck, Download, CheckCircle, FileText } from 'lucide-react';

interface ApprovalOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  institution?: Institution | null;
}

export const ApprovalOrderModal: React.FC<ApprovalOrderModalProps> = ({
  isOpen,
  onClose,
  application,
  institution
}) => {
  if (!application) return null;

  const currentYear = application.academicYear || '2026-27';
  const dispatchRefNo = `F.No. AICTE/AB/${application.state.toUpperCase().substring(0, 3)}/1-${application.id.replace('app-', '')}/2026-EOA`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official AICTE Approval Order (Extension of Approval - EoA)"
      subtitle={`Application: ${application.applicationNumber} • Academic Year ${currentYear}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs no-print">
          <div className="flex items-center gap-2 text-teal-800 font-semibold">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Digitally Attested & Published to National AICTE Approval Portal</span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Print / Save Formal Order
          </button>
        </div>

        {/* Printable Official Government Letterhead Document */}
        <div className="bg-white p-8 rounded-xl border-2 border-slate-300 shadow-md font-serif text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src="/aicte-logo.png" alt="AICTE" className="h-16 w-16 object-contain" />
              <div className="text-center">
                <h1 className="text-base font-bold tracking-wider uppercase text-slate-900 font-sans">
                  All India Council for Technical Education
                </h1>
                <p className="text-xs text-slate-600 font-sans font-medium">
                  (A Statutory Body of the Government of India, Ministry of Education)
                </p>
                <p className="text-[11px] text-slate-500 font-sans">
                  Nelson Mandela Marg, Vasant Kunj, New Delhi-110070 • Website: www.aicte-india.org
                </p>
              </div>
            </div>
            <div className="text-xs font-bold font-sans tracking-wide uppercase bg-slate-100 py-1 text-slate-800 rounded">
              APPROVAL PROCESS 2026-27 — EXTENSION OF APPROVAL (EoA) ORDER
            </div>
          </div>

          {/* Reference Meta */}
          <div className="flex justify-between items-start text-xs font-sans">
            <div>
              <p><strong>{dispatchRefNo}</strong></p>
              <p className="text-slate-600">To,</p>
              <p className="font-semibold">The Principal Secretary / Directorate of Technical Education</p>
              <p className="text-slate-600">Government of {application.state}</p>
            </div>
            <div className="text-right">
              <p><strong>Date of Dispatch:</strong> 22-Sep-2026</p>
              <p className="text-slate-600">Cycle: Academic Year {currentYear}</p>
              <p className="text-slate-600">Status: <span className="font-bold text-teal-700">GRANTED</span></p>
            </div>
          </div>

          {/* Subject */}
          <div className="text-xs leading-relaxed">
            <p>
              <strong>Sub:</strong> Grant of Extension of Approval (EoA) for Academic Year {currentYear} to{' '}
              <span className="font-bold uppercase">{application.institutionName}</span>,{' '}
              located at {application.district}, {application.state}.
            </p>
          </div>

          {/* Preamble */}
          <div className="text-xs leading-relaxed space-y-2 text-justify font-sans">
            <p>
              Sir / Madam,
            </p>
            <p>
              In terms of the provisions under the All India Council for Technical Education (Grant of Approvals for Technical Education) Regulations, 2020 notified on 4th February 2020, and the norms, standards, procedures and conditions prescribed by the Council from time to time in the official <strong>Approval Process Handbook (APH 2026-27)</strong>, I am directed to convey the approval to:
            </p>
          </div>

          {/* Institution Matrix Table */}
          <div className="border border-slate-300 rounded overflow-hidden text-xs font-sans">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50">
                  <td className="p-2 font-bold w-1/3">Permanent Institute ID:</td>
                  <td className="p-2 font-mono">{institution?.aictePermanentId || '1-4293819'}</td>
                  <td className="p-2 font-bold w-1/4">Application ID:</td>
                  <td className="p-2 font-mono font-semibold text-blue-700">{application.applicationNumber}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Name of the Institution:</td>
                  <td className="p-2 font-semibold" colSpan={3}>{application.institutionName}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-bold">Institution Address:</td>
                  <td className="p-2" colSpan={3}>{institution?.address || `${application.district}, ${application.state}`}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Institution Type:</td>
                  <td className="p-2">{application.institutionType}</td>
                  <td className="p-2 font-bold">Region:</td>
                  <td className="p-2">{application.state} Regional Directorate</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sanctioned Courses Matrix */}
          <div className="space-y-2 font-sans">
            <p className="text-xs font-bold uppercase text-slate-800">
              Sanctioned Programs & Approved Intake Capacity for {currentYear}:
            </p>
            <table className="w-full text-xs text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Program</th>
                  <th className="p-2 border-r border-slate-300">Level</th>
                  <th className="p-2 border-r border-slate-300">Course / Specialization</th>
                  <th className="p-2 border-r border-slate-300 text-center">Approved Intake 2025-26</th>
                  <th className="p-2 border-r border-slate-300 text-center bg-blue-50">Approved Intake {currentYear}</th>
                  <th className="p-2 text-center">Accreditation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 border-r border-slate-200 font-medium">Engineering & Tech</td>
                  <td className="p-2 border-r border-slate-200">Undergraduate</td>
                  <td className="p-2 border-r border-slate-200">Computer Science & Engineering</td>
                  <td className="p-2 border-r border-slate-200 text-center">120</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-blue-700 bg-blue-50/50">180</td>
                  <td className="p-2 text-center text-teal-700 font-semibold">NBA Tier-1</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-medium">Engineering & Tech</td>
                  <td className="p-2 border-r border-slate-200">Undergraduate</td>
                  <td className="p-2 border-r border-slate-200">Artificial Intelligence & Machine Learning</td>
                  <td className="p-2 border-r border-slate-200 text-center">60</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-blue-700 bg-blue-50/50">120</td>
                  <td className="p-2 text-center text-slate-600">Eligible</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-medium">Engineering & Tech</td>
                  <td className="p-2 border-r border-slate-200">Undergraduate</td>
                  <td className="p-2 border-r border-slate-200">Electronics & Communication Engineering</td>
                  <td className="p-2 border-r border-slate-200 text-center">120</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-blue-700 bg-blue-50/50">120</td>
                  <td className="p-2 text-center text-teal-700 font-semibold">NBA Tier-1</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-medium">Engineering & Tech</td>
                  <td className="p-2 border-r border-slate-200">Postgraduate</td>
                  <td className="p-2 border-r border-slate-200">M.Tech Structural Engineering</td>
                  <td className="p-2 border-r border-slate-200 text-center">18</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-blue-700 bg-blue-50/50">24</td>
                  <td className="p-2 text-center text-slate-600">NAAC A++</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Regulatory Conditions */}
          <div className="text-[11px] font-sans text-slate-600 leading-relaxed border-t border-slate-200 pt-3 space-y-1">
            <p><strong>Important Regulatory Notes:</strong></p>
            <p>1. The institution shall operate in accordance with mandatory faculty cadre ratios (1:2:6) and pay scale guidelines as prescribed in APH 2026-27 Chapter VII.</p>
            <p>2. Unexpired Fire Safety NOC and barrier-free Divyangjan accessibility norms must be maintained continuously under Clause 8.4.</p>
            <p>3. Strict adherence to Anti-Ragging regulations (Notification F.No.37-3/Legal/AICTE/2009) is mandatory.</p>
          </div>

          {/* Digital Signature & QR Verification Footer */}
          <div className="pt-6 border-t-2 border-slate-800 flex items-end justify-between font-sans">
            <div className="space-y-1 text-center">
              {/* Simulated QR Code */}
              <div className="w-16 h-16 border-2 border-slate-900 p-1 flex items-center justify-center font-mono text-[9px] font-bold text-slate-900 bg-slate-50">
                [AICTE QR VERIFIED]
              </div>
              <p className="text-[9px] text-slate-400">Scan to Verify Authenticity</p>
            </div>

            <div className="text-right space-y-0.5 text-xs">
              <div className="text-blue-900 font-serif italic text-sm font-bold">
                Prof. Rajive Kumar
              </div>
              <p className="font-bold text-slate-800">Member Secretary</p>
              <p className="text-[11px] text-slate-500">All India Council for Technical Education</p>
              <p className="text-[10px] text-teal-700 font-semibold">Digitally Signed on 22-Sep-2026 14:10:02 IST</p>
            </div>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="flex justify-end pt-2 no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Order
          </button>
        </div>
      </div>
    </Modal>
  );
};
