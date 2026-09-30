import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Group, Student } from '../../types';
import { X, Check, Search, AlertCircle, Crown, Info, Users, UserCheck } from 'lucide-react';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: Group | null;
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  groupToEdit,
}) => {
  const {
    selectedClassId,
    selectedSubjectId,
    classes,
    subjects,
    groups,
    getStudentsByClass,
    createGroup,
    updateGroup,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const classStudents = getStudentsByClass(selectedClassId);

  // Existing active groups for this class & subject (excluding the one being edited)
  const existingActiveGroups = groups.filter(
    g => g.classId === selectedClassId && g.subjectId === selectedSubjectId && g.status === 'active' && g.id !== groupToEdit?.id
  );

  // Map of studentId -> existing group name
  const studentToExistingGroupMap = new Map<string, string>();
  existingActiveGroups.forEach(g => {
    g.memberIds.forEach(mId => {
      studentToExistingGroupMap.set(mId, g.name);
    });
  });

  // Next group number suggestion
  const nextGroupNum = existingActiveGroups.length > 0
    ? Math.max(...existingActiveGroups.map(g => g.groupNumber), 0) + 1
    : 1;

  // Form states
  const [name, setName] = useState('');
  const [groupNumber, setGroupNumber] = useState<number>(nextGroupNum);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [leaderId, setLeaderId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterUnassignedOnly, setFilterUnassignedOnly] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or load data when modal opens or groupToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (groupToEdit) {
        setName(groupToEdit.name);
        setGroupNumber(groupToEdit.groupNumber);
        setSelectedMemberIds([...groupToEdit.memberIds]);
        setLeaderId(groupToEdit.leaderId);
        setNotes(groupToEdit.notes || '');
      } else {
        setName(`Kelompok ${nextGroupNum}`);
        setGroupNumber(nextGroupNum);
        setSelectedMemberIds([]);
        setLeaderId('');
        setNotes('');
      }
      setSearchStudent('');
      setFilterUnassignedOnly(false);
      setErrorMsg('');
    }
  }, [isOpen, groupToEdit, nextGroupNum]);

  // Keep leader valid: if current leader is no longer checked, set leader to first selected member
  useEffect(() => {
    if (selectedMemberIds.length > 0) {
      if (!selectedMemberIds.includes(leaderId)) {
        setLeaderId(selectedMemberIds[0]);
      }
    } else {
      setLeaderId('');
    }
  }, [selectedMemberIds, leaderId]);

  if (!isOpen) return null;

  const toggleStudent = (studentId: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllUnassigned = () => {
    const unassignedIds = classStudents
      .filter(s => !studentToExistingGroupMap.has(s.id))
      .map(s => s.id);
    setSelectedMemberIds(unassignedIds);
  };

  const handleClearSelection = () => {
    setSelectedMemberIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kelompok wajib diisi.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      setErrorMsg('Pilih minimal 1 orang siswa sebagai anggota kelompok.');
      return;
    }
    if (!leaderId) {
      setErrorMsg('Pilih salah satu anggota sebagai ketua kelompok.');
      return;
    }

    if (groupToEdit) {
      updateGroup({
        ...groupToEdit,
        name: name.trim(),
        groupNumber,
        leaderId,
        memberIds: selectedMemberIds,
        notes: notes.trim(),
      });
    } else {
      createGroup({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        name: name.trim(),
        groupNumber,
        leaderId,
        memberIds: selectedMemberIds,
        notes: notes.trim(),
        status: 'active',
        academicYear: currentClass?.academicYear || '2025/2026',
      });
    }

    onClose();
  };

  // Filter students for display
  const displayedStudents = classStudents.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.nisn.includes(searchStudent);
    if (!matchesSearch) return false;

    if (filterUnassignedOnly) {
      const alreadyInOtherGroup = studentToExistingGroupMap.has(s.id);
      const isSelectedInCurrent = selectedMemberIds.includes(s.id);
      return !alreadyInOtherGroup || isSelectedInCurrent;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>{groupToEdit ? 'Edit Kelompok' : 'Buat Kelompok Baru'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentClass?.name} · {currentSubject?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Group Name & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Kelompok <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Kelompok 1, Tim Aljabar, dll."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Kelompok
              </label>
              <input
                type="number"
                min={1}
                value={groupNumber}
                onChange={e => setGroupNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Members Selection (Student Roster Checklist) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Anggota Siswa <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-500">
                  {selectedMemberIds.length} siswa dipilih dari {classStudents.length} siswa kelas
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllUnassigned}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Pilih Semua yang Kosong
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            {/* Student Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={e => setSearchStudent(e.target.value)}
                  placeholder="Cari nama atau NISN siswa..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterUnassignedOnly}
                  onChange={e => setFilterUnassignedOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Hanya yang belum ada kelompok</span>
              </label>
            </div>

            {/* Checklist Container */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-slate-50/40">
              {displayedStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Tidak ada siswa yang sesuai dengan pencarian atau filter.
                </div>
              ) : (
                displayedStudents.map(student => {
                  const isChecked = selectedMemberIds.includes(student.id);
                  const isLeader = leaderId === student.id;
                  const existingGroupName = studentToExistingGroupMap.get(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition ${
                        isChecked ? 'bg-blue-50/80 font-medium text-blue-900' : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({student.nisn})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isChecked && isLeader && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            <Crown className="w-3 h-3" />
                            Ketua
                          </span>
                        )}
                        {!isChecked && existingGroupName && (
                          <span className="text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                            Sudah di {existingGroupName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Group Leader Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Ketua Kelompok <span className="text-rose-500">*</span></span>
            </label>
            {selectedMemberIds.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Pilih anggota terlebih dahulu untuk menentukan ketua kelompok.
              </p>
            ) : (
              <select
                value={leaderId}
                onChange={e => setLeaderId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                required
              >
                {selectedMemberIds.map(id => {
                  const student = classStudents.find(s => s.id === id);
                  return (
                    <option key={id} value={id}>
                      {student?.name} (Ketua)
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan / Keterangan Kelompok
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Kelompok presentasi materi Aljabar, projek alat peraga, dll."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            Anggota terpilih: <span className="font-bold text-slate-800">{selectedMemberIds.length} orang</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              Simpan Kelompok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
