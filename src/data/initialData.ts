import { Student, TeacherUser, ClassRoom, Subject, Group, Assignment, Submission, Grade, PresentationAssessment, AuthUser } from '../types';

export const INITIAL_ADMIN: AuthUser = {
  id: 'usr-admin-1',
  name: 'Administrator Sekolah (TU)',
  role: 'admin',
  username: 'admin',
  email: 'admin@sekolah.id',
  title: 'Admin Sistem KELAS',
};

export const INITIAL_TEACHERS: TeacherUser[] = [
  {
    id: 'tch-1',
    name: 'Ibu Ratna Sari, S.Pd.',
    nip: '198503122010012015',
    email: 'ratna.sari@sekolah.id',
    role: 'wali_kelas',
    title: 'Wali Kelas 3A & Guru Bahasa Indonesia',
    assignedClassId: 'c-3a',
    subjectTaught: 'sub-bindo',
    password: 'guru123',
  },
  {
    id: 'tch-2',
    name: 'Bapak Suryono, M.Pd.',
    nip: '197906152005011008',
    email: 'suryono@sekolah.id',
    role: 'guru',
    title: 'Guru Pengampu Matematika',
    assignedClassId: 'c-3a',
    subjectTaught: 'sub-matematika',
    password: 'guru123',
  },
  {
    id: 'tch-3',
    name: 'Ibu Tri Wahyuni, M.Si.',
    nip: '198809222015022003',
    email: 'tri.wahyuni@sekolah.id',
    role: 'guru',
    title: 'Guru Pengampu IPA',
    assignedClassId: 'c-3a',
    subjectTaught: 'sub-ipa',
    password: 'guru123',
  },
  {
    id: 'tch-4',
    name: 'Bapak Hendra Gunawan, S.Pd.',
    nip: '198204192008011012',
    email: 'hendra.gunawan@sekolah.id',
    role: 'wali_kelas',
    title: 'Wali Kelas 3B',
    assignedClassId: 'c-3b',
    subjectTaught: 'sub-ppkn',
    password: 'guru123',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's-1', name: 'Ahmad Fauzi', nisn: '0081234001', gender: 'L', classId: 'c-3a' },
  { id: 's-2', name: 'Budi Santoso', nisn: '0081234002', gender: 'L', classId: 'c-3a' },
  { id: 's-3', name: 'Citra Dewi', nisn: '0081234003', gender: 'P', classId: 'c-3a' },
  { id: 's-4', name: 'Deni Saputra', nisn: '0081234004', gender: 'L', classId: 'c-3a' },
  { id: 's-5', name: 'Eko Prasetyo', nisn: '0081234005', gender: 'L', classId: 'c-3a' },
  { id: 's-6', name: 'Fajar Ramadhan', nisn: '0081234006', gender: 'L', classId: 'c-3a' },
  { id: 's-7', name: 'Gita Permata', nisn: '0081234007', gender: 'P', classId: 'c-3a' },
  { id: 's-8', name: 'Hani Puspita', nisn: '0081234008', gender: 'P', classId: 'c-3a' },
  { id: 's-9', name: 'Iqbal Maulana', nisn: '0081234009', gender: 'L', classId: 'c-3a' },
  { id: 's-10', name: 'Joko Widodo', nisn: '0081234010', gender: 'L', classId: 'c-3a' },
  { id: 's-11', name: 'Kiki Amelia', nisn: '0081234011', gender: 'P', classId: 'c-3a' },
  { id: 's-12', name: 'Lala Safitri', nisn: '0081234012', gender: 'P', classId: 'c-3a' },
  { id: 's-13', name: 'Maya Anggraini', nisn: '0081234013', gender: 'P', classId: 'c-3a' },
  { id: 's-14', name: 'Nanda Pratama', nisn: '0081234014', gender: 'L', classId: 'c-3a' },
  { id: 's-15', name: 'Putri Ayu', nisn: '0081234015', gender: 'P', classId: 'c-3a' },
  { id: 's-16', name: 'Rian Hidayat', nisn: '0081234016', gender: 'L', classId: 'c-3a' },
  { id: 's-17', name: 'Siti Nurhaliza', nisn: '0081234017', gender: 'P', classId: 'c-3a' },
  { id: 's-18', name: 'Taufik Ismail', nisn: '0081234018', gender: 'L', classId: 'c-3a' },
  { id: 's-19', name: 'Vina Panduwinata', nisn: '0081234019', gender: 'P', classId: 'c-3a' },
  { id: 's-20', name: 'Wahyu Setiawan', nisn: '0081234020', gender: 'L', classId: 'c-3a' },
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'c-3a',
    name: 'Kelas 3A',
    gradeLevel: 3,
    academicYear: '2025/2026 Ganjil',
    homeroomTeacher: 'Ibu Ratna Sari, S.Pd.',
    studentIds: INITIAL_STUDENTS.map(s => s.id),
  },
  {
    id: 'c-3b',
    name: 'Kelas 3B',
    gradeLevel: 3,
    academicYear: '2025/2026 Ganjil',
    homeroomTeacher: 'Bapak Hendra Gunawan, S.Pd.',
    studentIds: ['s-1', 's-2', 's-3', 's-4', 's-5', 's-6', 's-7', 's-8'],
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-matematika',
    name: 'Matematika',
    code: 'MTK-03',
    iconName: 'Calculator',
    color: 'blue',
    teacherName: 'Bapak Suryono, M.Pd.',
  },
  {
    id: 'sub-ipa',
    name: 'Ilmu Pengetahuan Alam (IPA)',
    code: 'IPA-03',
    iconName: 'FlaskConical',
    color: 'emerald',
    teacherName: 'Ibu Tri Wahyuni, M.Si.',
  },
  {
    id: 'sub-bindo',
    name: 'Bahasa Indonesia',
    code: 'BIN-03',
    iconName: 'BookOpen',
    color: 'amber',
    teacherName: 'Ibu Ratna Sari, S.Pd.',
  },
  {
    id: 'sub-ppkn',
    name: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
    code: 'PPK-03',
    iconName: 'ShieldCheck',
    color: 'purple',
    teacherName: 'Bapak Bambang Sutrisno, S.Pd.',
  },
];

