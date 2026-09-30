import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Assignment, Group, Submission } from '../../types';
import {
  BookOpen,
  FileText,
  Users,
  BarChart3,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  FileCheck,
  ShieldAlert,
  Plus,
  UserCheck,
  Sparkles,
  ChevronRight,
  Calculator,
  FlaskConical,
  ShieldCheck,
  Award,
  MessageSquare,
  Lock,
  Download,
  Paperclip,
  Trash2,
  Check,
  File,
  RefreshCw,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import {
  triggerFileDownload,
  getFileTypeInfo,
  formatBytes,
  getFileExtension,
} from '../../utils/fileHelper';
import { isDriveConnected, uploadSubmissionToGoogleDrive } from '../../lib/googleDrive';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    classes,
    subjects,
    students,
    groups,
    assignments,
    submissions,
    grades,
    presentationAssessments,
    submitAssignmentWork,
    registerStudentGroup,
  } = useSchool();

  // Active student tab
  const [activeTab, setActiveTab] = useState<'assignments' | 'groups' | 'grades'>('assignments');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<'all' | 'pending' | 'submitted'>('all');

  // Submission Modal state
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState<Assignment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitFileName, setSubmitFileName] = useState('');
  const [submitFileSize, setSubmitFileSize] = useState('');
  const [submitFileType, setSubmitFileType] = useState('');
  const [submitFileUrl, setSubmitFileUrl] = useState<string>('');
  const [submitNote, setSubmitNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group Form state (Siswa mengisi / membuat kelompok tugas)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupSubjectId, setGroupSubjectId] = useState('sub-matematika');
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    currentUser?.id ? [currentUser.id] : []
  );
  const [groupLeaderId, setGroupLeaderId] = useState(currentUser?.id || '');
  const [groupNotes, setGroupNotes] = useState('');

  // Notification message
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3500);
  };

  // Student's strictly locked class
  const studentClassId = currentUser?.classId || 'c-3a';
  const currentClass = classes.find(c => c.id === studentClassId);
  const classmates = students.filter(s => s.classId === studentClassId);

  // Filter assignments strictly for this student's class
  const classAssignments = assignments.filter(a => a.classId === studentClassId);

  const filteredAssignments = classAssignments.filter(a => {
    const matchSubject = selectedSubjectFilter === 'all' || a.subjectId === selectedSubjectFilter;

    // Check if submitted by this student or by their group
    const isSubmitted = submissions.some(subm => {
      if (subm.assignmentId !== a.id) return false;
      if (subm.studentId === currentUser?.id) return true;
      if (subm.submittedForStudentIds && currentUser?.id && subm.submittedForStudentIds.includes(currentUser.id)) {
        return true;
      }
      return false;
    });

    if (assignmentStatusFilter === 'pending' && isSubmitted) return false;
    if (assignmentStatusFilter === 'submitted' && !isSubmitted) return false;

    return matchSubject;
  });

  // Find student's group in each subject
  const getStudentGroupInSubject = (subjectId: string): Group | undefined => {
    if (!currentUser?.id) return undefined;
    return groups.find(
      g =>
        g.classId === studentClassId &&
        g.subjectId === subjectId &&
        g.status === 'active' &&
        g.memberIds.includes(currentUser.id)
    );
  };

  // Find submission for assignment
  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(subm => {
      if (subm.assignmentId !== assignmentId) return false;
      if (subm.studentId === currentUser?.id) return true;
      if (subm.submittedForStudentIds && currentUser?.id && subm.submittedForStudentIds.includes(currentUser.id)) {
        return true;
      }
      return false;
    });
  };

  // Find grade for assignment
  const getGradeForAssignment = (assignmentId: string) => {
    if (!currentUser?.id) return undefined;
    return grades.find(g => g.assignmentId === assignmentId && g.studentId === currentUser.id);
  };

  // Find presentation assessment for assignment
  const getPresentationAssessment = (assignmentId: string, groupId?: string) => {
    if (!groupId) return undefined;
    return presentationAssessments.find(pa => pa.assignmentId === assignmentId && pa.groupId === groupId);
  };

  // Handle open submission modal
  const handleOpenSubmission = (asg: Assignment) => {
    setSelectedAssignmentForSubmission(asg);
    const existing = getSubmissionForAssignment(asg.id);
    if (existing) {
      setSubmitFileName(existing.fileName);
      setSubmitFileSize(existing.fileSize);
      setSubmitFileType(existing.fileType || '');
      setSubmitFileUrl(existing.fileUrl || '');
      setSubmitNote(existing.note || '');
      setSelectedFile(null);
    } else {
      setSelectedFile(null);
      setSubmitFileName('');
      setSubmitFileSize('');
      setSubmitFileType('');
      setSubmitFileUrl('');
      setSubmitNote('');
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setSubmitFileName(file.name);
    setSubmitFileSize(formatBytes(file.size));
    setSubmitFileType(file.type || getFileExtension(file.name));

    try {
      // Instant, zero-memory Blob URL that never bloats localStorage quota
      const objUrl = URL.createObjectURL(file);
      setSubmitFileUrl(objUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setSubmitFileUrl(reader.result as string);
      };
      reader.onerror = () => {
        setSubmitFileUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSelectQuickSample = (name: string, ext: string, size: string) => {
    setSubmitFileName(name);
    setSubmitFileSize(size);
    setSubmitFileType(ext);
    setSelectedFile(null);

    const sampleContent = `Dokumen Tugas: ${name}\nMata Pelajaran: ${selectedAssignmentForSubmission?.title || 'Tugas Siswa'}\nPenyusun: ${currentUser?.name || 'Siswa'}\nTanggal: ${new Date().toLocaleString('id-ID')}\n\nTugas ini telah diselesaikan secara lengkap sesuai arahan guru.`;
    setSubmitFileUrl(`data:text/plain;charset=utf-8,${encodeURIComponent(sampleContent)}`);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setSubmitFileName('');
    setSubmitFileSize('');
    setSubmitFileType('');
    setSubmitFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmission || !currentUser?.id) return;

    if (!submitFileName.trim()) {
      showNotif('error', 'Silakan pilih file tugas dari perangkat Anda terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    const asg = selectedAssignmentForSubmission;
    const studentGroup = getStudentGroupInSubject(asg.subjectId);
    let finalFileUrl = submitFileUrl || undefined;
    let savedToDrive = false;

    // If Admin's Google Drive is connected, upload directly to Google Drive folder!
    if (isDriveConnected()) {
      try {
        const driveResult = await uploadSubmissionToGoogleDrive({
          fileName: submitFileName.trim(),
          fileBlob: selectedFile || undefined,
          fileDataUrl: submitFileUrl || undefined,
          mimeType: submitFileType || undefined,
          assignmentTitle: asg.title,
          studentName: currentUser.name,
          className: studentClass?.name || 'Kelas Siswa',
          note: submitNote.trim() || undefined,
        });

        if (driveResult?.webViewLink) {
          finalFileUrl = driveResult.webViewLink;
          savedToDrive = true;
        }
      } catch (driveErr: any) {
        console.warn('[Student Google Drive Upload Warning]', driveErr);
      }
    }

    submitAssignmentWork({
      assignmentId: asg.id,
      classId: studentClassId,
      subjectId: asg.subjectId,
      groupId: studentGroup?.id,
      studentId: currentUser.id,
      fileName: submitFileName.trim(),
      fileSize: submitFileSize || '1.4 MB',
      fileUrl: finalFileUrl,
      fileType: submitFileType || undefined,
      note: submitNote.trim() || undefined,
    });

    setIsSubmitting(false);
    setSelectedAssignmentForSubmission(null);
    showNotif(
      'success',
      savedToDrive
        ? `Berkas "${submitFileName}" berhasil dikumpulkan dan tersimpan langsung di Google Drive Admin!`
        : `File "${submitFileName}" berhasil dikumpulkan untuk tugas "${asg.title}"!`
    );
  };

  // Group creation by student
  const handleOpenCreateGroup = (preferredSubjectId?: string) => {
    setGroupSubjectId(preferredSubjectId || 'sub-matematika');
    setGroupName('');
    setSelectedMemberIds(currentUser?.id ? [currentUser.id] : []);
    setGroupLeaderId(currentUser?.id || '');
    setGroupNotes('');
    setIsGroupModalOpen(true);
  };

  const handleToggleMember = (studentId: string) => {
    if (selectedMemberIds.includes(studentId)) {
      if (studentId === currentUser?.id) {
        // Can't uncheck yourself
        return;
      }
      setSelectedMemberIds(prev => prev.filter(id => id !== studentId));
      if (groupLeaderId === studentId) {
        setGroupLeaderId(currentUser?.id || selectedMemberIds[0] || '');
      }
    } else {
      setSelectedMemberIds(prev => [...prev, studentId]);
    }
  };

  const handleSaveStudentGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      showNotif('error', 'Nama kelompok tidak boleh kosong.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      showNotif('error', 'Pilih minimal satu anggota kelompok.');
      return;
    }

    const created = registerStudentGroup({
      classId: studentClassId,
      subjectId: groupSubjectId,
      name: groupName.trim(),
      leaderId: groupLeaderId || selectedMemberIds[0],
      memberIds: selectedMemberIds,
      notes: groupNotes.trim() || 'Kelompok dibentuk oleh siswa.',
    });

    setIsGroupModalOpen(false);
    showNotif('success', `Kelompok "${created.name}" berhasil dibentuk dan didaftarkan ke guru!`);
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-4 h-4 text-blue-600" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4 text-emerald-600" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Student Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Portal Peserta Didik</span>
              </span>

              {/* Strict Class Isolation Badge */}
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Terkunci: {currentClass ? currentClass.name : 'Kelas Anda'} (Hanya Akses Kelas Sendiri)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Halo, {currentUser?.name || 'Siswa'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Lihat tugas mata pelajaran, daftarkan nama kelompok tugas, kumpulkan berkas, dan pantau nilai dari gurumu.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/20">
            <div className="text-right">
              <div className="text-[11px] text-blue-200">NISN / Nomor Induk:</div>
              <div className="font-mono font-bold text-sm">{currentUser?.username || '-'}</div>
            </div>
          </div>
        </div>

        {/* Quick Student Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-black/15 p-3 rounded-xl">
            <div className="text-[11px] text-blue-200">Tugas di Kelas</div>
            <div className="text-2xl font-black">{classAssignments.length}</div>
          </div>
          <div className="bg-black/15 p-3 rounded-xl">
            <div className="text-[11px] text-blue-200">Sudah Dikumpulkan</div>
            <div className="text-2xl font-black text-emerald-300">
              {
                classAssignments.filter(a => {
                  return submissions.some(subm => {
                    if (subm.assignmentId !== a.id) return false;
                    return subm.studentId === currentUser?.id || (subm.submittedForStudentIds && subm.submittedForStudentIds.includes(currentUser?.id || ''));
                  });
                }).length
              }
            </div>
          </div>
          <div className="bg-black/15 p-3 rounded-xl">
            <div className="text-[11px] text-blue-200">Kelompok Saya</div>
            <div className="text-2xl font-black text-amber-300">
              {groups.filter(g => g.classId === studentClassId && g.status === 'active' && g.memberIds.includes(currentUser?.id || '')).length}
            </div>
          </div>
          <div className="bg-black/15 p-3 rounded-xl">
            <div className="text-[11px] text-blue-200">Nilai Masuk</div>
            <div className="text-2xl font-black text-purple-300">
              {grades.filter(g => g.studentId === currentUser?.id).length}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notif && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
            notif.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notif.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{notif.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tugas & Pengumpulan ({classAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'groups'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Atur & Isi Kelompok Tugas</span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'grades'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Nilai & Umpan Balik Guru</span>
        </button>
      </div>

      {/* Subject Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-700 mr-1">Filter Mata Pelajaran:</span>
        <button
          onClick={() => setSelectedSubjectFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            selectedSubjectFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua Mapel
        </button>
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSubjectFilter(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedSubjectFilter === s.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {getSubjectIcon(s.iconName)}
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: TUGAS & PENGUMPULAN */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {/* Status sub-filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAssignmentStatusFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  assignmentStatusFilter === 'all'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                Semua ({classAssignments.length})
              </button>
              <button
                onClick={() => setAssignmentStatusFilter('pending')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  assignmentStatusFilter === 'pending'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                Belum Dikumpulkan
              </button>
              <button
                onClick={() => setAssignmentStatusFilter('submitted')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  assignmentStatusFilter === 'submitted'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                Sudah Dikumpulkan
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Menampilkan {filteredAssignments.length} tugas
            </span>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Tugas</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada tugas yang sesuai dengan filter atau belum ada tugas baru dari guru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignments.map(asg => {
                const subject = subjects.find(s => s.id === asg.subjectId);
                const submission = getSubmissionForAssignment(asg.id);
                const grade = getGradeForAssignment(asg.id);
                const studentGroup = getStudentGroupInSubject(asg.subjectId);
                const isSubmitted = !!submission;

                return (
                  <div
                    key={asg.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                      isSubmitted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1.5 border border-slate-200">
                          {subject && getSubjectIcon(subject.iconName)}
                          <span>{subject?.name || 'Mata Pelajaran'}</span>
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                            isSubmitted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isSubmitted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sudah Dikumpulkan</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Belum Dikumpulkan</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-slate-900 text-sm">{asg.title}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                        {asg.description}
                      </p>

                      {/* Details Box */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Jenis Tugas:</span>
                          <span className="font-semibold text-slate-800">
                            {asg.type === 'group' ? '👥 Tugas Kelompok' : '👤 Tugas Individu'}
                          </span>
                        </div>

                        {asg.type === 'group' && (
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Mode Pengumpulan:</span>
                            <span className="font-semibold text-slate-800">
                              {asg.submissionMode === 'single_file_group'
                                ? 'Satu file untuk seluruh kelompok'
                                : 'File individu masing-masing'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-slate-500">
                          <span>Batas Pengumpulan:</span>
                          <span className="font-semibold text-rose-700">
                            {new Date(asg.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* If group assignment, show student's group */}
                        {asg.type === 'group' && (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-slate-500">Kelompok Anda di Mapel Ini:</span>
                            {studentGroup ? (
                              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {studentGroup.name}
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium">
                                Belum tergabung kelompok (Bisa buat di tab Kelompok)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Submission Info if already submitted */}
                      {submission && (
                        <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                                <FileCheck className="w-4 h-4" />
                              </span>
                              <div className="truncate">
                                <div className="font-bold text-emerald-950 truncate flex items-center gap-1.5">
                                  <span className="truncate">{submission.fileName}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200/70 text-emerald-800 rounded font-normal">
                                    {submission.fileSize}
                                  </span>
                                </div>
                                <div className="text-[11px] text-emerald-700">
                                  Dikirim: {new Date(submission.submittedAt).toLocaleString('id-ID')}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                triggerFileDownload(submission.fileUrl, submission.fileName, {
                                  assignmentTitle: asg.title,
                                  studentName: currentUser?.name,
                                  submittedAt: submission.submittedAt,
                                  note: submission.note,
                                })
                              }
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer self-start sm:self-auto"
                              title="Buka atau unduh berkas yang telah dikirimkan"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh / Buka File</span>
                            </button>
                          </div>

                          {submission.note && (
                            <div className="text-[11px] text-emerald-800 italic bg-white/80 p-2 rounded-lg border border-emerald-100">
                              💬 Catatan: "{submission.note}"
                            </div>
                          )}

                          {asg.type === 'group' && asg.submissionMode === 'single_file_group' && (
                            <div className="text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded font-medium">
                              ✓ 1 file ini mewakili seluruh anggota kelompok Anda ({studentGroup?.name || 'Kelompok'}).
                            </div>
                          )}
                        </div>
                      )}

                      {/* Grade Info if already graded */}
                      {grade && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-900 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-purple-600" />
                              <span>Nilai dari Guru:</span>
                            </span>
                            <span className="text-base font-black text-purple-800">
                              {grade.score} / 100
                            </span>
                          </div>
                          {grade.feedback && (
                            <p className="text-[11px] text-purple-700 italic">
                              "{grade.feedback}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenSubmission(asg)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isSubmitted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isSubmitted ? 'Perbarui / Unggah Ulang Berkas' : 'Kumpulkan Tugas Ini'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ATUR & ISI KELOMPOK TUGAS */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Pengisian & Pendaftaran Kelompok Tugas</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Sesuai instruksi guru, siswa dapat membentuk kelompok, menentukan nama kelompok, memilih teman sekelas, dan menentukan ketua untuk tugas mata pelajaran.
              </p>
            </div>

            <button
              onClick={() => handleOpenCreateGroup()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Isi / Daftarkan Kelompok Baru</span>
            </button>
          </div>

          {/* Groups list per subject in student's class */}
          <div className="space-y-6">
            {subjects.map(sub => {
              const subjectGroups = groups.filter(
                g => g.classId === studentClassId && g.subjectId === sub.id && g.status === 'active'
              );

              return (
                <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        {getSubjectIcon(sub.iconName)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{sub.name}</h3>
                        <p className="text-[11px] text-slate-400">Guru Pengampu: {sub.teacherName}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenCreateGroup(sub.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Kelompok {sub.name}</span>
                    </button>
                  </div>

                  {subjectGroups.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      Belum ada kelompok yang terdaftar untuk {sub.name}. Klik tombol di atas untuk mendaftarkan kelompok baru.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subjectGroups.map(grp => {
                        const isMyGroup = currentUser?.id && grp.memberIds.includes(currentUser.id);
                        const leader = students.find(s => s.id === grp.leaderId);

                        return (
                          <div
                            key={grp.id}
                            className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                              isMyGroup
                                ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  <span>👥 {grp.name}</span>
                                </span>
                                {isMyGroup && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                                    Kelompok Anda
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-600 mb-2">
                                <strong>Ketua:</strong> {leader ? leader.name : 'Belum Ditentukan'}
                              </div>

                              {grp.notes && (
                                <p className="text-[11px] text-slate-500 italic mb-3 line-clamp-2">
                                  "{grp.notes}"
                                </p>
                              )}

                              <div className="space-y-1 pt-2 border-t border-slate-100">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Anggota ({grp.memberIds.length} Siswa):
                                </div>
                                <div className="space-y-1">
                                  {grp.memberIds.map(mId => {
                                    const member = students.find(s => s.id === mId);
                                    const isMe = mId === currentUser?.id;
                                    return (
                                      <div
                                        key={mId}
                                        className={`text-xs flex items-center justify-between px-2 py-1 rounded ${
                                          isMe ? 'bg-blue-100/70 font-bold text-blue-900' : 'text-slate-700'
                                        }`}
                                      >
                                        <span>👤 {member ? member.name : mId}</span>
                                        {isMe && <span className="text-[10px] text-blue-600">(Saya)</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                              Dibuat: {new Date(grp.createdAt).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: NILAI & UMPAN BALIK GURU */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>Buku Nilai & Umpan Balik Guru</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Daftar seluruh nilai yang telah diberikan oleh bapak/ibu guru untuk tugas kelompok maupun tugas individu Anda.
            </p>
          </div>

          <div className="space-y-4">
            {classAssignments.map(asg => {
              const grade = getGradeForAssignment(asg.id);
              const subject = subjects.find(s => s.id === asg.subjectId);
              const studentGroup = getStudentGroupInSubject(asg.subjectId);
              const presentation = getPresentationAssessment(asg.id, studentGroup?.id);

              return (
                <div
                  key={asg.id}
                  className={`p-4 rounded-xl border transition ${
                    grade ? 'border-purple-200 bg-purple-50/20' : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {subject?.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {asg.type === 'group' ? 'Tugas Kelompok' : 'Tugas Individu'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{asg.title}</h4>
                    </div>

                    <div className="text-right">
                      {grade ? (
                        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-300">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-lg font-black">{grade.score}</span>
                          <span className="text-xs font-semibold text-purple-700">/ 100</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                          Belum Dinilai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback row */}
                  {grade && (
                    <div className="mt-3 pt-3 border-t border-purple-100 text-xs text-slate-700 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-purple-900 font-semibold">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <span>Catatan Guru:</span>
                      </div>
                      <p className="bg-white p-2.5 rounded-lg border border-purple-100 italic text-slate-700">
                        "{grade.feedback || 'Nilai telah diinput oleh guru.'}"
                      </p>
                    </div>
                  )}

                  {/* Presentation Rubric breakdown if available */}
                  {presentation && currentUser?.id && presentation.memberCriteria[currentUser.id] && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-2">
                      <span className="font-bold text-purple-900 block">
                        Rincian Rubrik Penilaian Presentasi:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-500 block">Penguasaan Materi</span>
                          <span className="font-bold text-slate-800">
                            {presentation.memberCriteria[currentUser.id].mastery}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-500 block">Penyampaian</span>
                          <span className="font-bold text-slate-800">
                            {presentation.memberCriteria[currentUser.id].delivery}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-500 block">Percaya Diri</span>
                          <span className="font-bold text-slate-800">
                            {presentation.memberCriteria[currentUser.id].confidence}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-500 block">Tanya Jawab</span>
                          <span className="font-bold text-slate-800">
                            {presentation.memberCriteria[currentUser.id].qnaHandling}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submitted File Info & Download for Graded Assignment */}
                  {(() => {
                    const subm = getSubmissionForAssignment(asg.id);
                    if (!subm) return null;
                    return (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">
                            Berkas yang Dinilai: <strong className="text-slate-900">{subm.fileName}</strong> ({subm.fileSize})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            triggerFileDownload(subm.fileUrl, subm.fileName, {
                              assignmentTitle: asg.title,
                              studentName: currentUser?.name,
                              submittedAt: subm.submittedAt,
                              note: subm.note,
                            })
                          }
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-blue-600" />
                          <span>Unduh Berkas Siswa</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: PENGUMPULAN TUGAS BERKAS */}
      {selectedAssignmentForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {selectedAssignmentForSubmission.type === 'group' ? 'Tugas Kelompok' : 'Tugas Individu'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Batas: {new Date(selectedAssignmentForSubmission.dueDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{selectedAssignmentForSubmission.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmission(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold p-1 rounded-lg hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Context Banner */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {selectedAssignmentForSubmission.type === 'group'
                      ? 'Pengumpulan Berkas Kelompok'
                      : 'Pengumpulan Berkas Mandiri Siswa'}
                  </span>
                </div>
                <p className="text-blue-700 text-[11px] leading-relaxed">
                  {selectedAssignmentForSubmission.submissionMode === 'single_file_group'
                    ? 'Pilih berkas dari perangkat Anda. Pengumpulan file ini akan otomatis mencatatkan status pengumpulan untuk seluruh anggota kelompok Anda.'
                    : 'Pilih berkas dari data/penyimpanan perangkat Anda lalu kirimkan langsung kepada guru mata pelajaran.'}
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar,.txt"
                className="hidden"
              />

              {/* Real File Picker Area */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Pilih Berkas File Tugas dari Perangkat:
                </label>

                {!submitFileName ? (
                  /* Empty state - Dropzone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                        : 'border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <Upload className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">
                        Klik untuk Memilih File dari Data / HP / Komputer
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        atau seret & lepas berkas langsung ke area ini
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">PDF</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">Word (DOCX)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">PowerPoint (PPTX)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">Excel (XLSX)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">Gambar</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">ZIP</span>
                    </div>

                    <button
                      type="button"
                      className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      Buka File Manager / Galeri
                    </button>
                  </div>
                ) : (
                  /* File Selected Card */
                  <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
                            <span className="truncate">{submitFileName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {submitFileSize || '1.4 MB'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {getFileTypeInfo(submitFileName).label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveSelectedFile}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus / Ganti File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80 text-[11px]">
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>File terpilih dan siap dikirimkan ke guru</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {submitFileUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              triggerFileDownload(submitFileUrl, submitFileName, {
                                assignmentTitle: selectedAssignmentForSubmission.title,
                                studentName: currentUser?.name,
                                note: submitNote,
                              })
                            }
                            className="text-blue-700 hover:underline font-bold flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Tes Buka</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-emerald-800 hover:underline font-bold"
                        >
                          Ganti Berkas
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Simulated File Presets (for instant testing convenience) */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 block mb-1">
                    Atau gunakan berkas sampel cepat jika sedang menguji aplikasi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectQuickSample(
                          `Laporan-${selectedAssignmentForSubmission.title.replace(/\s+/g, '-').slice(0, 15)}-${currentUser?.name.toLowerCase().split(' ')[0] || 'siswa'}.pdf`,
                          'pdf',
                          '2.4 MB'
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition"
                    >
                      <Paperclip className="w-3 h-3 text-rose-600" />
                      <span>📄 Dokumen Laporan (.pdf)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectQuickSample(
                          `Slide-Presentasi-${selectedAssignmentForSubmission.title.replace(/\s+/g, '-').slice(0, 15)}.pptx`,
                          'pptx',
                          '4.8 MB'
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition"
                    >
                      <Paperclip className="w-3 h-3 text-amber-600" />
                      <span>📊 Slide Presentasi (.pptx)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Note for teacher */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan untuk Guru (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={submitNote}
                  onChange={e => setSubmitNote(e.target.value)}
                  placeholder="Contoh: Kami telah menyelesaikan studi kasus 1 sampai 3 secara lengkap."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmission(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !submitFileName.trim()}
                  className={`px-5 py-2.5 font-bold rounded-xl shadow-xs transition flex items-center gap-2 ${
                    isSubmitting || !submitFileName.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/20'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mengirim Berkas...' : 'Kirim Berkas Tugas Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR / BENTUK KELOMPOK BARU OLEH SISWA */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Form Pendaftaran Kelompok Tugas</h3>
                <p className="text-[11px] text-slate-500">
                  Bentuk kelompok untuk mata pelajaran di {currentClass?.name}
                </p>
              </div>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentGroup} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mata Pelajaran *
                </label>
                <select
                  value={groupSubjectId}
                  onChange={e => setGroupSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Kelompok *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Contoh: Kelompok 1 (Aljabar) atau Kelompok Pythagoras"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* Members Selection (Checkboxes from Classmates) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Pilih Anggota Kelompok (Teman Sekelas di {currentClass?.name}):
                  </label>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedMemberIds.length} Siswa Terpilih
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/50">
                  {classmates.map(st => {
                    const isChecked = selectedMemberIds.includes(st.id);
                    const isMe = st.id === currentUser?.id;

                    return (
                      <label
                        key={st.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-blue-50/80 border border-blue-200 text-blue-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleMember(st.id)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>{st.name}</span>
                          {isMe && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                              Saya
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{st.nisn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Leader Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Ketua Kelompok:
                </label>
                <select
                  value={groupLeaderId}
                  onChange={e => setGroupLeaderId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {selectedMemberIds.map(mId => {
                    const st = students.find(s => s.id === mId);
                    return (
                      <option key={mId} value={mId}>
                        {st ? st.name : mId} {mId === currentUser?.id ? '(Saya)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan / Topik Tugas Kelompok:
                </label>
                <input
                  type="text"
                  value={groupNotes}
                  onChange={e => setGroupNotes(e.target.value)}
                  placeholder="Contoh: Pembagian materi bab pecahan dan presentasi kelompok."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan & Daftarkan Kelompok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
