import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, TeacherUser } from '../../types';
import {
  Users,
  GraduationCap,
  School,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  BookOpen,
  UserPlus,
  Lock,
  X,
  Layers,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { GoogleDriveModal } from '../drive/GoogleDriveModal';
import { isDriveConnected, getDriveUser, subscribeToDriveAuth } from '../../lib/googleDrive';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    teachers,
    classes,
    subjects,
    groups,
    assignments,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    resetAllData,
  } = useSchool();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'classes' | 'stats'>('students');

  // Student Filters & Search
  const [studentClassFilter, setStudentClassFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Teacher Search
  const [teacherSearch, setTeacherSearch] = useState<string>('');

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [studentGender, setStudentGender] = useState<'L' | 'P'>('L');
  const [studentClassId, setStudentClassId] = useState('c-3a');
  const [studentPassword, setStudentPassword] = useState('siswa123');

  // Bulk Student Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkClassId, setBulkClassId] = useState('c-3a');
  const [bulkText, setBulkText] = useState('');

  // Teacher Modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherUser | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [teacherNip, setTeacherNip] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherRole, setTeacherRole] = useState<'guru' | 'wali_kelas'>('guru');
  const [teacherTitle, setTeacherTitle] = useState('Guru Pengampu');
  const [teacherClassId, setTeacherClassId] = useState('c-3a');
  const [teacherSubjectId, setTeacherSubjectId] = useState('sub-matematika');
  const [teacherPassword, setTeacherPassword] = useState('guru123');

  // Confirm delete & reset states
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherUser | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Google Drive Admin state
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveUser, setDriveUser] = useState(getDriveUser());
  const [isDriveConnectedState, setIsDriveConnectedState] = useState(isDriveConnected());

  useEffect(() => {
    const unsub = subscribeToDriveAuth((u, token) => {
      setDriveUser(u);
      setIsDriveConnectedState(Boolean(u && token));
    });
    return () => unsub();
  }, []);

  // Notification message
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3500);
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchClass = studentClassFilter === 'all' || s.classId === studentClassFilter;
    const matchSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nisn.toLowerCase().includes(studentSearch.toLowerCase());
    return matchClass && matchSearch;
  });

  // Filtered Teachers
  const filteredTeachers = teachers.filter(t => {
    return (
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.nip.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );
  });

  // Student Handlers
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentNisn(`008${Math.floor(1000000 + Math.random() * 9000000)}`);
    setStudentGender('L');
    setStudentClassId(classes[0]?.id || 'c-3a');
    setStudentPassword('siswa123');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setStudentName(st.name);
    setStudentNisn(st.nisn);
    setStudentGender(st.gender);
    setStudentClassId(st.classId || 'c-3a');
    setStudentPassword(st.password || 'siswa123');
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentNisn.trim()) {
      showNotif('error', 'Nama siswa dan NISN wajib diisi.');
      return;
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        name: studentName.trim(),
        nisn: studentNisn.trim(),
        gender: studentGender,
        classId: studentClassId,
        password: studentPassword.trim() || 'siswa123',
      });
      showNotif('success', `Data siswa "${studentName}" berhasil diperbarui.`);
    } else {
      addStudent(
        {
          name: studentName.trim(),
          nisn: studentNisn.trim(),
          gender: studentGender,
          classId: studentClassId,
          password: studentPassword.trim() || 'siswa123',
        },
        studentClassId
      );
      const targetClass = classes.find(c => c.id === studentClassId)?.name || 'Kelas';
      showNotif('success', `Siswa baru "${studentName}" berhasil ditambahkan ke ${targetClass}.`);
    }

    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (st: Student) => {
    setStudentToDelete(st);
  };

  const confirmDeleteStudent = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    showNotif('success', `Siswa "${studentToDelete.name}" berhasil dihapus.`);
    setStudentToDelete(null);
  };

  const handleSaveBulkStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const parsedList: Omit<Student, 'id'>[] = lines.map((line, idx) => {
      const parts = line.split(/[,\t;|]/).map(p => p.trim());
      const name = parts[0] || `Siswa ${idx + 1}`;
      const nisn = parts[1] && parts[1].length >= 5 ? parts[1] : `008${Math.floor(1000000 + Math.random() * 9000000)}`;
      const rawGender = (parts[2] || 'L').toUpperCase();
      const gender: 'L' | 'P' = rawGender === 'P' || rawGender === 'PEREMPUAN' ? 'P' : 'L';
      const password = parts[3] || 'siswa123';

      return {
        name,
        nisn,
        gender,
        classId: bulkClassId,
        password,
      };
    });

    bulkAddStudents(parsedList, bulkClassId);
    const targetClass = classes.find(c => c.id === bulkClassId)?.name;
    showNotif('success', `Berhasil menambahkan ${parsedList.length} siswa ke ${targetClass}.`);
    setBulkText('');
    setIsBulkModalOpen(false);
  };

  // Teacher Handlers
  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setTeacherName('');
    setTeacherNip(`198${Math.floor(100000000000000 + Math.random() * 90000000000000)}`);
    setTeacherEmail('');
    setTeacherRole('guru');
    setTeacherTitle('Guru Pengampu');
    setTeacherClassId('c-3a');
    setTeacherSubjectId('sub-matematika');
    setTeacherPassword('guru123');
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (t: TeacherUser) => {
    setEditingTeacher(t);
    setTeacherName(t.name);
    setTeacherNip(t.nip);
    setTeacherEmail(t.email);
    setTeacherRole(t.role === 'wali_kelas' ? 'wali_kelas' : 'guru');
    setTeacherTitle(t.title);
    setTeacherClassId(t.assignedClassId || 'c-3a');
    setTeacherSubjectId(t.subjectTaught || 'sub-matematika');
    setTeacherPassword(t.password || 'guru123');
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherNip.trim()) {
      showNotif('error', 'Nama guru dan NIP wajib diisi.');
      return;
    }

    const email =
      teacherEmail.trim() ||
      `${teacherName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}@sekolah.id`;

    if (editingTeacher) {
      updateTeacher({
        ...editingTeacher,
        name: teacherName.trim(),
        nip: teacherNip.trim(),
        email,
        role: teacherRole,
        title: teacherTitle.trim() || 'Guru Pengampu',
        assignedClassId: teacherClassId,
        subjectTaught: teacherSubjectId,
        password: teacherPassword.trim() || 'guru123',
      });
      showNotif('success', `Data guru "${teacherName}" berhasil diperbarui.`);
    } else {
      addTeacher({
        name: teacherName.trim(),
        nip: teacherNip.trim(),
        email,
        role: teacherRole,
        title: teacherTitle.trim() || 'Guru Pengampu',
        assignedClassId: teacherClassId,
        subjectTaught: teacherSubjectId,
        password: teacherPassword.trim() || 'guru123',
      });
      showNotif('success', `Guru baru "${teacherName}" berhasil ditambahkan.`);
    }

    setIsTeacherModalOpen(false);
  };

  const handleDeleteTeacher = (t: TeacherUser) => {
    setTeacherToDelete(t);
  };

  const confirmDeleteTeacher = () => {
    if (!teacherToDelete) return;
    deleteTeacher(teacherToDelete.id);
    showNotif('success', `Guru "${teacherToDelete.name}" berhasil dihapus.`);
    setTeacherToDelete(null);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Admin Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs uppercase tracking-wider border border-blue-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel Administrator Sekolah</span>
              </span>
              <span className="text-xs text-slate-400">Tahun Ajaran 2025/2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manajemen Data Guru & Siswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Pusat kendali admin untuk menginput data siswa dan guru agar dapat login ke dalam aplikasi KELAS.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Reset data demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Siswa</span>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{students.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Terdaftar di semua kelas</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Guru</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{teachers.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pendidik & Wali Kelas</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Kelas</span>
              <School className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{classes.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Rombongan belajar aktif</div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Kelompok Aktif</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {groups.filter(g => g.status === 'active').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Kelompok mapel mandiri</div>
          </div>
        </div>
      </div>

      {/* Google Drive Admin Storage Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isDriveConnectedState
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Penyimpanan Pengumpulan Tugas (Google Drive Admin)
              </h3>
              {isDriveConnectedState ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Google Drive Terhubung</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200">
                  Belum Terhubung
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isDriveConnectedState
                ? `Akun: ${driveUser?.email || 'Admin'} • Folder: "Pengumpulan Tugas - KELAS" (Berkas siswa otomatis tersimpan di sini)`
                : 'Hubungkan akun Google Drive Admin agar berkas tugas yang dikumpulkan siswa otomatis tersimpan di Drive admin.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsDriveModalOpen(true)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs ${
              isDriveConnectedState
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>{isDriveConnectedState ? 'Kelola Folder Drive' : 'Hubungkan Google Drive'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notif && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition animate-in fade-in slide-in-from-top-2 ${
            notif.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notif.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{notif.message}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Kelola Data Siswa ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Data Guru ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Data Kelas & Mapel</span>
        </button>
      </div>

      {/* TAB 1: DATA SISWA */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Daftar Siswa & Kredensial Login Siswa</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Siswa dapat login menggunakan <strong>NISN</strong> dan kata sandi yang ditentukan di sini. Siswa hanya dapat melihat kelasnya sendiri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Impor Massal</span>
              </button>
              <button
                onClick={handleOpenAddStudent}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Cari nama siswa atau NISN..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Filter Kelas:</span>
              <select
                value={studentClassFilter}
                onChange={e => setStudentClassFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="all">Semua Kelas ({students.length} Siswa)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({students.filter(s => s.classId === c.id).length} Siswa)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">NISN (Username Login)</th>
                  <th className="py-3 px-4">Kelas Terdaftar</th>
                  <th className="py-3 px-4">L/P</th>
                  <th className="py-3 px-4">Kata Sandi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada data siswa yang cocok dengan pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => {
                    const studentClass = classes.find(c => c.id === st.classId);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-[11px] text-slate-400">ID: {st.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 font-semibold">
                            {st.nisn}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {studentClass ? studentClass.name : 'Belum Ditentukan'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              st.gender === 'L'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-pink-50 text-pink-700'
                            }`}
                          >
                            {st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {st.password || 'siswa123'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditStudent(st)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit siswa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DATA GURU */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Daftar Guru & Kredensial Login Guru</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Guru dapat login menggunakan <strong>NIP</strong> atau <strong>Email</strong> untuk menginput tugas dan memberikan nilai kelompok/siswa.
              </p>
            </div>

            <button
              onClick={handleOpenAddTeacher}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Guru Baru</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={teacherSearch}
                onChange={e => setTeacherSearch(e.target.value)}
                placeholder="Cari nama guru, NIP, atau email..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Teachers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama & Gelar</th>
                  <th className="py-3 px-4">NIP (Username Login)</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Peran / Mapel Pengampu</th>
                  <th className="py-3 px-4">Kelas Pengampu</th>
                  <th className="py-3 px-4">Kata Sandi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada data guru yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t, idx) => {
                    const assignedClass = classes.find(c => c.id === t.assignedClassId);
                    const subject = subjects.find(s => s.id === t.subjectTaught);

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[11px] text-slate-500">{t.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-semibold">
                            {t.nip}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{t.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-800">
                              {subject ? subject.name : 'Semua Mapel'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {t.role === 'wali_kelas' ? '🌟 Wali Kelas' : 'Guru Mapel'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {assignedClass ? assignedClass.name : 'Kelas 3A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {t.password || 'guru123'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditTeacher(t)}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Edit guru"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus guru"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DATA KELAS & MAPEL */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kelas list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <School className="w-5 h-5 text-amber-600" />
              <span>Daftar Rombongan Belajar (Kelas)</span>
            </h2>

            <div className="space-y-3">
              {classes.map(cls => {
                const classStudents = students.filter(s => s.classId === cls.id);
                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{cls.name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          Tingkat {cls.gradeLevel}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Wali Kelas: <span className="font-semibold text-slate-700">{cls.homeroomTeacher}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tahun Ajaran: {cls.academicYear}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-blue-600">{classStudents.length}</div>
                      <div className="text-[10px] text-slate-400">Siswa Terdaftar</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subjects list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Mata Pelajaran Aktif</span>
            </h2>

            <div className="space-y-3">
              {subjects.map(sub => {
                const subGroups = groups.filter(g => g.subjectId === sub.id && g.status === 'active');
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {sub.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Pengampu: <span className="font-semibold text-slate-700">{sub.teacherName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-purple-600">{subGroups.length}</div>
                      <div className="text-[10px] text-slate-400">Kelompok Aktif</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT SISWA */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
              </h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NISN (Username Login) *
                </label>
                <input
                  type="text"
                  required
                  value={studentNisn}
                  onChange={e => setStudentNisn(e.target.value)}
                  placeholder="Contoh: 0081234021"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  NISN akan digunakan siswa untuk masuk ke akunnya.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kelas *
                  </label>
                  <select
                    value={studentClassId}
                    onChange={e => setStudentClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={studentGender}
                    onChange={e => setStudentGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi (Password) Login *
                </label>
                <input
                  type="text"
                  required
                  value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)}
                  placeholder="siswa123"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Default: <code className="text-slate-600">siswa123</code> (bisa diganti sesuai kebutuhan).
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPOR MASSAL SISWA */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Impor Massal Siswa</span>
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBulkStudents} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Kelas Tujuan
                </label>
                <select
                  value={bulkClassId}
                  onChange={e => setBulkClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Paste Daftar Siswa (1 Baris per Siswa)
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Format: <code>Nama, NISN, Gender(L/P), Password</code> (Atau cukup ketik nama saja).
                </p>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={`Zaki Mubarak, 0081234031, L, siswa123\nAnisa Rahma, 0081234032, P, siswa123\nDimas Anggara, 0081234033, L, siswa123`}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!bulkText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Impor Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT GURU */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</span>
              </h3>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Guru & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  placeholder="Contoh: Dra. Sri Mulyani, M.Pd."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NIP / NUPTK *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherNip}
                    onChange={e => setTeacherNip(e.target.value)}
                    placeholder="198001012005011002"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={e => setTeacherEmail(e.target.value)}
                    placeholder="nama@sekolah.id"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={teacherSubjectId}
                    onChange={e => setTeacherSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kelas Diampu / Binaan
                  </label>
                  <select
                    value={teacherClassId}
                    onChange={e => setTeacherClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jabatan / Keterangan
                </label>
                <input
                  type="text"
                  value={teacherTitle}
                  onChange={e => setTeacherTitle(e.target.value)}
                  placeholder="Wali Kelas 3A & Guru Matematika"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi (Password) Login *
                </label>
                <input
                  type="text"
                  required
                  value={teacherPassword}
                  onChange={e => setTeacherPassword(e.target.value)}
                  placeholder="guru123"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Guru login dengan NIP/Email dan password ini.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE STUDENT MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Hapus Siswa?</h4>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data siswa <strong className="text-slate-900">{studentToDelete.name}</strong> (NISN: {studentToDelete.nisn})?
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
                onClick={confirmDeleteStudent}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE TEACHER MODAL */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Hapus Guru?</h4>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data guru <strong className="text-slate-900">{teacherToDelete.name}</strong> (NIP: {teacherToDelete.nip})?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteTeacher}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET DATA DEMO MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Reset Data Demo</span>
            </h4>
            <p className="text-xs text-slate-600">
              Kembalikan semua data ke pengaturan awal demo? Seluruh data yang baru ditambahkan akan direset ke kondisi awal.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                  showNotif('success', 'Semua data contoh berhasil di-reset.');
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Admin Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </div>
  );
};
