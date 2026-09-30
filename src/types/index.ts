export type UserRole = 'admin' | 'guru' | 'siswa';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  username: string; // NIP, NISN, or 'admin'
  email?: string;
  classId?: string; // Strictly locks student to their own class
  className?: string;
  title?: string;
  subjectTaught?: string;
  avatarSeed?: string;
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  gender: 'L' | 'P';
  classId: string;
  password?: string;
  avatarSeed?: string;
}

export interface TeacherUser {
  id: string;
  name: string;
  nip: string;
  email: string;
  role: 'guru' | 'wali_kelas' | 'kepala_sekolah';
  title: string;
  assignedClassId?: string;
  subjectTaught?: string;
  password?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  homeroomTeacher: string;
  studentIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  iconName: string;
  color: string;
  teacherName: string;
}

export interface Group {
  id: string;
  classId: string;
  subjectId: string;
  name: string;
  groupNumber: number;
  leaderId: string;
  memberIds: string[];
  notes: string;
  status: 'active' | 'archived';
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export type AssignmentType = 'individual' | 'group';
export type SubmissionMode = 'single_file_group' | 'individual_file';
export type RubricType = 'standard' | 'presentation';

export interface Assignment {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  type: AssignmentType;
  targetGroupIds?: string[];
  submissionMode?: SubmissionMode;
  rubricType?: RubricType;
  maxScore: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  classId: string;
  subjectId: string;
  groupId?: string;
  studentId: string; // submitter ID
  submittedForStudentIds?: string[]; // all members covered if single_file_group
  fileName: string;
  fileSize: string;
  fileUrl?: string; // Data URL or downloadable object URL
  fileType?: string; // MIME type e.g. application/pdf, image/png, etc.
  submittedAt: string;
  status: 'submitted' | 'late';
  note?: string;
}

export interface Grade {
  id: string;
  assignmentId: string;
  classId: string;
  subjectId: string;
  studentId: string;
  groupId?: string;
  score: number;
  feedback?: string;
  gradedAt: string;
  gradingMethod: 'group_uniform' | 'individual_specific';
}

export interface MemberPresentationRubric {
  mastery: number; // Penguasaan materi (0-100)
  delivery: number; // Penyampaian (0-100)
  confidence: number; // Kepercayaan diri (0-100)
  qnaHandling: number; // Menjawab pertanyaan (0-100)
  notes?: string;
}

export interface PresentationAssessment {
  id: string;
  assignmentId: string;
  groupId: string;
  classId: string;
  subjectId: string;
  groupCriteria: {
    materialContent: number; // Isi materi (0-100)
    presentationMedia: number; // Media presentasi (0-100)
    teamCollaboration: number; // Kerja sama (0-100)
  };
  memberCriteria: {
    [studentId: string]: MemberPresentationRubric;
  };
  overallNotes?: string;
  assessedAt: string;
}
