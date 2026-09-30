import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Group, Student } from '../../types';
import {
  X,
  Users,
  Crown,
  Calendar,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Archive,
  Edit2,
  Trash2,
} from 'lucide-react';

interface GroupDetailModalProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const {
    students,
    assignments,
    submissions,
    grades,
    presentationAssessments,
    classes,
    subjects,
    toggleGroupStatus,
  } = useSchool();

  if (!isOpen || !group) return null;

  const currentClass = classes.find(c => c.id === group.classId);
  const currentSubject = subjects.find(s => s.id === group.subjectId);
  const leader = students.find(s => s.id === group.leaderId);

  // Group members
  const memberStudents = group.memberIds
    .map(id => students.find(s => s.id === id))
    .filter((s): s is Student => Boolean(s));

  // Linked assignments targeting this group
  const groupAssignments = assignments.filter(
    a => a.type === 'group' && a.targetGroupIds?.includes(group.id)
  );

  // Submissions made by or for this group
  const groupSubmissions = submissions.filter(s => s.groupId === group.id);

  // Presentation assessment for this group if any
  const groupAssessments = presentationAssessments.filter(pa => pa.groupId === group.id);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-blue-50">
              {currentClass?.name} · {currentSubject?.name}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                group.status === 'active'
                  ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/30'
                  : 'bg-amber-500/30 text-amber-100 border border-amber-400/30'
              }`}
            >
              {group.status === 'active' ? 'Status: Aktif' : 'Status: Arsip'}
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">{group.name}</h2>
          <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
            <span>Dibuat: {formatDate(group.createdAt)}</span>
            <span>·</span>
            <span>Tahun Ajaran: {group.academicYear}</span>
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Notes Card */}
          {group.notes && (
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                Catatan Kelompok
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{group.notes}</p>
            </div>
          )}

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Daftar Anggota ({memberStudents.length} Siswa)</span>
              </h3>
              <span className="text-xs text-slate-500">
                Ketua: <strong className="text-slate-800">{leader?.name || '-'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {memberStudents.map((student, idx) => {
                const isLeader = student.id === group.leaderId;
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      isLeader
                        ? 'bg-amber-50/70 border-amber-200 text-slate-900'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isLeader
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <span>{student.name}</span>
                          {isLeader && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                              <Crown className="w-2.5 h-2.5" />
                              Ketua
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">NISN: {student.nisn}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked Assignments & Submissions */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Tugas & Pengumpulan Kelompok</span>
            </h3>

            {groupAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada tugas kelompok khusus yang ditugaskan ke kelompok ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {groupAssignments.map(asg => {
                  const submission = groupSubmissions.find(s => s.assignmentId === asg.id);
                  const assessment = groupAssessments.find(pa => pa.assignmentId === asg.id);

                  return (
                    <div
                      key={asg.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{asg.title}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Tenggat: {formatDate(asg.dueDate)} · Mode:{' '}
                            {asg.submissionMode === 'single_file_group'
                              ? '1 File per Kelompok'
                              : 'File Individu'}
                          </div>
                        </div>
                        {submission ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Terkumpul
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Belum Mengumpulkan
                          </span>
                        )}
                      </div>

                      {submission && (
                        <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-medium text-slate-800">{submission.fileName}</span>
                            <span className="text-slate-400">({submission.fileSize})</span>
                          </div>
                          <span className="text-slate-500">
                            Oleh:{' '}
                            {students.find(s => s.id === submission.studentId)?.name || 'Anggota'}
                          </span>
                        </div>
                      )}

                      {assessment && (
                        <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                          <span className="font-bold">Penilaian Presentasi Tersedia:</span> Nilai Isi (
                          {assessment.groupCriteria.materialContent}), Media (
                          {assessment.groupCriteria.presentationMedia}), Kerja Sama (
                          {assessment.groupCriteria.teamCollaboration})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleGroupStatus(group.id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{group.status === 'active' ? 'Arsipkan Kelompok' : 'Aktifkan Kembali'}</span>
            </button>
            <button
              onClick={() => onDelete(group)}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(group)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Kelompok</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
