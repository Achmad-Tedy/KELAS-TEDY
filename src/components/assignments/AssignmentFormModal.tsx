import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Assignment, AssignmentType, SubmissionMode, RubricType } from '../../types';
import { X, FileText, Check, AlertCircle, Users, User, HelpCircle } from 'lucide-react';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: Assignment | null;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  assignmentToEdit,
}) => {
  const {
    selectedClassId,
    selectedSubjectId,
    classes,
    subjects,
    getGroupsBySubject,
    createAssignment,
    updateAssignment,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeGroups = getGroupsBySubject(selectedClassId, selectedSubjectId, false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<AssignmentType>('group');
  const [targetGroupIds, setTargetGroupIds] = useState<string[]>([]);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('single_file_group');
  const [rubricType, setRubricType] = useState<RubricType>('presentation');
  const [maxScore, setMaxScore] = useState<number>(100);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (assignmentToEdit) {
        setTitle(assignmentToEdit.title);
        setDescription(assignmentToEdit.description);
        setDueDate(assignmentToEdit.dueDate);
        setType(assignmentToEdit.type);
        setTargetGroupIds(assignmentToEdit.targetGroupIds || []);
        setSubmissionMode(assignmentToEdit.submissionMode || 'single_file_group');
        setRubricType(assignmentToEdit.rubricType || 'presentation');
        setMaxScore(assignmentToEdit.maxScore || 100);
      } else {
        setTitle('');
        setDescription('');
        // Default due date: 7 days from now
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setDueDate(d.toISOString().split('T')[0]);
        setType('group');
        // By default, select all active groups
        setTargetGroupIds(activeGroups.map(g => g.id));
        setSubmissionMode('single_file_group');
        setRubricType('presentation');
        setMaxScore(100);
      }
      setErrorMsg('');
    }
  }, [isOpen, assignmentToEdit, activeGroups.length]);

  if (!isOpen) return null;

  const toggleGroupSelect = (groupId: string) => {
    setTargetGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSelectAllGroups = () => {
    setTargetGroupIds(activeGroups.map(g => g.id));
  };

  const handleClearGroups = () => {
    setTargetGroupIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul tugas wajib diisi.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Tenggat pengumpulan wajib ditentukan.');
      return;
    }
    if (type === 'group' && targetGroupIds.length === 0) {
      setErrorMsg('Pilih minimal satu kelompok yang wajib mengerjakan tugas ini.');
      return;
    }

    if (assignmentToEdit) {
      updateAssignment({
        ...assignmentToEdit,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        type,
        targetGroupIds: type === 'group' ? targetGroupIds : undefined,
        submissionMode: type === 'group' ? submissionMode : undefined,
        rubricType,
        maxScore,
      });
    } else {
      createAssignment({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        type,
        targetGroupIds: type === 'group' ? targetGroupIds : undefined,
        submissionMode: type === 'group' ? submissionMode : undefined,
        rubricType,
        maxScore,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>{assignmentToEdit ? 'Edit Tugas' : 'Buat Tugas Baru'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentClass?.name} · {currentSubject?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Presentasi Aljabar, Laporan Praktikum, dll."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi & Instruksi Pengerjaan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan tugas, format file yang diharapkan, dan rubrik penilaian..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Due date & max score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Batas Akhir (Tenggat) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nilai Maksimal
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={maxScore}
                onChange={e => setMaxScore(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Jenis Tugas: Individu vs Kelompok */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Jenis Tugas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setType('group')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  type === 'group'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">Tugas Kelompok</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Dikerjakan bersama oleh anggota kelompok yang ditentukan.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setType('individual')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  type === 'individual'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">Tugas Individu</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Setiap siswa mengerjakan dan dinilai secara mandiri.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Settings if Group Assignment */}
          {type === 'group' && (
            <div className="space-y-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              {/* Checkbox Kelompok yang mengerjakan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 uppercase tracking-wider block">
                    Kelompok Yang Mengerjakan:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllGroups}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleClearGroups}
                      className="text-slate-500 hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                {activeGroups.length === 0 ? (
                  <p className="text-rose-600 italic">
                    Belum ada kelompok aktif di mata pelajaran ini. Silakan buat kelompok terlebih dahulu di tab "Kelompok".
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                    {activeGroups.map(grp => {
                      const isChecked = targetGroupIds.includes(grp.id);
                      return (
                        <div
                          key={grp.id}
                          onClick={() => toggleGroupSelect(grp.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                            isChecked
                              ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isChecked
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{grp.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {grp.memberIds.length} Siswa
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mode Pengumpulan Tugas Kelompok */}
              <div className="pt-3 border-t border-slate-200/80">
                <label className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Metode Pengumpulan Berkas:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setSubmissionMode('single_file_group')}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      submissionMode === 'single_file_group'
                        ? 'border-blue-600 bg-white shadow-xs'
                        : 'border-slate-200 bg-white/60 text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>📁 Satu file untuk kelompok</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Salah satu anggota mengunggah file. Status pengumpulan otomatis berlaku untuk semua anggota kelompok.
                    </p>
                  </label>

                  <label
                    onClick={() => setSubmissionMode('individual_file')}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      submissionMode === 'individual_file'
                        ? 'border-blue-600 bg-white shadow-xs'
                        : 'border-slate-200 bg-white/60 text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>📄 File individu per anggota</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Setiap anggota kelompok wajib mengunggah file atau laporannya masing-masing.
                    </p>
                  </label>
                </div>
              </div>

              {/* Tipe Rubrik Penilaian */}
              <div className="pt-3 border-t border-slate-200/80">
                <label className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Format Penilaian / Rubrik:
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rubricType"
                      checked={rubricType === 'presentation'}
                      onChange={() => setRubricType('presentation')}
                      className="text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">
                      🎤 Presentasi Kelompok (Rubrik Isi + Kinerja Anggota)
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rubricType"
                      checked={rubricType === 'standard'}
                      onChange={() => setRubricType('standard')}
                      className="text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">
                      📝 Standar (Skor Nilai Biasa)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            Simpan Tugas
          </button>
        </div>
      </div>
    </div>
  );
};
