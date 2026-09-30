import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types';
import {
  Users,
  BookOpen,
  RotateCcw,
  School,
  LayoutGrid,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Lock,
  AlertCircle,
  X,
  Flame,
} from 'lucide-react';
import { FirebaseModal } from './database/FirebaseModal';

interface NavbarProps {
  currentView: 'overview' | 'subject';
  onNavigateToOverview: () => void;
  onNavigateToSubject?: () => void;
  onOpenStudentManagement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateToOverview,
  onNavigateToSubject,
  onOpenStudentManagement,
}) => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    subjects,
    selectedSubjectId,
    currentUser,
    logout,
    resetAllData,
    getStudentsByClass,
    databaseStatus,
  } = useSchool();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const classStudents = getStudentsByClass(selectedClassId);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    try {
      logout();
    } finally {
      setIsLogoutModalOpen(false);
      setIsLoggingOut(false);
    }
  };

  const handleConfirmReset = () => {
    setIsResetModalOpen(false);
    resetAllData();
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span>Administrator</span>
          </span>
        );
      case 'guru':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-600" />
            <span>Guru Pengampu</span>
          </span>
        );
      case 'siswa':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-emerald-600" />
            <span>Peserta Didik</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand & App Name */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl tracking-tight shadow-sm">
                  K
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-xl leading-tight tracking-tight">KELAS</span>
                    {getRoleBadge(currentUser?.role)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    Kelompok, Edukasi, Laporan, Aktivitas Siswa
                  </p>
                </div>
              </div>
            </div>

            {/* Center Navigation based on Role */}
            <div className="flex items-center gap-2">
              {/* If GURU: can switch classes & manage student list */}
              {currentUser?.role === 'guru' && (
                <>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-600">
                      <School className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Pilih Kelas:</span>
                    </div>
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      className="bg-white text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {onOpenStudentManagement && (
                    <button
                      onClick={onOpenStudentManagement}
                      className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                      title="Kelola data siswa di kelas ini"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Data Siswa ({classStudents.length})</span>
                    </button>
                  )}

                  {currentView === 'overview' ? (
                    <button
                      onClick={onNavigateToSubject}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kembali ke Mapel ({currentSubject?.name || 'Mata Pelajaran'})</span>
                      <span className="sm:hidden">Kembali</span>
                    </button>
                  ) : (
                    <button
                      onClick={onNavigateToOverview}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Ringkasan Mapel</span>
                    </button>
                  )}
                </>
              )}

              {/* If SISWA: Class is strictly locked and cannot be changed! */}
              {currentUser?.role === 'siswa' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kelas: {currentClass ? currentClass.name : 'Kelas Anda'} (Terkunci)</span>
                </div>
              )}

              {/* If ADMIN: Shows badge */}
              {currentUser?.role === 'admin' && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Menu Administrator Sekolah</span>
                </div>
              )}
            </div>

            {/* Right Actions: User Profile Info & Logout */}
            <div className="flex items-center gap-2">
              {currentUser && (
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${
                      currentUser.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : currentUser.role === 'guru'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <span className="font-bold text-slate-800 block truncate max-w-[130px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                      {currentUser.title || currentUser.username}
                    </span>
                  </div>
                </div>
              )}

              {/* Firebase Database Connection Button */}
              <button
                type="button"
                onClick={() => setIsFirebaseModalOpen(true)}
                title={
                  databaseStatus === 'connected'
                    ? 'Database Firebase Firestore Terhubung Aktif'
                    : databaseStatus === 'syncing'
                    ? 'Sedang menyinkronkan data dengan Firebase...'
                    : databaseStatus === 'error'
                    ? 'Perlu perhatian konfigurasi Firebase'
                    : 'Konfigurasi & Hubungkan Database Firebase'
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer shadow-2xs ${
                  databaseStatus === 'connected'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : databaseStatus === 'syncing'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
                    : databaseStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Flame
                  className={`w-3.5 h-3.5 ${
                    databaseStatus === 'connected'
                      ? 'text-amber-500 fill-amber-500'
                      : databaseStatus === 'syncing'
                      ? 'text-amber-600 animate-spin'
                      : databaseStatus === 'error'
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {databaseStatus === 'connected'
                    ? 'Firebase'
                    : databaseStatus === 'syncing'
                    ? 'Sinkron...'
                    : databaseStatus === 'error'
                    ? 'Firebase !'
                    : 'Firebase'}
                </span>
                {databaseStatus === 'connected' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline" />
                )}
              </button>

              {/* Logout button (Opens clear in-app confirmation modal) */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                title="Keluar dari akun saat ini"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Keluar</span>
              </button>

              {/* Reset Data button */}
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                title="Reset ke data contoh bawaan"
                className="flex items-center gap-1.5 p-1.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONFIRMATION MODAL: KELUAR (LOGOUT) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Konfirmasi Keluar</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin keluar dari akun <strong className="text-slate-900">{currentUser?.name}</strong>?
              </p>

              {currentUser && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Peran Pengguna:</span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">
                      {currentUser.role === 'admin'
                        ? 'Username'
                        : currentUser.role === 'guru'
                        ? 'NIP'
                        : 'NISN'}
                      :
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {currentUser.username || '-'}
                    </span>
                  </div>
                  {currentUser.className && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Kelas:</span>
                      <span className="font-semibold text-slate-800">{currentUser.className}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:cursor-not-allowed transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isLoggingOut ? 'Sedang Keluar...' : 'Ya, Keluar Akun'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: RESET DATA DEMO */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Reset Data Demo</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Kembalikan semua data ke pengaturan awal bawaan (default)? Data siswa, guru, kelompok, dan nilai yang baru dibuat akan diatur ulang.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ya, Reset Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INTEGRASI DATABASE FIREBASE */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </>
  );
};
