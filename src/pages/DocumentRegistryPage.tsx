import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RegisteredDocument, DocumentCategory } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { OcrInspectionModal } from '../components/common/OcrInspectionModal';
import { 
  FolderLock, 
  Search, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Building,
  Eye,
  FileCheck
} from 'lucide-react';

export const DocumentRegistryPage: React.FC = () => {
  const { 
    documents, 
    institutions, 
    applications, 
    uploadDocument, 
    activeUser,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectingDoc, setInspectingDoc] = useState<RegisteredDocument | null>(null);

  // Upload modal form states
  const [newInstitutionId, setNewInstitutionId] = useState(institutions[0]?.id || '');
  const [newLinkedAppId, setNewLinkedAppId] = useState(applications[0]?.id || '');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('Land & Property Lease Deed');
  const [newFileName, setNewFileName] = useState('');
  const [newIssueDate, setNewIssueDate] = useState('2025-06-15');
  const [newExpiryDate, setNewExpiryDate] = useState('2028-06-14');
  const [simulateOcrConfidence, setSimulateOcrConfidence] = useState(96.4);

  const categories: DocumentCategory[] = [
    'Land & Property Lease Deed',
    'Approved Building Plan',
    'Fire Safety NOC',
    'Institutional Undertaking',
    'Society/Trust Registration',
    'Pollution Control Certificate',
    'EVC Evaluation Report',
    'Financial Audit & FDR',
    'Affidavit for Faculty Cadre'
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedVerificationStatus === 'all' || doc.verificationStatus === selectedVerificationStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      addToast('File Name Required', 'Please specify the name of the file to be ingested.', 'warning');
      return;
    }

    const institution = institutions.find(i => i.id === newInstitutionId);

    uploadDocument({
      institutionId: newInstitutionId,
      linkedApplicationId: newLinkedAppId,
      category: newCategory,
      fileName: newFileName.endsWith('.pdf') ? newFileName : `${newFileName}.pdf`,
      fileSize: '3.2 MB',
      issueDate: newIssueDate,
      expiryDate: newExpiryDate || undefined,
      ocrExtractedData: {
        institutionNameMatch: true,
        extractedInstitutionName: institution?.name || 'Institution',
        extractedDate: newIssueDate,
        extractedExpiryDate: newExpiryDate,
        extractedDocumentNo: `REG-AICTE-${Math.floor(10000 + Math.random() * 90000)}`,
        confidenceScore: simulateOcrConfidence,
        humanVerified: false
      }
    });

    setIsUploadModalOpen(false);
    setNewFileName('');
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderLock className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Document Registry & OCR Document Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of statutory institutional deeds, safety certifications, and OCR field verification.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={activeUser.role === 'Read-Only Auditor'}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
        >
          <UploadCloud className="h-4 w-4" /> Ingest & OCR Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Document Number, Institution, or File Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Categories ({documents.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedVerificationStatus}
            onChange={(e) => setSelectedVerificationStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">All Verification States</option>
            <option value="Verified">Verified</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Flagged Discrepancy">Flagged Discrepancy</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Documents Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Registered Documents Dossier</h3>
          <span className="text-xs text-slate-500">{filteredDocs.length} documents on file</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Doc Number</th>
                <th className="py-3 px-4">Institution & File Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Issue & Expiry Dates</th>
                <th className="py-3 px-4">AI OCR Confidence</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => {
                const isExpired = doc.expiryDate && new Date(doc.expiryDate) < today;
                const isExpiringSoon = doc.expiryDate && !isExpired && (new Date(doc.expiryDate).getTime() - today.getTime()) < 30 * 86400000;

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {doc.documentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{doc.institutionName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <FileText className="h-3 w-3 text-slate-400" /> {doc.fileName} ({doc.fileSize})
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {doc.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-slate-600">Issued: {doc.issueDate}</p>
                      {doc.expiryDate ? (
                        <p className={`text-[11px] font-medium ${
                          isExpired 
                            ? 'text-rose-600 font-bold' 
                            : isExpiringSoon 
                            ? 'text-amber-600 font-bold' 
                            : 'text-slate-500'
                        }`}>
                          Expires: {doc.expiryDate}
                          {isExpired && ' (EXPIRED)'}
                          {isExpiringSoon && ' (Expiring Soon)'}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400">Validity: In Perpetuity</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {doc.ocrExtractedData?.confidenceScore ?? 94.0}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {doc.ocrExtractedData?.humanVerified ? 'Human Verified' : 'AI Extracted'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        doc.verificationStatus === 'Verified'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : doc.verificationStatus === 'Flagged Discrepancy'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : doc.verificationStatus === 'Expired'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {doc.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectingDoc(doc)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect OCR
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Document Upload & Ingestion */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Ingest Institutional Document via OCR Pipeline"
        subtitle="Simulates secure document upload and automated entity extraction"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
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
            <label className="block font-medium text-slate-700 mb-1">Document Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Document File Name</label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. PMC_Fire_Safety_NOC_Renewed_2026.pdf"
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Issue / Attestation Date</label>
              <input
                type="date"
                value={newIssueDate}
                onChange={(e) => setNewIssueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Expiry Date (if applicable)</label>
              <input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] leading-relaxed">
            The OCR engine will immediately parse text layers, compare the extracted institutional title against our database, and flag potential discrepancies for human verification.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Upload & Run OCR
            </button>
          </div>
        </form>
      </Modal>

      {/* OCR Document Inspection Modal */}
      <OcrInspectionModal
        isOpen={Boolean(inspectingDoc)}
        onClose={() => setInspectingDoc(null)}
        document={inspectingDoc}
      />
    </div>
  );
};
