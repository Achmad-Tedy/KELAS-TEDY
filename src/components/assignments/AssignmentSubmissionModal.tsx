import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Assignment, Group, Student } from '../../types';
import {
  X,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  Users,
  User,
  Paperclip,
  Check,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { triggerFileDownload, formatBytes, getFileTypeInfo } from '../../utils/fileHelper';

interface AssignmentSubmissionModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignmentSubmissionModal: React.FC<AssignmentSubmissionModalProps> = ({
  assignment,
  isOpen,
  onClose,
}) => {
  const {
    students,
    groups,
    submissions,
    submitAssignmentWork,
    getStudentsByClass,
  } = useSchool();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [submissionNote, setSubmissionNote] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !assignment) return null;

  const isGroupTask = assignment.type === 'group';
  const isSingleFileGroup = assignment.submissionMode === 'single_file_group';

  // Eligible groups
  const targetGroups = groups.filter(g =>
    isGroupTask && assignment.targetGroupIds?.includes(g.id)
  );

  const activeSubmissions = submissions.filter(s => s.assignmentId === assignment.id);

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    setFileType(file.type);

    try {
      const objUrl = URL.createObjectURL(file);
      setFileUrl(objUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    let studentId = selectedStudentId;
    let groupId = selectedGroupId;

    if (isGroupTask && isSingleFileGroup) {
      const grp = groups.find(g => g.id === groupId);
      if (grp && !studentId) {
        studentId = grp.leaderId || grp.memberIds[0];
      }
    }

    submitAssignmentWork({
      assignmentId: assignment.id,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      groupId: isGroupTask ? groupId : undefined,
      studentId,
      fileName: fileName.trim(),
      fileSize: fileSize || '1.8 MB',
      fileUrl: fileUrl || undefined,
      fileType: fileType || undefined,
      note: submissionNote.trim(),
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setFileName('');
      setFileSize('');
      setFileUrl('');
      setFileType('');
      setSubmissionNote('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {isGroupTask ? 'Pengumpulan Kelompok' : 'Pengumpulan Individu'}
              </span>
              <span className="text-xs text-slate-500">
                Mode: {isSingleFileGroup ? '1 File per Kelompok' : 'File Individu'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{assignment.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Status Tracker per Group */}
          {isGroupTask && (
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Status Pengumpulan Kelompok Terdaftar</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {targetGroups.map(grp => {
                  const submission = activeSubmissions.find(s => s.groupId === grp.id);
                  const isSubmitted = Boolean(submission);
                  const submitter = students.find(s => s.id === submission?.studentId);

                  return (
                    <div
                      key={grp.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isSubmitted
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{grp.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {grp.memberIds.length} Anggota (Ketua:{' '}
                            {students.find(s => s.id === grp.leaderId)?.name || '-'})
                          </div>
                        </div>
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            🟢 Sudah Dikumpulkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Belum Ada File
                          </span>
                        )}
                      </div>

                      {submission && (
                        <div className="mt-2.5 pt-2 border-t border-emerald-100 text-[11px] space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5 text-emerald-900 font-semibold">
                            <div className="flex items-center gap-1.5 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{submission.fileName}</span>
                              <span className="text-emerald-700 font-normal">({submission.fileSize})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                triggerFileDownload(submission.fileUrl, submission.fileName, {
                                  assignmentTitle: assignment.title,
                                  studentName: submitter?.name,
                                  submittedAt: submission.submittedAt,
                                  note: submission.note,
                                })
                              }
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                              title="Buka / Unduh Berkas"
                            >
                              <Download className="w-3 h-3" />
                              <span>Unduh</span>
                            </button>
                          </div>
                          <div className="text-slate-500">
                            Diunggah oleh: <strong className="text-slate-700">{submitter?.name}</strong>
                          </div>
                          {isSingleFileGroup && (
                            <div className="text-emerald-800 text-[10px] bg-emerald-100/60 p-1 rounded font-medium">
                              ✓ Seluruh {grp.memberIds.length} anggota kelompok otomatis ditandai "Sudah Mengumpulkan".
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form to simulate or upload a submission */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Simulasi Unggah Berkas Pengumpulan</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Guru atau siswa dapat menguji mekanisme pengumpulan berkas (misal file PDF laporan tugas kelompok).
            </p>

            <form onSubmit={handleSimulatedUpload} className="space-y-3">
              {uploadSuccess && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Berkas berhasil diunggah! Status kelompok langsung diperbarui.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isGroupTask && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Kelompok:</label>
                    <select
                      value={selectedGroupId}
                      onChange={e => {
                        setSelectedGroupId(e.target.value);
                        const grp = targetGroups.find(g => g.id === e.target.value);
                        if (grp) {
                          setSelectedStudentId(grp.leaderId || grp.memberIds[0]);
                          setFileName(`tugas-${assignment.title.toLowerCase().slice(0, 10).replace(/\s+/g, '-')}-${grp.name.toLowerCase().replace(/\s+/g, '')}.pdf`);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      required
                    >
                      <option value="">-- Pilih Kelompok Pengunggah --</option>
                      {targetGroups.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isGroupTask ? 'Anggota Yang Mewakili Mengunggah:' : 'Nama Siswa:'}
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    required
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih / Unggah Berkas File Dokumen:
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChosen}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar,.txt"
                  className="hidden"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    placeholder="Contoh: tugas-aljabar-kelompok1.pdf"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas</span>
                  </button>
                </div>
                {fileName && (
                  <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      Ukuran: <strong>{fileSize || '1.8 MB'}</strong> • Tipe: {getFileTypeInfo(fileName).label}
                    </span>
                    {fileUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerFileDownload(fileUrl, fileName, {
                            assignmentTitle: assignment.title,
                            note: submissionNote,
                          })
                        }
                        className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Pratinjau / Tes Unduh</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Siswa (Opsional):</label>
                <input
                  type="text"
                  value={submissionNote}
                  onChange={e => setSubmissionNote(e.target.value)}
                  placeholder="Contoh: File revisi laporan final bab 1 sampai 3."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Simpan Pengumpulan Berkas</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