export const INITIAL_GROUPS: Group[] = [
  // --- KELAS 3A -> MATEMATIKA ---
  {
    id: 'grp-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    name: 'Kelompok 1',
    groupNumber: 1,
    leaderId: 's-1', // Ahmad
    memberIds: ['s-1', 's-2', 's-3', 's-4'], // Ahmad, Budi, Citra, Deni
    notes: 'Kelompok presentasi materi Aljabar dan bangun datar.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'grp-mtk-2',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    name: 'Kelompok 2',
    groupNumber: 2,
    leaderId: 's-5', // Eko
    memberIds: ['s-5', 's-6', 's-7', 's-8'], // Eko, Fajar, Gita, Hani
    notes: 'Kelompok hitung cepat pecahan & perkalian bertingkat.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-10T08:05:00Z',
    updatedAt: '2026-08-10T08:05:00Z',
  },
  {
    id: 'grp-mtk-3',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    name: 'Kelompok 3',
    groupNumber: 3,
    leaderId: 's-9', // Iqbal
    memberIds: ['s-9', 's-10', 's-11', 's-12'], // Iqbal, Joko, Kiki, Lala
    notes: 'Kelompok analisis soal cerita dan data statistika sederhana.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-10T08:10:00Z',
    updatedAt: '2026-08-10T08:10:00Z',
  },
  {
    id: 'grp-mtk-4',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    name: 'Kelompok 4',
    groupNumber: 4,
    leaderId: 's-13', // Maya
    memberIds: ['s-13', 's-14', 's-15', 's-16'], // Maya, Nanda, Putri, Rian
    notes: 'Kelompok peraga manipulatif matematika.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-10T08:15:00Z',
    updatedAt: '2026-08-10T08:15:00Z',
  },
  {
    id: 'grp-mtk-5',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    name: 'Kelompok 5',
    groupNumber: 5,
    leaderId: 's-17', // Siti
    memberIds: ['s-17', 's-18', 's-19', 's-20'], // Siti, Taufik, Vina, Wahyu
    notes: 'Kelompok pemecahan masalah logika numerik.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-10T08:20:00Z',
    updatedAt: '2026-08-10T08:20:00Z',
  },

  // --- KELAS 3A -> IPA (Different groupings as per user specifications!) ---
  {
    id: 'grp-ipa-1',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    name: 'Kelompok 1',
    groupNumber: 1,
    leaderId: 's-1', // Ahmad
    memberIds: ['s-1', 's-5', 's-7', 's-10'], // Ahmad, Eko, Gita, Joko
    notes: 'Praktikum metamorfosis kupu-kupu dan daur hidup serangga.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-12T09:00:00Z',
    updatedAt: '2026-08-12T09:00:00Z',
  },
  {
    id: 'grp-ipa-2',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    name: 'Kelompok 2',
    groupNumber: 2,
    leaderId: 's-2', // Budi
    memberIds: ['s-2', 's-3', 's-6', 's-11'], // Budi, Citra, Fajar, Kiki
    notes: 'Praktikum rantai makanan ekosistem sawah dan hutan.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-12T09:05:00Z',
    updatedAt: '2026-08-12T09:05:00Z',
  },
  {
    id: 'grp-ipa-3',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    name: 'Kelompok 3',
    groupNumber: 3,
    leaderId: 's-4', // Deni
    memberIds: ['s-4', 's-8', 's-9', 's-12'], // Deni, Hani, Iqbal, Lala
    notes: 'Eksperimen fotosintesis dan pertumbuhan kecambah kacang hijau.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-12T09:10:00Z',
    updatedAt: '2026-08-12T09:10:00Z',
  },
  {
    id: 'grp-ipa-4',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    name: 'Kelompok 4',
    groupNumber: 4,
    leaderId: 's-13', // Maya
    memberIds: ['s-13', 's-14', 's-15', 's-16'],
    notes: 'Kajian sifat-sifat benda padat, cair, dan gas.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-12T09:15:00Z',
    updatedAt: '2026-08-12T09:15:00Z',
  },
  {
    id: 'grp-ipa-5',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    name: 'Kelompok 5',
    groupNumber: 5,
    leaderId: 's-17', // Siti
    memberIds: ['s-17', 's-18', 's-19', 's-20'],
    notes: 'Eksplorasi energi alternatif ramah lingkungan.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-12T09:20:00Z',
    updatedAt: '2026-08-12T09:20:00Z',
  },

  // --- KELAS 3A -> BAHASA INDONESIA ---
  {
    id: 'grp-bindo-1',
    classId: 'c-3a',
    subjectId: 'sub-bindo',
    name: 'Kelompok 1',
    groupNumber: 1,
    leaderId: 's-3', // Citra
    memberIds: ['s-1', 's-3', 's-7', 's-11', 's-15'],
    notes: 'Pementasan drama dongeng nusantara.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-14T10:00:00Z',
    updatedAt: '2026-08-14T10:00:00Z',
  },
  {
    id: 'grp-bindo-2',
    classId: 'c-3a',
    subjectId: 'sub-bindo',
    name: 'Kelompok 2',
    groupNumber: 2,
    leaderId: 's-6', // Fajar
    memberIds: ['s-2', 's-6', 's-10', 's-14', 's-18'],
    notes: 'Penulisan majalah dinding & puisi keindahan alam.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-14T10:05:00Z',
    updatedAt: '2026-08-14T10:05:00Z',
  },
  {
    id: 'grp-bindo-3',
    classId: 'c-3a',
    subjectId: 'sub-bindo',
    name: 'Kelompok 3',
    groupNumber: 3,
    leaderId: 's-5', // Eko
    memberIds: ['s-4', 's-5', 's-8', 's-9', 's-12'],
    notes: 'Menyusun laporan wawancara lingkungan sekitar.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-14T10:10:00Z',
    updatedAt: '2026-08-14T10:10:00Z',
  },

  // --- KELAS 3A -> PPKN ---
  {
    id: 'grp-ppkn-1',
    classId: 'c-3a',
    subjectId: 'sub-ppkn',
    name: 'Kelompok Garuda',
    groupNumber: 1,
    leaderId: 's-10', // Joko
    memberIds: ['s-1', 's-2', 's-10', 's-13'],
    notes: 'Studi kasus penerapan Sila Ke-3 dalam gotong royong.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-08-15T11:00:00Z',
  },
  {
    id: 'grp-ppkn-2',
    classId: 'c-3a',
    subjectId: 'sub-ppkn',
    name: 'Kelompok Bhinneka',
    groupNumber: 2,
    leaderId: 's-8', // Hani
    memberIds: ['s-3', 's-8', 's-12', 's-17'],
    notes: 'Kliping keberagaman suku bangsa dan pakaian adat Indonesia.',
    status: 'active',
    academicYear: '2025/2026 Ganjil',
    createdAt: '2026-08-15T11:05:00Z',
    updatedAt: '2026-08-15T11:05:00Z',
  },
  // Archived group example
  {
    id: 'grp-mtk-archive-old',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    name: 'Kelompok Matriks (Semester Lalu)',
    groupNumber: 99,
    leaderId: 's-1',
    memberIds: ['s-1', 's-2', 's-3'],
    notes: 'Kelompok projek akhir tahun pelajaran sebelumnya.',
    status: 'archived',
    academicYear: '2024/2025 Genap',
    createdAt: '2025-05-10T08:00:00Z',
    updatedAt: '2025-06-20T10:00:00Z',
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    title: 'Presentasi Aljabar & Pemecahan Masalah Bilangan',
    description: 'Setiap kelompok menyusun slide/poster presentasi konsep aljabar dasar dan memperagakan pemecahan 3 contoh soal cerita di depan kelas.',
    dueDate: '2026-10-15',
    type: 'group',
    targetGroupIds: ['grp-mtk-1', 'grp-mtk-2', 'grp-mtk-3', 'grp-mtk-4', 'grp-mtk-5'],
    submissionMode: 'single_file_group',
    rubricType: 'presentation',
    maxScore: 100,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'asg-mtk-2',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    title: 'Latihan Mandiri Operasi Perkalian & Pembagian',
    description: 'Kerjakan soal latihan halaman 45 buku paket Matematika 3A di buku tugas masing-masing.',
    dueDate: '2026-10-05',
    type: 'individual',
    maxScore: 100,
    createdAt: '2026-09-05T08:00:00Z',
  },
  {
    id: 'asg-ipa-1',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    title: 'Laporan Pengamatan Rantai Makanan & Ekosistem Sawah',
    description: 'Kumpulkan laporan lengkap hasil pengamatan kelompok berupa dokumen PDF yang memuat diagram rantai makanan dan peran produsen-konsumen-dekomposer.',
    dueDate: '2026-10-12',
    type: 'group',
    targetGroupIds: ['grp-ipa-1', 'grp-ipa-2', 'grp-ipa-3', 'grp-ipa-4', 'grp-ipa-5'],
    submissionMode: 'single_file_group',
    rubricType: 'standard',
    maxScore: 100,
    createdAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'asg-ipa-2',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    title: 'Jurnal Harian Pertumbuhan Biji Kacang Hijau',
    description: 'Setiap siswa mencatat dan mengunggah foto perkembangan pertumbuhan biji kecambah hari ke-1 hingga hari ke-7.',
    dueDate: '2026-10-18',
    type: 'group',
    targetGroupIds: ['grp-ipa-1', 'grp-ipa-2'],
    submissionMode: 'individual_file',
    rubricType: 'standard',
    maxScore: 100,
    createdAt: '2026-09-08T09:00:00Z',
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'subm-1',
    assignmentId: 'asg-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    groupId: 'grp-mtk-1',
    studentId: 's-1', // Ahmad mengunggah untuk Kelompok 1
    submittedForStudentIds: ['s-1', 's-2', 's-3', 's-4'],
    fileName: 'tugas-aljabar-kelompok1.pdf',
    fileSize: '3.4 MB',
    submittedAt: '2026-09-28T14:20:00Z',
    status: 'submitted',
    note: 'Presentasi lengkap beserta 3 studi kasus aljabar sederhana.',
  },
  {
    id: 'subm-2',
    assignmentId: 'asg-ipa-1',
    classId: 'c-3a',
    subjectId: 'sub-ipa',
    groupId: 'grp-ipa-2',
    studentId: 's-2', // Budi mengunggah untuk Kelompok 2
    submittedForStudentIds: ['s-2', 's-3', 's-6', 's-11'],
    fileName: 'laporan-rantai-makanan-kelompok2.pdf',
    fileSize: '2.1 MB',
    submittedAt: '2026-09-27T10:15:00Z',
    status: 'submitted',
    note: 'Laporan praktikum dilengkapi bagan dan foto pengamatan.',
  }
];

