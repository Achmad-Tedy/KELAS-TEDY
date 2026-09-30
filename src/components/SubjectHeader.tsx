import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  FileText,
  Users,
  BarChart3,
  Archive,
  ChevronRight,
  Calculator,
  FlaskConical,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';

export type SubjectTab = 'groups' | 'assignments' | 'grades' | 'archive';

interface SubjectHeaderProps {
  activeTab: SubjectTab;
  onTabChange: (tab: SubjectTab) => void;
  onNavigateToOverview: () => void;
}

export const SubjectHeader: React.FC<SubjectHeaderProps> = ({
  activeTab,
  onTabChange,
  onNavigateToOverview,
}) => {
  const {
    classes,
    selectedClassId,
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    groups,
    assignments,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Group counts
  const activeGroups = groups.filter(
    g => g.classId === selectedClassId && g.subjectId === selectedSubjectId && g.status === 'active'
  );
  const archivedGroups = groups.filter(
    g => g.classId === selectedClassId && g.subjectId === selectedSubjectId && g.status === 'archived'
  );
  const activeAssignments = assignments.filter(
    a => a.classId === selectedClassId && a.subjectId === selectedSubjectId
  );

  const getSubjectIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-5 h-5" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-0 mb-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToOverview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
            title="Kembali ke Ringkasan Semua Mata Pelajaran"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Ringkasan Mapel</span>
          </button>

          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={onNavigateToOverview}
              className="hover:text-blue-600 transition hover:underline"
            >
              {currentClass?.name}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <div className="relative inline-block">
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 pr-5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 rounded py-0.5"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-700 font-semibold">
              {activeTab === 'groups' && '👥 Kelompok'}
              {activeTab === 'assignments' && '📝 Tugas'}
              {activeTab === 'grades' && '📊 Nilai'}
              {activeTab === 'archive' && '📂 Arsip'}
            </span>
          </nav>
        </div>

        {/* Subject quick switcher bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline mr-1">Mapel:</span>
          {subjects.map(s => {
            const isSelected = s.id === selectedSubjectId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Subject Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shadow-xs">
            {getSubjectIcon(currentSubject?.iconName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentSubject?.name}
              </h1>
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                {currentSubject?.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Guru Pengampu: <span className="font-semibold text-slate-700">{currentSubject?.teacherName}</span>
              <span className="mx-2 text-slate-300">·</span>
              {currentClass?.name} ({currentClass?.academicYear})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Kelompok Aktif</span>
            <span className="text-base font-bold text-slate-900">{activeGroups.length} Kelompok</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Tugas Mapel</span>
            <span className="text-base font-bold text-slate-900">{activeAssignments.length} Tugas</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Exactly as requested in prompt:
          Matematika
          📝 Tugas
          👥 Kelompok
          📊 Nilai
          📂 Arsip
      */}
      <div className="flex items-center space-x-1 border-t border-slate-100">
        <button
          onClick={() => onTabChange('groups')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'groups'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Kelompok</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'groups' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {activeGroups.length}
          </span>
        </button>

        <button
          onClick={() => onTabChange('assignments')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'assignments'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📝 Tugas</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'assignments' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {activeAssignments.length}
          </span>
        </button>

        <button
          onClick={() => onTabChange('grades')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'grades'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Nilai</span>
        </button>

        <button
          onClick={() => onTabChange('archive')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'archive'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>📂 Arsip</span>
          {archivedGroups.length > 0 && (
            <span className="text-xs px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-700">
              {archivedGroups.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
