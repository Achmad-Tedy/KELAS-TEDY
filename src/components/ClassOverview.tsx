import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { Subject } from '../types';
import {
  Users,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Calculator,
  FlaskConical,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface ClassOverviewProps {
  onSelectSubject: (subjectId: string, initialTab?: 'groups' | 'assignments' | 'grades' | 'archive') => void;
  onOpenStudentManagement?: () => void;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({
  onSelectSubject,
  onOpenStudentManagement,
}) => {
  const {
    classes,
    selectedClassId,
    subjects,
    selectedSubjectId,
    groups,
    assignments,
    getStudentsByClass,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const classStudents = getStudentsByClass(selectedClassId);

  // Helper icon for subjects
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-blue-600" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-emerald-600" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-600" />;
    }
  };

  const getSubjectBadgeStyle = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'emerald':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'amber':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Menu Kembali & Status Ringkasan Mapel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectSubject(selectedSubjectId || 'sub-matematika', 'groups')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Mapel {currentSubject?.name || 'Matematika'}</span>
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Atau klik salah satu mata pelajaran di bawah untuk melihat kelompoknya
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-500">Tampilan Saat Ini:</span>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded-md border border-blue-200">
            📊 Ringkasan Seluruh Mapel
          </span>
        </div>
      </div>

      {/* Hero / Header Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>Tahun Ajaran {currentClass?.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ringkasan Kelompok: {currentClass?.name}
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            Setiap mata pelajaran memiliki daftar kelompok mandiri. Anggota kelompok Matematika tidak harus sama dengan anggota kelompok IPA, memudahkan pencatatan tanpa bergantung pada chat WhatsApp atau catatan kertas manual.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-blue-100">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              Wali Kelas: <span className="text-white font-semibold">{currentClass?.homeroomTeacher}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              Total Siswa: <span className="text-white font-semibold">{classStudents.length} Siswa</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              Mata Pelajaran Aktif: <span className="text-white font-semibold">{subjects.length} Mapel</span>
            </div>
            {onOpenStudentManagement && (
              <button
                onClick={onOpenStudentManagement}
                className="bg-white text-blue-800 hover:bg-blue-50 px-3.5 py-1.5 rounded-lg font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Kelola / Tambah Data Siswa</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Direct Table Mockup / Card Grid as requested */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Kelompok Per Mata Pelajaran</h2>
            <p className="text-xs text-slate-500">Klik mata pelajaran untuk melihat atau mengelola susunan kelompok siswa.</p>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Mata Pelajaran</th>
                  <th scope="col" className="px-6 py-4">Guru Pengampu</th>
                  <th scope="col" className="px-6 py-4 text-center">Jumlah Kelompok</th>
                  <th scope="col" className="px-6 py-4 text-center">Siswa Terkelompokkan</th>
                  <th scope="col" className="px-6 py-4 text-center">Tugas Aktif</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map(subject => {
                  const subjectGroups = groups.filter(
                    g => g.classId === selectedClassId && g.subjectId === subject.id && g.status === 'active'
                  );
                  const archivedGroups = groups.filter(
                    g => g.classId === selectedClassId && g.subjectId === subject.id && g.status === 'archived'
                  );
                  const subjectAssignments = assignments.filter(
                    a => a.classId === selectedClassId && a.subjectId === subject.id
                  );

                  // Calculate how many students are placed in groups
                  const groupedStudentSet = new Set<string>();
                  subjectGroups.forEach(g => g.memberIds.forEach(m => groupedStudentSet.add(m)));
                  const allStudentsGrouped = groupedStudentSet.size === classStudents.length && classStudents.length > 0;

                  return (
                    <tr
                      key={subject.id}
                      onClick={() => onSelectSubject(subject.id, 'groups')}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${getSubjectBadgeStyle(subject.color)}`}>
                            {getSubjectIcon(subject.iconName)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>{subject.name}</span>
                              <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {subject.code}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {archivedGroups.length > 0 ? `${archivedGroups.length} kelompok diarsip` : 'Semua kelompok aktif'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                        {subject.teacherName}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
                          {subjectGroups.length} Kelompok
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          {allStudentsGrouped ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{groupedStudentSet.size}/{classStudents.length} Siswa</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{groupedStudentSet.size}/{classStudents.length} Siswa</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700">
                        {subjectAssignments.length} Tugas
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectSubject(subject.id, 'groups');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                        >
                          <span>Buka Kelompok</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cards breakdown per subject */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map(subject => {
          const subjectGroups = groups.filter(
            g => g.classId === selectedClassId && g.subjectId === subject.id && g.status === 'active'
          );

          return (
            <div
              key={subject.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${getSubjectBadgeStyle(subject.color)}`}>
                      {getSubjectIcon(subject.iconName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{subject.name}</h3>
                      <p className="text-xs text-slate-500">{subject.teacherName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                    {subjectGroups.length} Kelompok
                  </span>
                </div>

                {/* Preview sample groups */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Daftar Kelompok Terdaftar:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectGroups.slice(0, 5).map(g => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-xs font-medium"
                      >
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{g.name}</span>
                        <span className="text-[10px] text-slate-400">({g.memberIds.length} anak)</span>
                      </span>
                    ))}
                    {subjectGroups.length > 5 && (
                      <span className="text-xs text-slate-500 self-center font-medium">
                        +{subjectGroups.length - 5} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectSubject(subject.id, 'assignments')}
                  className="text-slate-600 hover:text-blue-600 font-medium py-1 px-2 rounded hover:bg-slate-50"
                >
                  📝 Lihat Tugas
                </button>
                <button
                  onClick={() => onSelectSubject(subject.id, 'grades')}
                  className="text-slate-600 hover:text-blue-600 font-medium py-1 px-2 rounded hover:bg-slate-50"
                >
                  📊 Penilaian
                </button>
                <button
                  onClick={() => onSelectSubject(subject.id, 'groups')}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-blue-50 border border-blue-200"
                >
                  👥 Kelola Kelompok
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