export const INITIAL_GRADES: Grade[] = [
  // Contoh nilai kelompok Matematika untuk Kelompok 1
  {
    id: 'grd-1',
    assignmentId: 'asg-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    studentId: 's-1',
    groupId: 'grp-mtk-1',
    score: 90,
    feedback: 'Materi sangat runtut dan kerja sama kompak!',
    gradedAt: '2026-09-28T16:00:00Z',
    gradingMethod: 'group_uniform',
  },
  {
    id: 'grd-2',
    assignmentId: 'asg-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    studentId: 's-2',
    groupId: 'grp-mtk-1',
    score: 90,
    feedback: 'Materi sangat runtut dan kerja sama kompak!',
    gradedAt: '2026-09-28T16:00:00Z',
    gradingMethod: 'group_uniform',
  },
  {
    id: 'grd-3',
    assignmentId: 'asg-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    studentId: 's-3',
    groupId: 'grp-mtk-1',
    score: 90,
    feedback: 'Materi sangat runtut dan kerja sama kompak!',
    gradedAt: '2026-09-28T16:00:00Z',
    gradingMethod: 'group_uniform',
  },
  {
    id: 'grd-4',
    assignmentId: 'asg-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    studentId: 's-4',
    groupId: 'grp-mtk-1',
    score: 90,
    feedback: 'Materi sangat runtut dan kerja sama kompak!',
    gradedAt: '2026-09-28T16:00:00Z',
    gradingMethod: 'group_uniform',
  }
];

