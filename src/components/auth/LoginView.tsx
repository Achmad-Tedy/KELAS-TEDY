import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  Users,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  GraduationCap,
  School,
  KeyRound,
  Flame,
} from 'lucide-react';
import { FirebaseModal } from '../database/FirebaseModal';

export const LoginView: React.FC = () => {
  const { teachers, students, classes, login, loginAsRole, databaseStatus } = useSchool();
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Active role tab in login form
  const [selectedRole, setSelectedRole] = useState<UserRole>('guru');

  // Input states
  const [identifier, setIdentifier] = useState('198503122010012015'); // Default Ibu Ratna Sari NIP
  const [password, setPassword] = useState('guru123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
    } else if (role === 'guru') {
      setIdentifier('198503122010012015'); // Ibu Ratna Sari
      setPassword('guru123');
    } else {
      setIdentifier('0081234001'); // Ahmad Fauzi NISN
      setPassword('siswa123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Harap masukkan Username / NIP / NISN.');
      return;
    }

    const res = login(identifier.trim(), password.trim(), selectedRole);
    if (!res.success) {
      setErrorMsg(res.message || 'Login gagal.');
    }
  };

  const handleQuickLogin = (role: UserRole, targetId?: string) => {
    loginAsRole(role, targetId);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Brand Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-black text-3xl shadow-xl shadow-blue-500/20 mb-3 border border-white/20">
          K
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">KELAS</h1>
        <p className="mt-1 text-sm text-blue-200 font-semibold">
          Kelompok, Edukasi, Laporan, Aktivitas Siswa
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Sistem Terpadu Multi-Peran: Administrator • Pendidik (Guru) • Peserta Didik (Siswa)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
          {/* Role Selector Tabs */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pilih Peran Masuk (Role Login):
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('guru')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'guru'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>Guru</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('siswa')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'siswa'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Siswa</span>
              </button>
            </div>
          </div>

          {/* Role Context Explanatory Banner */}
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              selectedRole === 'admin'
                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                : selectedRole === 'guru'
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            {selectedRole === 'admin' && (
              <div>
                <strong className="block font-bold mb-0.5">🔑 Hak Akses Administrator Sekolah:</strong>
                Menginput dan mengelola data siswa dan data guru, mengatur kelas, serta mereset kata sandi agar guru dan siswa dapat login.
              </div>
            )}
            {selectedRole === 'guru' && (
              <div>
                <strong className="block font-bold mb-0.5">👨‍🏫 Hak Akses Pendidik (Guru):</strong>
                Mengisikan tugas mata pelajaran, mengatur kelompok mandiri per mata pelajaran, memantau pengumpulan, dan memberikan nilai (kelompok atau individual).
              </div>
            )}
            {selectedRole === 'siswa' && (
              <div>
                <strong className="block font-bold mb-0.5">🎒 Hak Akses Peserta Didik (Siswa):</strong>
                Hanya dapat melihat kelasnya sendiri (terisolasi ketat), melihat tugas mata pelajaran, mengisi nama kelompok tugas, dan mengumpulkan berkas tugas.
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {selectedRole === 'admin'
                  ? 'Username Admin'
                  : selectedRole === 'guru'
                  ? 'NIP / Email Guru'
                  : 'NISN / Nama Siswa'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => {
                    setIdentifier(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={
                    selectedRole === 'admin'
                      ? 'admin atau admin@sekolah.id'
                      : selectedRole === 'guru'
                      ? 'NIP: 198503122010012015 atau email guru'
                      : 'NISN: 0081234001 atau nama siswa'
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi (Password)
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedRole === 'admin' ? 'admin123' : selectedRole === 'guru' ? 'guru123' : 'siswa123'}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-white ${
                selectedRole === 'admin'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : selectedRole === 'guru'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <span>
                Masuk sebagai {selectedRole === 'admin' ? 'Administrator' : selectedRole === 'guru' ? 'Guru' : 'Siswa'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Masuk Cepat Demo (1-Klik Tanpa Ketik):</span>
              </span>
              <span className="text-[10px] text-slate-400">Pilih akun instan</span>
            </div>

            {selectedRole === 'admin' && (
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="p-3 text-left border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl transition text-xs flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-indigo-900 group-hover:text-indigo-700">
                      Administrator Sekolah (Tata Usaha)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Kelola data seluruh siswa, guru, kelas, dan kredensial login
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
            )}

            {selectedRole === 'guru' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {teachers.slice(0, 4).map(teacher => (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => handleQuickLogin('guru', teacher.id)}
                    className="p-2.5 text-left border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl transition text-xs flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                        <span>{teacher.name}</span>
                        <UserCheck className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{teacher.title}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                      NIP: {teacher.nip}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedRole === 'siswa' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {students.slice(0, 4).map(student => {
                  const studentClass = classes.find(c => c.id === student.classId);
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleQuickLogin('siswa', student.id)}
                      className="p-2.5 text-left border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl transition text-xs flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center justify-between">
                          <span>{student.name}</span>
                          <UserCheck className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
                        </div>
                        <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                          {studentClass?.name || 'Kelas 3A'}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                        NISN: {student.nisn}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Database Status Button */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setIsFirebaseModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 transition cursor-pointer shadow-sm backdrop-blur-xs"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                databaseStatus === 'connected'
                  ? 'text-amber-400 fill-amber-400'
                  : databaseStatus === 'syncing'
                  ? 'text-amber-400 animate-spin'
                  : databaseStatus === 'error'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            />
            <span>
              {databaseStatus === 'connected'
                ? 'Database: Firebase Firestore (Aktif)'
                : databaseStatus === 'syncing'
                ? 'Database: Menyinkronkan...'
                : databaseStatus === 'error'
                ? 'Database: Periksa Firebase'
                : 'Database: Firebase Offline'}
            </span>
            {databaseStatus === 'connected' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-xs text-slate-400">
          KELAS — Kelompok, Edukasi, Laporan, Aktivitas Siswa © 2026.
        </div>
      </div>

      {/* Firebase Connection Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
};
