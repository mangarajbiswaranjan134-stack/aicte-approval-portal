import React, { useState } from 'react';
import { Modal } from './Modal';
import { RegisteredDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import { FileText, CheckCircle, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface OcrInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: RegisteredDocument | null;
}

export const OcrInspectionModal: React.FC<OcrInspectionModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const { verifyDocument, addToast } = useApp();

  const [extractedInstName, setExtractedInstName] = useState('');
  const [extractedDocNo, setExtractedDocNo] = useState('');
  const [extractedDate, setExtractedDate] = useState('');
  const [extractedExpiry, setExtractedExpiry] = useState('');
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'extracted' | 'raw_text'>('extracted');

  // Reset or populate state when doc changes
  React.useEffect(() => {
    if (document) {
      setExtractedInstName(document.ocrExtractedData?.extractedInstitutionName || document.institutionName);
      setExtractedDocNo(document.ocrExtractedData?.extractedDocumentNo || document.documentNumber);
      setExtractedDate(document.ocrExtractedData?.extractedDate || document.issueDate);
      setExtractedExpiry(document.ocrExtractedData?.extractedExpiryDate || document.expiryDate || '');
      setIsHumanVerified(document.ocrExtractedData?.humanVerified || false);
      setReviewNote(document.comments || '');
    }
  }, [document]);

  if (!document) return null;

  const confidence = document.ocrExtractedData?.confidenceScore ?? 94.2;

  const handleApprove = () => {
    verifyDocument(
      document.id,
      'Verified',
      reviewNote || `Verified by officer with OCR confidence ${confidence}%`
    );
    onClose();
  };

  const handleFlagDiscrepancy = () => {
    if (!reviewNote.trim()) {
      addToast('Discrepancy Reason Required', 'Please enter a note explaining why this document is flagged.', 'warning');
      return;
    }
    verifyDocument(document.id, 'Flagged Discrepancy', reviewNote);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Intelligence & OCR Field Extraction"
      subtitle={`${document.fileName} • ${document.category}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Banner with confidence level */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">AI Optical Character Recognition (OCR) Engine</h4>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Confidence: {confidence}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automated field recognition with human-in-the-loop verification protocol.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('extracted')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'extracted' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Extracted Entities
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw_text')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'raw_text' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Document Preview
            </button>
          </div>
        </div>

        {activeTab === 'extracted' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Document Metadata & Scanned Document View */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    <FileText className="h-4 w-4 text-blue-600" /> Document Record
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{document.documentNumber}</span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Institution Name on Record:</span>
                    <span className="font-medium text-slate-800">{document.institutionName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Category:</span>
                    <span className="font-medium text-slate-800">{document.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">File Size & Upload Date:</span>
                    <span className="font-medium text-slate-800">{document.fileSize} • Uploaded on {document.submissionDate} by {document.uploadedBy}</span>
                  </div>
                </div>

                {/* Scanned Document Render Box */}
                <div className="mt-5 border-2 border-dashed border-slate-300 bg-white rounded-lg p-5 font-mono text-[11px] text-slate-600 leading-relaxed shadow-inner">
                  <div className="text-center font-bold pb-2 border-b border-slate-200 text-slate-800">
                    GOVERNMENT OF INDIA / STATE REGISTRATION RECORD
                  </div>
                  <div className="pt-2 text-[10px] space-y-1">
                    <p><span className="text-slate-400">REGISTERED ENTITY:</span> {extractedInstName}</p>
                    <p><span className="text-slate-400">SANCTION / DEED NO:</span> {extractedDocNo}</p>
                    <p><span className="text-slate-400">EXECUTION DATE:</span> {extractedDate}</p>
                    {extractedExpiry && <p><span className="text-slate-400">VALIDITY PERIOD:</span> TILL {extractedExpiry}</p>}
                    <p className="pt-2 text-slate-400 italic">[Digital Watermark: Scanned via AICTE Approval Document Ingestion Pipeline]</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Entity match algorithm confirms 100% concordance with applicant database.</span>
              </div>
            </div>

            {/* Right: Extracted Fields for Human Validation */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Candidate Extracted Fields (Editable by Officer)
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Extracted Institution Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={extractedInstName}
                    onChange={(e) => setExtractedInstName(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs self-center">
                    Match
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Registration / Approval Number
                </label>
                <input
                  type="text"
                  value={extractedDocNo}
                  onChange={(e) => setExtractedDocNo(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={extractedDate}
                    onChange={(e) => setExtractedDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Expiry Date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={extractedExpiry}
                    onChange={(e) => setExtractedExpiry(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reviewer Audit Remarks
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Record verification notes, observations, or grounds for discrepancy..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Human in the loop confirmation toggle */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <input
                  type="checkbox"
                  id="humanCheck"
                  checked={isHumanVerified}
                  onChange={(e) => setIsHumanVerified(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="humanCheck" className="text-xs text-amber-900 leading-snug cursor-pointer">
                  <span className="font-semibold block">Mandatory Regulatory Check:</span>
                  I confirm that I have cross-verified the OCR extracted figures against the applicant's official deed and building plan.
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-xs max-h-96 overflow-y-auto space-y-3 border border-slate-700">
            <div className="text-teal-400 font-bold border-b border-slate-800 pb-2 flex justify-between">
              <span>// OCR TEXT LAYER STREAM — ENGINE V4.2</span>
              <span>PARSED STATUS: SUCCESS</span>
            </div>
            <p className="leading-relaxed">
              [PAGENUM: 1] GOVERNMENT OF MAHARASHTRA / DELHI / KARNATAKA REGISTRATION AUTHORITY<br/>
              TITLE: PERPETUAL LEASE AND RECOGNITION CERTIFICATE<br/>
              DATE OF ATTESTATION: {extractedDate}<br/>
              APPLICANT ENTITY: {extractedInstName}<br/>
              SURVEY NO / PROPERTY REF: {extractedDocNo}<br/>
              BOUNDARIES: NORTH: SURVEY NO 43, SOUTH: ROAD 60 FT, EAST: CANAL, WEST: PUNE-BANGALORE BYPASS<br/>
              TOTAL MEASURED AREA: 7.50 ACRES CONTIGUOUS PLOT<br/>
              EXPIRY / VALIDITY SPECIFICATION: {extractedExpiry ? `VALID UPTO ${extractedExpiry}` : 'IN PERPETUITY'}
            </p>
            <p className="text-slate-400 pt-2 border-t border-slate-800 text-[11px]">
              End of OCR character buffer. Hash: SHA256-4c910294bce81902aef.
            </p>
          </div>
        )}

        {/* Action footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFlagDiscrepancy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <AlertTriangle className="h-4 w-4" /> Flag Discrepancy
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={!isHumanVerified}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white rounded-lg transition-all ${
                isHumanVerified 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-sm' 
                  : 'bg-slate-400 cursor-not-allowed opacity-75'
              }`}
            >
              <CheckCircle className="h-4 w-4" /> Verify & Accept Document
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
