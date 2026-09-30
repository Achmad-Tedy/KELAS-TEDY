import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Group, Student } from '../../types';
import { GroupFormModal } from './GroupFormModal';
import { GroupDetailModal } from './GroupDetailModal';
import { DeleteGroupModal } from './DeleteGroupModal';
import { AutoGenerateModal } from './AutoGenerateModal';
import {
  Users,
  UserPlus,
  Sparkles,
  Search,
  Crown,
  User,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Award,
  MoreVertical,
} from 'lucide-react';

export const GroupListView: React.FC = () => {
  const {
    selectedClassId,
    selectedSubjectId,
    classes,
    subjects,
    students,
    getGroupsBySubject,
    getStudentsByClass,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const classStudents = getStudentsByClass(selectedClassId);
  const activeGroups = getGroupsBySubject(selectedClassId, selectedSubjectId, false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [detailGroup, setDetailGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);

  // Grouped students calculation
  const assignedStudentSet = new Set<string>();
  activeGroups.forEach(g => g.memberIds.forEach(id => assignedStudentSet.add(id)));
  const unassignedCount = Math.max(0, classStudents.length - assignedStudentSet.size);

  const filteredGroups = activeGroups.filter(g => {
    const matchesName = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const memberNames = g.memberIds
      .map(id => students.find(s => s.id === id)?.name || '')
      .join(' ')
      .toLowerCase();
    const matchesMember = memberNames.includes(searchQuery.toLowerCase());
    return matchesName || matchesMember;
  });

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (group: Group) => {
    setDeletingGroup(group);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Daftar Kelompok {currentSubject?.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                {activeGroups.length} Kelompok
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {assignedStudentSet.size} dari {classStudents.length} siswa telah masuk kelompok
              {unassignedCount > 0 && (
                <span className="text-amber-700 font-semibold ml-2 inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" />
                  {unassignedCount} siswa belum memiliki kelompok
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAutoGenerateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Bagi Otomatis</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Buat Kelompok</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama kelompok atau nama anggota..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'Tidak ada kelompok yang cocok' : 'Belum Ada Kelompok Terdaftar'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Coba ganti kata kunci pencarian kelompok atau nama siswa.'
              : `Buat kelompok belajar untuk mata pelajaran ${currentSubject?.name} secara manual atau bagi merata secara otomatis.`}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              + Buat Kelompok Baru
            </button>
            <button
              onClick={() => setIsAutoGenerateOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Bagi Otomatis
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map(group => {
            const leader = students.find(s => s.id === group.leaderId);
            const memberStudents = group.memberIds
              .map(id => students.find(s => s.id === id))
              .filter((s): s is Student => Boolean(s));

            return (
              <div
                key={group.id}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl shadow-xs transition duration-150 flex flex-col justify-between overflow-hidden group"
              >
                {/* Header card matching user's ASCII mockup:
                    ┌─────────────────────────┐
                    │ 👥 KELOMPOK 1           │
                    │                         │
                    │ Ketua: Ahmad            │
                    │                         │
                    │ 👤 Ahmad                │
                    │ 👤 Budi                 │
                    │ 👤 Citra                │
                    │ 👤 Deni                 │
                    │                         │
                    │ 4 Anggota               │
                    │                         │
                    │ [Edit] [Detail]         │
                    └─────────────────────────┘
                */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
                          {group.name}
                        </h3>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                          <span>
                            Ketua: <strong className="text-slate-800">{leader?.name || '-'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      #{group.groupNumber}
                    </span>
                  </div>

                  {/* Notes if available */}
                  {group.notes && (
                    <div className="mt-3 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-600 line-clamp-2 italic">
                      "{group.notes}"
                    </div>
                  )}

                  {/* Member List */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Anggota Kelompok:
                    </div>
                    {memberStudents.map(student => {
                      const isLeader = student.id === group.leaderId;
                      return (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between text-xs py-1 px-2 rounded-md ${
                            isLeader
                              ? 'bg-amber-50/60 font-semibold text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <User className={`w-3.5 h-3.5 shrink-0 ${isLeader ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span className="truncate">{student.name}</span>
                          </div>
                          {isLeader && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                              Ketua
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer card */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    {memberStudents.length} Anggota
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(group)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-white rounded-md border border-slate-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDetailGroup(group)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GroupFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        groupToEdit={editingGroup}
      />

      <GroupDetailModal
        group={detailGroup}
        isOpen={Boolean(detailGroup)}
        onClose={() => setDetailGroup(null)}
        onEdit={g => {
          setDetailGroup(null);
          handleOpenEdit(g);
        }}
        onDelete={g => {
          setDetailGroup(null);
          handleOpenDelete(g);
        }}
      />

      <DeleteGroupModal
        group={deletingGroup}
        isOpen={Boolean(deletingGroup)}
        onClose={() => setDeletingGroup(null)}
        onDeleted={() => setDeletingGroup(null)}
      />

      <AutoGenerateModal
        isOpen={isAutoGenerateOpen}
        onClose={() => setIsAutoGenerateOpen(false)}
      />
    </div>
  );
};
