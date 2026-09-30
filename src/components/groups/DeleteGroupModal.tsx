import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Group } from '../../types';
import { AlertTriangle, Trash2, Archive, X } from 'lucide-react';

interface DeleteGroupModalProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  group,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const { deleteGroup, toggleGroupStatus, submissions, presentationAssessments, grades } = useSchool();

  if (!isOpen || !group) return null;

  // Check usage
  const hasSubmissions = submissions.some(s => s.groupId === group.id);
  const hasAssessments = presentationAssessments.some(pa => pa.groupId === group.id);
  const hasGrades = grades.some(gr => gr.groupId === group.id);
  const isUsedInHistory = hasSubmissions || hasAssessments || hasGrades;

  const handleDelete = () => {
    const res = deleteGroup(group.id);
    if (res.success) {
      onDeleted();
      onClose();
    } else {
      alert(res.message || 'Tidak dapat menghapus kelompok.');
    }
  };

  const handleArchiveInstead = () => {
    toggleGroupStatus(group.id);
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Hapus {group.name}?
          </h3>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Apakah Anda yakin ingin menghapus kelompok ini? Anggota kelompok (
            <span className="font-semibold text-slate-800">{group.memberIds.length} siswa</span>) akan dilepaskan dari kelompok ini.
          </p>

          {isUsedInHistory && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Perhatian: Riwayat Tugas & Nilai Terdeteksi
              </span>
              <p className="text-[11px] text-amber-700">
                Kelompok ini telah memiliki data pengumpulan tugas atau penilaian. Menghapus permanen dapat merusak laporan riwayat. Sangat disarankan untuk memilih <strong>Arsipkan Kelompok</strong> sebagai gantinya.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Batal
          </button>

          {isUsedInHistory ? (
            <button
              type="button"
              onClick={handleArchiveInstead}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Arsipkan Saja (Aman)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Permanen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