export const INITIAL_PRESENTATION_ASSESSMENTS: PresentationAssessment[] = [
  {
    id: 'pa-1',
    assignmentId: 'asg-mtk-1',
    groupId: 'grp-mtk-1',
    classId: 'c-3a',
    subjectId: 'sub-matematika',
    groupCriteria: {
      materialContent: 92,
      presentationMedia: 88,
      teamCollaboration: 90,
    },
    memberCriteria: {
      's-1': {
        mastery: 92,
        delivery: 90,
        confidence: 94,
        qnaHandling: 90,
        notes: 'Sangat percaya diri memimpin alur pembagian presentasi.',
      },
      's-2': {
        mastery: 86,
        delivery: 84,
        confidence: 85,
        qnaHandling: 82,
        notes: 'Penjelasan perhitungan jelas, tingkatkan kontak mata.',
      },
      's-3': {
        mastery: 94,
        delivery: 92,
        confidence: 90,
        qnaHandling: 92,
        notes: 'Mampu menjawab pertanyaan sanggahan dari kelompok lain dengan fasih.',
      },
      's-4': {
        mastery: 88,
        delivery: 88,
        confidence: 86,
        qnaHandling: 85,
        notes: 'Media pendukung dijelaskan dengan baik.',
      },
    },
    overallNotes: 'Penampilan yang sangat baik dari Kelompok 1 untuk materi Aljabar.',
    assessedAt: '2026-09-28T15:45:00Z',
  }
];
