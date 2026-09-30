import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Group, Student } from '../../types';
import {
  Archive,
  RotateCcw,
  Calendar,
  Users,
  Crown,
  Search,
  CheckCircle2,
  Trash2,
  Clock,
  Filter,
} from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    groups,
    selectedClassId,
    selectedSubjectId,
    toggleGroupStatus,
    deleteGroup,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  const [filterClass, setFilterClass] = useState<string>(selectedClassId);
  const [filterSubject, setFilterSubject] = useState<string>(selectedSubjectId);
  const [filterStatus, setFilterStatus] = useState<'all' | 'archived' | 'active'>('archived');
  const [searchQuery, setSearchQuery] = useState('');

  // Groups matching filters
  const filteredGroups = groups.filter(g => {
    if (filterClass !== 'all' && g.classId !== filterClass) return false;
    if (filterSubject !== 'all' && g.subjectId !== filterSubject) return false;
    if (filterStatus === 'archived' && g.status !== 'archived') return false;
    if (filterStatus === 'active' && g.status !== 'active') return false;

    if (searchQuery.trim()) {
      const matchName = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const memberNames = g.memberIds
        .map(id => students.find(s => s.id === id)?.name || '')
        .join(' ')
        .toLowerCase();
      if (!matchName && !memberNames.includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Riwayat & Arsip Pembagian Kelompok Siswa
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelompok yang pernah digunakan pada tugas atau semester lampau tersimpan aman agar data nilai siswa tidak hilang.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Total Arsip Tersimpan: <strong className="text-slate-900">{groups.filter(g => g.status === 'archived').length} Kelompok</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Filter Kelas:</label>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Filter Mata Pelajaran:</label>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Semua Mapel</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status Kelompok:</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="archived">Hanya Kelompok Diarsip</option>
              <option value="active">Hanya Kelompok Aktif</option>
              <option value="all">Semua Status (Aktif & Arsip)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Cari Nama/Anggota:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci..."
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* History Table / Records */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada riwayat kelompok yang cocok</p>
            <p className="text-slate-400 mt-0.5">
              Kelompok yang diarsipkan dari halaman kelompok akan muncul di daftar ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Kelompok & Mapel</th>
                  <th className="px-5 py-3.5">Ketua</th>
                  <th className="px-5 py-3.5">Anggota Kelompok</th>
                  <th className="px-5 py-3.5">Tahun Ajaran</th>
                  <th className="px-5 py-3.5">Tanggal Dibuat / Diperbarui</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map(grp => {
                  const grpClass = classes.find(c => c.id === grp.classId);
                  const grpSubject = subjects.find(s => s.id === grp.subjectId);
                  const leader = students.find(s => s.id === grp.leaderId);
                  const memberStudents = grp.memberIds
                    .map(id => students.find(s => s.id === id))
                    .filter((s): s is Student => Boolean(s));

                  return (
                    <tr key={grp.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{grp.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {grpClass?.name} · {grpSubject?.name}
                        </div>
                        {grp.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs truncate">
                            "{grp.notes}"
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{leader?.name || '-'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="text-slate-700 font-medium">
                          {memberStudents.map(m => m.name).join(', ')}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Total: {memberStudents.length} siswa
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {grp.academicYear}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        <div>Dibuat: {formatDate(grp.createdAt)}</div>
                        <div className="text-[10px] text-slate-400">
                          Diperbarui: {formatDate(grp.updatedAt)}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            grp.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {grp.status === 'active' ? '🟢 Aktif' : '📦 Arsip'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => toggleGroupStatus(grp.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
                              grp.status === 'archived'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {grp.status === 'archived' ? 'Aktifkan Kembali' : 'Arsipkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
