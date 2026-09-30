import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Assignment } from '../../types';
import { AssignmentFormModal } from './AssignmentFormModal';
import { AssignmentSubmissionModal } from './AssignmentSubmissionModal';
import {
  FileText,
  Plus,
  Calendar,
  Users,
  User,
  Paperclip,
  CheckCircle2,
  Trash2,
  Edit2,
  UploadCloud,
  Award,
} from 'lucide-react';

interface AssignmentListViewProps {
  onNavigateToGrading: (assignmentId: string) => void;
}

export const AssignmentListView: React.FC<AssignmentListViewProps> = ({ onNavigateToGrading }) => {
  const {
    selectedClassId,
    selectedSubjectId,
    classes,
    subjects,
    assignments,
    groups,
    submissions,
    deleteAssignment,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  const subjectAssignments = assignments.filter(
    a => a.classId === selectedClassId && a.subjectId === selectedSubjectId
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [submissionAssignment, setSubmissionAssignment] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<{ id: string; title: string } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'group' | 'individual'>('all');

  const filteredAssignments = subjectAssignments.filter(a => {
    if (filterType === 'group') return a.type === 'group';
    if (filterType === 'individual') return a.type === 'individual';
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    setAssignmentToDelete({ id, title });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Daftar Tugas {currentSubject?.name}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              {subjectAssignments.length} Tugas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola penugasan berbasis kelompok maupun individu beserta status pengumpulan berkas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter segment */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({subjectAssignments.length})
            </button>
            <button
              onClick={() => setFilterType('group')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'group' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelompok
            </button>
            <button
              onClick={() => setFilterType('individual')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'individual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Individu
            </button>
          </div>

          <button
            onClick={() => {
              setEditingAssignment(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* Assignment Cards */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Tugas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Buat tugas baru untuk kelompok atau tugas mandiri siswa pada mata pelajaran ini.
          </p>
          <button
            onClick={() => {
              setEditingAssignment(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tugas Pertama</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(asg => {
            const isGroup = asg.type === 'group';
            const asgSubmissions = submissions.filter(s => s.assignmentId === asg.id);
            const targetCount = isGroup ? (asg.targetGroupIds?.length || 0) : 'Semua Siswa';

            return (
              <div
                key={asg.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-xs transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isGroup
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isGroup ? '👥 Tugas Kelompok' : '👤 Tugas Individu'}
                      </span>

                      {isGroup && (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {asg.submissionMode === 'single_file_group'
                            ? '📁 1 File per Kelompok'
                            : '📄 File Individu per Anggota'}
                        </span>
                      )}

                      {asg.rubricType === 'presentation' && (
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          🎤 Rubrik Presentasi
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Tenggat: <strong className="text-slate-700">{formatDate(asg.dueDate)}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                    {asg.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {asg.description}
                      </p>
                    )}

                    {isGroup && asg.targetGroupIds && asg.targetGroupIds.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-500 text-[11px]">Kelompok Ditugaskan:</span>
                        {asg.targetGroupIds.map(gId => {
                          const grp = groups.find(g => g.id === gId);
                          return (
                            <span
                              key={gId}
                              className="px-2 py-0.5 bg-slate-50 text-slate-700 rounded border border-slate-200 text-[11px]"
                            >
                              {grp?.name || 'Kelompok'}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Submission and Action box */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSubmissionAssignment(asg)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                        <span>Pengumpulan ({asgSubmissions.length})</span>
                      </button>

                      <button
                        onClick={() => onNavigateToGrading(asg.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Nilai Tugas</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => {
                          setEditingAssignment(asg);
                          setIsFormOpen(true);
                        }}
                        className="p-1 hover:text-blue-600 rounded transition"
                        title="Edit Tugas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(asg.id, asg.title)}
                        className="p-1 hover:text-rose-600 rounded transition"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AssignmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        assignmentToEdit={editingAssignment}
      />

      <AssignmentSubmissionModal
        isOpen={Boolean(submissionAssignment)}
        onClose={() => setSubmissionAssignment(null)}
        assignment={submissionAssignment}
      />

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Konfirmasi Hapus Tugas</h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus tugas <strong>"{assignmentToDelete.title}"</strong>? Berkas pengumpulan dan nilai yang terkait juga akan dihapus.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignmentToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAssignment(assignmentToDelete.id);
                  setAssignmentToDelete(null);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
