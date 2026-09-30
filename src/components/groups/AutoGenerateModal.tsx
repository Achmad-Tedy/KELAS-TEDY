import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Sparkles, X, Users, AlertCircle } from 'lucide-react';

interface AutoGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoGenerateModal: React.FC<AutoGenerateModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedClassId,
    selectedSubjectId,
    classes,
    subjects,
    getStudentsByClass,
    autoGenerateGroups,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const classStudents = getStudentsByClass(selectedClassId);

  const [groupCount, setGroupCount] = useState<number>(4);
  const [prefixName, setPrefixName] = useState<string>('Kelompok');

  if (!isOpen) return null;

  const handleGenerate = () => {
    autoGenerateGroups(selectedClassId, selectedSubjectId, groupCount, prefixName);
    onClose();
  };

  const avgPerGroup = Math.ceil(classStudents.length / Math.max(1, groupCount));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Bagi Kelompok Otomatis</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Sistem akan mengacak siswa kelas <strong>{currentClass?.name}</strong> ({classStudents.length} siswa) secara merata ke dalam kelompok untuk mata pelajaran <strong>{currentSubject?.name}</strong>.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jumlah Kelompok Yang Ingin Dibuat
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={Math.max(2, classStudents.length)}
                  value={groupCount}
                  onChange={e => setGroupCount(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-500">
                  Estimasi ~{avgPerGroup} siswa per kelompok
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Awalan Nama Kelompok
              </label>
              <input
                type="text"
                value={prefixName}
                onChange={e => setPrefixName(e.target.value)}
                placeholder="Contoh: Kelompok, Tim, Regu"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>
              Kelompok sebelumnya pada mata pelajaran ini akan digantikan dengan susunan baru. Anda tetap dapat mengedit anggota dan mengganti ketua setelahnya.
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buat Pembagian Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
