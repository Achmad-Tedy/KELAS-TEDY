import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  X,
  UserPlus,
  Users,
  Trash2,
  Edit2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Search,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    classes,
    selectedClassId,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents,
    clearStudentsInClass,
    getStudentsByClass,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = getStudentsByClass(selectedClassId);

  // Tab: 'list' | 'add_single' | 'bulk_import'
  const [activeTab, setActiveTab] = useState<'list' | 'add_single' | 'bulk_import'>('list');

  // Single Add / Edit states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [studentGender, setStudentGender] = useState<'L' | 'P'>('L');

  // Bulk Import state
  const [bulkText, setBulkText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen) return null;

  const handleOpenAddSingle = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentNisn(`008${Math.floor(1000000 + Math.random() * 9000000)}`);
    setStudentGender('L');
    setActiveTab('add_single');
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentNisn(student.nisn);
    setStudentGender(student.gender);
    setActiveTab('add_single');
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        name: studentName.trim(),
        nisn: studentNisn.trim() || editingStudent.nisn,
        gender: studentGender,
      });
      setFeedbackMsg(`Data siswa "${studentName.trim()}" berhasil diperbarui.`);
    } else {
      addStudent({
        name: studentName.trim(),
        nisn: studentNisn.trim() || `008${Math.floor(1000000 + Math.random() * 9000000)}`,
        gender: studentGender,
        classId: selectedClassId,
      });
      setFeedbackMsg(`Siswa baru "${studentName.trim()}" berhasil ditambahkan ke ${currentClass?.name}.`);
    }

    setActiveTab('list');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleSaveBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    // Parse lines: each line is either "Nama" or "Nama, NISN, L/P"
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const newStudents: Omit<Student, 'id'>[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const name = parts[0];
      const nisn = parts[1] || `008${Math.floor(1000000 + Math.random() * 9000000) + idx}`;
      const genderRaw = parts[2]?.toUpperCase();
      const gender: 'L' | 'P' = genderRaw === 'P' || genderRaw === 'PEREMPUAN' ? 'P' : 'L';

      if (name) {
        newStudents.push({
          name,
          nisn,
          gender,
          classId: selectedClassId,
        });
      }
    });

    if (newStudents.length > 0) {
      bulkAddStudents(newStudents, selectedClassId);
      setFeedbackMsg(`${newStudents.length} siswa berhasil ditambahkan ke ${currentClass?.name}!`);
      setBulkText('');
      setActiveTab('list');
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setFeedbackMsg(`Siswa "${studentToDelete.name}" telah dihapus.`);
    setStudentToDelete(null);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleClearRoster = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearRoster = () => {
    clearStudentsInClass(selectedClassId);
    setFeedbackMsg(`Seluruh data siswa ${currentClass?.name} telah dikosongkan. Silakan buat daftar siswa baru.`);
    setIsClearConfirmOpen(false);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const filteredStudents = classStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kelola Data Siswa: {currentClass?.name}
              </h2>
              <p className="text-xs text-slate-500">
                {classStudents.length} Siswa Terdaftar · Wali Kelas: {currentClass?.homeroomTeacher}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Daftar Siswa ({classStudents.length})
            </button>
            <button
              onClick={handleOpenAddSingle}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'add_single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Siswa</span>
            </button>
            <button
              onClick={() => setActiveTab('bulk_import')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'bulk_import'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Salin/Tempel Banyak Siswa</span>
            </button>
          </div>

          {classStudents.length > 0 && (
            <button
              onClick={handleClearRoster}
              className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded transition"
              title="Kosongkan data siswa contoh untuk input sendiri"
            >
              Kosongkan Data Contoh
            </button>
          )}
        </div>

        {feedbackMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* 1. LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau NISN..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddSingle}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Siswa Baru</span>
                  </button>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-800">Belum Ada Siswa di Kelas Ini</h4>
                  <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                    Anda dapat menambahkan nama siswa satu per satu atau menyalin daftar nama sekaligus melalui menu "Salin/Tempel Banyak Siswa".
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleOpenAddSingle}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                    >
                      + Tambah Siswa Pertama
                    </button>
                    <button
                      onClick={() => setActiveTab('bulk_import')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold"
                    >
                      Salin Banyak Siswa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">No</th>
                        <th className="px-4 py-2.5">Nama Lengkap Siswa</th>
                        <th className="px-4 py-2.5">NISN</th>
                        <th className="px-4 py-2.5 text-center">L/P</th>
                        <th className="px-4 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-2 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="px-4 py-2 font-bold text-slate-900">{student.name}</td>
                          <td className="px-4 py-2 font-mono text-slate-500">{student.nisn}</td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                student.gender === 'P'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {student.gender === 'P' ? 'Perempuan' : 'Laki-laki'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(student)}
                                className="p-1 text-slate-500 hover:text-blue-600 rounded transition"
                                title="Edit Siswa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(student)}
                                className="p-1 text-slate-500 hover:text-rose-600 rounded transition"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. ADD SINGLE STUDENT */}
          {activeTab === 'add_single' && (
            <form onSubmit={handleSaveSingle} className="max-w-md mx-auto space-y-4 py-2">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru ke ' + currentClass?.name}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Lengkapi data siswa yang akan dimasukkan ke dalam daftar kelas.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NISN / NIS
                  </label>
                  <input
                    type="text"
                    value={studentNisn}
                    onChange={e => setStudentNisn(e.target.value)}
                    placeholder="Contoh: 0081234001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={studentGender}
                    onChange={e => setStudentGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          )}

          {/* 3. BULK IMPORT (PASTE MULTIPLE STUDENTS) */}
          {activeTab === 'bulk_import' && (
            <form onSubmit={handleSaveBulk} className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Salin & Tempel Daftar Nama Siswa Sekaligus
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                  Tempel daftar nama siswa dari WhatsApp, Word, atau Excel. Satu nama per baris. Format opsional: <code>Nama, NISN, L/P</code>.
                </p>
              </div>

              <div>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={`Contoh tempel nama:\nAhmad Fauzi\nBudi Santoso\nCitra Dewi\nDeni Saputra\nEko Prasetyo\nFajar Ramadhan\nGita Permata`}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Sistem akan otomatis membersihkan baris kosong dan menghasilkan ID unik untuk setiap siswa yang Anda masukkan ke dalam kelas ini.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Tambahkan Semua Siswa</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            Data siswa tersimpan aman di database lokal browser Anda.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {studentToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Hapus Siswa?</h4>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data siswa <strong className="text-slate-900">{studentToDelete.name}</strong> (NISN: {studentToDelete.nisn}) dari kelas ini?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal Overlay */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm text-rose-600">Kosongkan Semua Siswa?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan menghapus seluruh daftar siswa di <strong>{currentClass?.name}</strong>. Anda dapat mengimpor atau menambahkan siswa baru setelahnya.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmClearRoster}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
