import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  UserRole,
  Student,
  TeacherUser,
  ClassRoom,
  Subject,
  Group,
  Assignment,
  Submission,
  Grade,
  PresentationAssessment,
} from '../types';
import {
  INITIAL_ADMIN,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_GROUPS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_GRADES,
  INITIAL_PRESENTATION_ASSESSMENTS,
} from '../data/initialData';
import { storeFileInMemory } from '../utils/fileHelper';
import {
  checkFirebaseHealth,
  dbFetchAllData,
  dbSeedInitialData,
  dbUpsertClass,
  dbUpsertTeacher,
  dbDeleteTeacher,
  dbUpsertStudent,
  dbBulkUpsertStudents,
  dbDeleteStudent,
  dbDeleteStudentsByClass,
  dbUpsertGroup,
  dbBulkUpsertGroups,
  dbDeleteGroup,
  dbUpsertAssignment,
  dbDeleteAssignment,
  dbUpsertSubmission,
  dbBulkUpsertGrades,
  dbUpsertPresentation,
} from '../lib/firebase';

interface SchoolContextType {
  // Firebase Firestore Status & Sync
  databaseStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  isDatabaseOnline: boolean;
  refreshDataFromDatabase: () => Promise<void>;
  supabaseStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  isSupabaseOnline: boolean;
  refreshDataFromSupabase: () => Promise<void>;

  // Auth & Roles
  currentUser: AuthUser | null;
  teachers: TeacherUser[];
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  groups: Group[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
  presentationAssessments: PresentationAssessment[];

  // Active navigation selection
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;

  // Auth methods
  login: (identifier: string, password?: string, roleHint?: UserRole) => { success: boolean; message?: string };
  loginAsRole: (role: UserRole, targetId?: string) => { success: boolean; message?: string };
  logout: () => void;

  // Admin: Teacher Management
  addTeacher: (teacherData: Omit<TeacherUser, 'id'>) => TeacherUser;
  updateTeacher: (teacher: TeacherUser) => void;
  deleteTeacher: (teacherId: string) => void;

  // Admin / Guru: Student Management
  addStudent: (studentData: Omit<Student, 'id'>, targetClassId?: string) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  bulkAddStudents: (studentsList: Omit<Student, 'id'>[], targetClassId: string) => void;
  clearStudentsInClass: (classId: string) => void;

  // Group helpers (Guru & Siswa)
  createGroup: (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => Group;
  registerStudentGroup: (groupData: {
    classId: string;
    subjectId: string;
    name: string;
    leaderId: string;
    memberIds: string[];
    notes?: string;
  }) => Group;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => { success: boolean; message?: string };
  toggleGroupStatus: (groupId: string) => void;
  autoGenerateGroups: (classId: string, subjectId: string, numberOfGroups: number, prefixName?: string) => void;
  getStudentsByClass: (classId: string) => Student[];
  getGroupsBySubject: (classId: string, subjectId: string, includeArchived?: boolean) => Group[];
  getGroupStudentAssignments: (classId: string, subjectId: string) => Map<string, string>; // studentId -> groupId

  // Assignment helpers (Guru)
  createAssignment: (assignmentData: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (assignmentId: string) => void;

  // Submission helpers (Siswa & Guru)
  submitAssignmentWork: (submissionData: {
    assignmentId: string;
    classId: string;
    subjectId: string;
    groupId?: string;
    studentId: string;
    fileName: string;
    fileSize?: string;
    fileUrl?: string;
    fileType?: string;
    note?: string;
  }) => void;

  // Grade helpers (Guru)
  saveGroupUniformGrade: (assignmentId: string, groupId: string, score: number, feedback: string) => void;
  saveIndividualGrade: (assignmentId: string, studentId: string, groupId: string | undefined, score: number, feedback: string) => void;

  // Presentation Assessment helpers (Guru)
  savePresentationAssessment: (assessment: Omit<PresentationAssessment, 'id' | 'assessedAt'>) => void;

  // Utility
  resetAllData: () => void;
}

const LOCAL_STORAGE_KEY_PREFIX = 'kelas_app_v2_';

const safeStorageGet = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn(`[Storage Warning] Failed to parse key "${key}":`, err);
  }
  return fallback;
};

const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    console.warn(`[Storage Warning] Failed to write key "${key}":`, err?.message || err);
    // If quota exceeded, clean up oversized submission fileUrls to free up browser storage quota
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      try {
        const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}submissions`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const sanitized = parsed.map((s: any) => {
            const { fileUrl, ...rest } = s;
            return rest;
          });
          localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}submissions`, JSON.stringify(sanitized));
          // Retry
          localStorage.setItem(key, value);
        }
      } catch (cleanErr) {
        console.warn('Could not auto-clean storage quota:', cleanErr);
      }
    }
  }
};

const safeStorageRemove = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage Warning] Failed to remove key "${key}":`, err);
  }
};

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Teachers list (Admin can add/edit/delete)
  const [teachers, setTeachers] = useState<TeacherUser[]>(() => {
    return safeStorageGet(`${LOCAL_STORAGE_KEY_PREFIX}teachers`, INITIAL_TEACHERS);
  });

  // 2. Classes list
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    return safeStorageGet(`${LOCAL_STORAGE_KEY_PREFIX}classes`, INITIAL_CLASSES);
  });

  // 3. Subjects list
  const [subjects] = useState<Subject[]>(() => {
    return safeStorageGet(`${LOCAL_STORAGE_KEY_PREFIX}subjects`, INITIAL_SUBJECTS);
  });

  // 4. Students list (Admin & Guru can add/edit/delete)
  const [students, setStudents] = useState<Student[]>(() => {
    return safeStorageGet(`${LOCAL_STORAGE_KEY_PREFIX}students`, INITIAL_STUDENTS);
  });

  // 5. Current Authenticated User (Admin / Guru / Siswa)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}currentUser`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      return null;
    }
    // Default logged in as Guru (Ibu Ratna Sari) for smooth first-load experience
    const defaultTeacher = INITIAL_TEACHERS[0];
    return {
      id: defaultTeacher.id,
      name: defaultTeacher.name,
      role: 'guru',
      username: defaultTeacher.nip,
      email: defaultTeacher.email,
      title: defaultTeacher.title,
      classId: defaultTeacher.assignedClassId,
      className: 'Kelas 3A',
      subjectTaught: defaultTeacher.subjectTaught,
    };
  });

  // 6. Groups list
  const [groups, setGroups] = useState<Group[]>(() => {
    return safeStorageGet(`${LOCAL_STORAGE_KEY_PREFIX}groups`, INITIAL_GROUPS);
  });

  // 7. Assignments list
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    return safeStorageGet(`${LOCAL_STORAGE_KEY_PREFIX}assignments`, INITIAL_ASSIGNMENTS);
  });

  // 8. Submissions list
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}submissions`);
      if (saved) {
        const parsed: Submission[] = JSON.parse(saved);
        // Cache any fileUrl in memory to avoid losing access
        parsed.forEach(s => {
          if (s.fileUrl) {
            storeFileInMemory(s.id, s.fileUrl);
          }
        });
        return parsed;
      }
    } catch (e) {
      console.warn('Error loading submissions', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  // 9. Grades list
  const [grades, setGrades] = useState<Grade[]>(() => {
    return safeStorageGet(`${LOCAL_STORAGE_KEY_PREFIX}grades`, INITIAL_GRADES);
  });

  // 10. Presentation Assessments
  const [presentationAssessments, setPresentationAssessments] = useState<PresentationAssessment[]>(() => {
    return safeStorageGet(
      `${LOCAL_STORAGE_KEY_PREFIX}presentationAssessments`,
      INITIAL_PRESENTATION_ASSESSMENTS
    );
  });

  // Database (Firebase Firestore) Connection Status
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected' | 'syncing' | 'error'>('syncing');

  // Firebase Firestore Data Loader
  const refreshDataFromDatabase = async () => {
    setDatabaseStatus('syncing');
    try {
      const data = await dbFetchAllData();
      if (data.hasData) {
        if (data.classes && data.classes.length > 0) setClasses(data.classes);
        if (data.teachers && data.teachers.length > 0) setTeachers(data.teachers);
        if (data.students && data.students.length > 0) setStudents(data.students);
        if (data.groups && data.groups.length > 0) setGroups(data.groups);
        if (data.assignments && data.assignments.length > 0) setAssignments(data.assignments);
        if (data.submissions && data.submissions.length > 0) setSubmissions(data.submissions);
        if (data.grades && data.grades.length > 0) setGrades(data.grades);
        if (data.presentationAssessments && data.presentationAssessments.length > 0) {
          setPresentationAssessments(data.presentationAssessments);
        }
      } else {
        // Initial seeding if Firestore is currently empty
        console.log('[Firebase] First time setup: Seeding initial data to Firestore...');
        await dbSeedInitialData({
          teachers: INITIAL_TEACHERS,
          students: INITIAL_STUDENTS,
          classes: INITIAL_CLASSES,
          subjects: INITIAL_SUBJECTS,
          groups: INITIAL_GROUPS,
          assignments: INITIAL_ASSIGNMENTS,
          submissions: INITIAL_SUBMISSIONS,
          grades: INITIAL_GRADES,
          presentationAssessments: INITIAL_PRESENTATION_ASSESSMENTS,
        });
      }

      setDatabaseStatus('connected');
    } catch (err) {
      console.warn('[Firebase Sync Warning]', err);
      setDatabaseStatus('error');
    }
  };

  // Mount effect: load from Firebase Firestore
  useEffect(() => {
    refreshDataFromDatabase();
  }, []);

  // Navigation State
  const [selectedClassId, setInternalSelectedClassId] = useState<string>(() => {
    if (currentUser?.role === 'siswa' && currentUser.classId) {
      return currentUser.classId;
    }
    return 'c-3a';
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-matematika');

  // Guard selectedClassId: if user is student, STRICTLY lock to their classId
  const setSelectedClassId = (newClassId: string) => {
    if (currentUser?.role === 'siswa' && currentUser.classId) {
      // Siswa cannot view or switch to other classes
      setInternalSelectedClassId(currentUser.classId);
      return;
    }
    setInternalSelectedClassId(newClassId);
  };

  // Sync selectedClassId whenever currentUser changes
  useEffect(() => {
    if (currentUser?.role === 'siswa' && currentUser.classId) {
      setInternalSelectedClassId(currentUser.classId);
    }
  }, [currentUser]);

  // Persistence effects with quota protection
  useEffect(() => {
    if (currentUser) {
      safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}currentUser`, JSON.stringify(currentUser));
    } else {
      safeStorageRemove(`${LOCAL_STORAGE_KEY_PREFIX}currentUser`);
    }
  }, [currentUser]);

  useEffect(() => {
    safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}teachers`, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}classes`, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}groups`, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}assignments`, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    // Strip large fileUrl (anything > 10KB) from localStorage to stay strictly below 5MB browser quota
    const lightweightSubmissions = submissions.map(sub => {
      if (sub.fileUrl && sub.fileUrl.length > 10000) {
        storeFileInMemory(sub.id, sub.fileUrl);
        const { fileUrl, ...rest } = sub;
        return rest;
      }
      return sub;
    });

    safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}submissions`, JSON.stringify(lightweightSubmissions));
  }, [submissions]);

  useEffect(() => {
    safeStorageSet(`${LOCAL_STORAGE_KEY_PREFIX}grades`, JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    safeStorageSet(
      `${LOCAL_STORAGE_KEY_PREFIX}presentationAssessments`,
      JSON.stringify(presentationAssessments)
    );
  }, [presentationAssessments]);

  // Auth methods
  const login = (
    identifier: string,
    password?: string,
    roleHint?: UserRole
  ): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, message: 'Harap masukkan Username, NIP, atau NISN.' };
    }

    // 1. Check Admin
    if (roleHint === 'admin' || cleanId === 'admin' || cleanId === 'admin@sekolah.id') {
      if (password && password.trim() && password.trim() !== 'admin123' && password.trim() !== 'admin') {
        return { success: false, message: 'Kata sandi admin tidak sesuai. (Demo: admin123)' };
      }
      setCurrentUser(INITIAL_ADMIN);
      return { success: true };
    }

    // 2. Check Teacher (Guru)
    if (roleHint === 'guru' || !roleHint) {
      const foundTeacher = teachers.find(
        t =>
          t.nip === cleanId ||
          t.email.toLowerCase() === cleanId ||
          t.name.toLowerCase().includes(cleanId)
      );

      if (foundTeacher) {
        if (password && foundTeacher.password && password.trim() !== foundTeacher.password) {
          return { success: false, message: 'Kata sandi guru tidak sesuai.' };
        }

        const teacherClass = classes.find(c => c.id === foundTeacher.assignedClassId);
        const authUser: AuthUser = {
          id: foundTeacher.id,
          name: foundTeacher.name,
          role: 'guru',
          username: foundTeacher.nip,
          email: foundTeacher.email,
          title: foundTeacher.title,
          classId: foundTeacher.assignedClassId,
          className: teacherClass ? teacherClass.name : 'Kelas 3A',
          subjectTaught: foundTeacher.subjectTaught,
        };

        setCurrentUser(authUser);
        if (foundTeacher.assignedClassId) {
          setInternalSelectedClassId(foundTeacher.assignedClassId);
        }
        if (foundTeacher.subjectTaught) {
          setSelectedSubjectId(foundTeacher.subjectTaught);
        }
        return { success: true };
      }
    }

    // 3. Check Student (Siswa)
    if (roleHint === 'siswa' || !roleHint) {
      const foundStudent = students.find(
        s =>
          s.nisn === cleanId ||
          s.id.toLowerCase() === cleanId ||
          s.name.toLowerCase().includes(cleanId)
      );

      if (foundStudent) {
        if (password && foundStudent.password && password.trim() !== foundStudent.password) {
          return { success: false, message: 'Kata sandi siswa tidak sesuai.' };
        }

        const studentClass = classes.find(c => c.id === foundStudent.classId);
        const authUser: AuthUser = {
          id: foundStudent.id,
          name: foundStudent.name,
          role: 'siswa',
          username: foundStudent.nisn,
          classId: foundStudent.classId,
          className: studentClass ? studentClass.name : 'Kelas Siswa',
          title: `Peserta Didik ${studentClass ? studentClass.name : ''}`,
        };

        setCurrentUser(authUser);
        setInternalSelectedClassId(foundStudent.classId); // Strictly locked
        return { success: true };
      }
    }

    return {
      success: false,
      message: 'Akun tidak ditemukan. Pastikan NIP / NISN terdaftar di sistem atau gunakan tombol Masuk Cepat Demo.',
    };
  };

  const loginAsRole = (role: UserRole, targetId?: string): { success: boolean; message?: string } => {
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
      return { success: true };
    }

    if (role === 'guru') {
      const teacher = targetId
        ? teachers.find(t => t.id === targetId || t.nip === targetId)
        : teachers[0];
      if (teacher) {
        const teacherClass = classes.find(c => c.id === teacher.assignedClassId);
        setCurrentUser({
          id: teacher.id,
          name: teacher.name,
          role: 'guru',
          username: teacher.nip,
          email: teacher.email,
          title: teacher.title,
          classId: teacher.assignedClassId,
          className: teacherClass ? teacherClass.name : 'Kelas 3A',
          subjectTaught: teacher.subjectTaught,
        });
        if (teacher.assignedClassId) {
          setInternalSelectedClassId(teacher.assignedClassId);
        }
        if (teacher.subjectTaught) {
          setSelectedSubjectId(teacher.subjectTaught);
        }
        return { success: true };
      }
    }

    if (role === 'siswa') {
      const student = targetId
        ? students.find(s => s.id === targetId || s.nisn === targetId)
        : students[0];
      if (student) {
        const studentClass = classes.find(c => c.id === student.classId);
        setCurrentUser({
          id: student.id,
          name: student.name,
          role: 'siswa',
          username: student.nisn,
          classId: student.classId,
          className: studentClass ? studentClass.name : 'Kelas Siswa',
          title: `Peserta Didik ${studentClass ? studentClass.name : ''}`,
        });
        setInternalSelectedClassId(student.classId);
        return { success: true };
      }
    }

    return { success: false, message: 'Gagal login ke peran tersebut.' };
  };

  const logout = () => {
    try {
      safeStorageRemove(`${LOCAL_STORAGE_KEY_PREFIX}currentUser`);
    } catch (err) {
      console.warn('[Logout Safe Notice]', err);
    }
    setCurrentUser(null);
  };

  // ADMIN: Teacher Management
  const addTeacher = (teacherData: Omit<TeacherUser, 'id'>): TeacherUser => {
    const newTeacher: TeacherUser = {
      ...teacherData,
      id: `tch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      password: teacherData.password || 'guru123',
    };
    setTeachers(prev => [newTeacher, ...prev]);
    dbUpsertTeacher(newTeacher).catch(err => console.warn('[Firebase] addTeacher err', err));
    return newTeacher;
  };

  const updateTeacher = (updated: TeacherUser) => {
    setTeachers(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(prev => (prev ? { ...prev, name: updated.name, email: updated.email, title: updated.title } : null));
    }
    dbUpsertTeacher(updated).catch(err => console.warn('[Firebase] updateTeacher err', err));
  };

  const deleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    dbDeleteTeacher(teacherId).catch(err => console.warn('[Firebase] deleteTeacher err', err));
  };

  // ADMIN & GURU: Student Management
  const addStudent = (studentData: Omit<Student, 'id'>, targetClassId?: string): Student => {
    const targetClass = targetClassId || studentData.classId || selectedClassId;
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId: targetClass,
      password: studentData.password || 'siswa123',
    };

    setStudents(prev => [...prev, newStudent]);

    setClasses(prev =>
      prev.map(c => {
        if (c.id === targetClass && !c.studentIds.includes(newStudent.id)) {
          const updated = {
            ...c,
            studentIds: [...c.studentIds, newStudent.id],
          };
          dbUpsertClass(updated).catch(() => {});
          return updated;
        }
        return c;
      })
    );

    dbUpsertStudent(newStudent).catch(err => console.warn('[Firebase] addStudent err', err));
    return newStudent;
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => (s.id === updatedStudent.id ? updatedStudent : s)));
    // If student changed class, sync class studentIds
    setClasses(prev =>
      prev.map(c => {
        const has = c.studentIds.includes(updatedStudent.id);
        if (c.id === updatedStudent.classId && !has) {
          const updated = { ...c, studentIds: [...c.studentIds, updatedStudent.id] };
          dbUpsertClass(updated).catch(() => {});
          return updated;
        }
        if (c.id !== updatedStudent.classId && has) {
          const updated = { ...c, studentIds: c.studentIds.filter(id => id !== updatedStudent.id) };
          dbUpsertClass(updated).catch(() => {});
          return updated;
        }
        return c;
      })
    );
    dbUpsertStudent(updatedStudent).catch(err => console.warn('[Firebase] updateStudent err', err));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setClasses(prev =>
      prev.map(c => {
        const updated = {
          ...c,
          studentIds: c.studentIds.filter(id => id !== studentId),
        };
        dbUpsertClass(updated).catch(() => {});
        return updated;
      })
    );
    // Remove from groups
    setGroups(prev =>
      prev.map(g => {
        const updated = {
          ...g,
          memberIds: g.memberIds.filter(m => m !== studentId),
          leaderId: g.leaderId === studentId ? (g.memberIds[0] || '') : g.leaderId,
        };
        dbUpsertGroup(updated).catch(() => {});
        return updated;
      })
    );
    dbDeleteStudent(studentId).catch(err => console.warn('[Firebase] deleteStudent err', err));
  };

  const bulkAddStudents = (studentsList: Omit<Student, 'id'>[], targetClassId: string) => {
    const targetClass = targetClassId || selectedClassId;
    const createdList: Student[] = studentsList.map((st, index) => ({
      ...st,
      id: `s-bulk-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
      classId: targetClass,
      password: st.password || 'siswa123',
    }));

    setStudents(prev => [...prev, ...createdList]);

    setClasses(prev =>
      prev.map(c => {
        if (c.id === targetClass) {
          const newIds = createdList.map(s => s.id);
          const updated = {
            ...c,
            studentIds: Array.from(new Set([...c.studentIds, ...newIds])),
          };
          dbUpsertClass(updated).catch(() => {});
          return updated;
        }
        return c;
      })
    );

    dbBulkUpsertStudents(createdList).catch(err => console.warn('[Firebase] bulkAddStudents err', err));
  };

  const clearStudentsInClass = (classId: string) => {
    setStudents(prev => prev.filter(s => s.classId !== classId));
    setClasses(prev =>
      prev.map(c => {
        if (c.id === classId) {
          const updated = { ...c, studentIds: [] };
          dbUpsertClass(updated).catch(() => {});
          return updated;
        }
        return c;
      })
    );
    dbDeleteStudentsByClass(classId).catch(err => console.warn('[Firebase] clearStudents err', err));
  };

  // Group helpers
  const createGroup = (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Group => {
    const now = new Date().toISOString();
    const newGroup: Group = {
      ...groupData,
      id: `grp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setGroups(prev => [...prev, newGroup]);
    dbUpsertGroup(newGroup).catch(err => console.warn('[Firebase Sync] createGroup:', err));
    return newGroup;
  };

  // Special helper for Siswa to register/form group
  const registerStudentGroup = (groupData: {
    classId: string;
    subjectId: string;
    name: string;
    leaderId: string;
    memberIds: string[];
    notes?: string;
  }): Group => {
    const existingSubjectGroups = groups.filter(
      g => g.classId === groupData.classId && g.subjectId === groupData.subjectId
    );
    const nextGroupNumber = existingSubjectGroups.length + 1;
    const now = new Date().toISOString();

    const newGroup: Group = {
      id: `grp-stu-${Date.now()}`,
      classId: groupData.classId,
      subjectId: groupData.subjectId,
      name: groupData.name.trim() || `Kelompok ${nextGroupNumber}`,
      groupNumber: nextGroupNumber,
      leaderId: groupData.leaderId || groupData.memberIds[0] || '',
      memberIds: groupData.memberIds,
      notes: groupData.notes || 'Kelompok dibentuk mandiri oleh siswa untuk penugasan.',
      status: 'active',
      academicYear: '2025/2026 Ganjil',
      createdAt: now,
      updatedAt: now,
    };

    setGroups(prev => [...prev, newGroup]);
    dbUpsertGroup(newGroup).catch(err => console.warn('[Firebase Sync] registerStudentGroup:', err));
    return newGroup;
  };

  const updateGroup = (updatedGroup: Group) => {
    const withTimestamp: Group = {
      ...updatedGroup,
      updatedAt: new Date().toISOString(),
    };
    setGroups(prev => prev.map(g => (g.id === updatedGroup.id ? withTimestamp : g)));
    dbUpsertGroup(withTimestamp).catch(err => console.warn('[Firebase Sync] updateGroup:', err));
  };

  const deleteGroup = (groupId: string): { success: boolean; message?: string } => {
    const groupToDelete = groups.find(g => g.id === groupId);
    if (!groupToDelete) return { success: false, message: 'Kelompok tidak ditemukan.' };

    const hasSubmission = submissions.some(s => s.groupId === groupId);
    const hasGrades = grades.some(g => g.groupId === groupId);

    if (hasSubmission || hasGrades) {
      const now = new Date().toISOString();
      setGroups(prev =>
        prev.map(g => {
          if (g.id === groupId) {
            const up: Group = { ...g, status: 'archived', updatedAt: now };
            dbUpsertGroup(up).catch(() => {});
            return up;
          }
          return g;
        })
      );
      return {
        success: true,
        message: 'Kelompok telah memiliki data tugas/nilai. Status diubah menjadi "Arsip" untuk menjaga riwayat nilai.',
      };
    }

    setGroups(prev => prev.filter(g => g.id !== groupId));
    dbDeleteGroup(groupId).catch(err => console.warn('[Firebase Sync] deleteGroup:', err));
    return { success: true, message: 'Kelompok berhasil dihapus secara permanen.' };
  };

  const toggleGroupStatus = (groupId: string) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          const nextStatus = g.status === 'active' ? 'archived' : 'active';
          const up: Group = { ...g, status: nextStatus, updatedAt: new Date().toISOString() };
          dbUpsertGroup(up).catch(() => {});
          return up;
        }
        return g;
      })
    );
  };

  const autoGenerateGroups = (
    classId: string,
    subjectId: string,
    numberOfGroups: number,
    prefixName: string = 'Kelompok'
  ) => {
    const classStudents = getStudentsByClass(classId);
    if (classStudents.length === 0 || numberOfGroups <= 0) return;

    // Archive current active groups in this subject
    setGroups(prev =>
      prev.map(g => {
        if (g.classId === classId && g.subjectId === subjectId && g.status === 'active') {
          const up: Group = { ...g, status: 'archived', updatedAt: new Date().toISOString() };
          dbUpsertGroup(up).catch(() => {});
          return up;
        }
        return g;
      })
    );

    // Shuffle students randomly
    const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
    const createdGroups: Group[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < numberOfGroups; i++) {
      createdGroups.push({
        id: `grp-auto-${Date.now()}-${i + 1}`,
        classId,
        subjectId,
        name: `${prefixName} ${i + 1}`,
        groupNumber: i + 1,
        leaderId: '',
        memberIds: [],
        notes: `Dibuat otomatis oleh sistem (${classStudents.length} siswa dibagi ${numberOfGroups} kelompok).`,
        status: 'active',
        academicYear: '2025/2026 Ganjil',
        createdAt: now,
        updatedAt: now,
      });
    }

    // Distribute students round-robin
    shuffled.forEach((student, index) => {
      const groupIndex = index % numberOfGroups;
      createdGroups[groupIndex].memberIds.push(student.id);
    });

    // Set first member as leader for each group
    createdGroups.forEach(g => {
      if (g.memberIds.length > 0) {
        g.leaderId = g.memberIds[0];
      }
    });

    setGroups(prev => [...prev, ...createdGroups]);
    dbBulkUpsertGroups(createdGroups).catch(err => console.warn('[Firebase Sync] autoGenerateGroups:', err));
  };

  const getStudentsByClass = (classId: string): Student[] => {
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return [];
    return students.filter(s => classItem.studentIds.includes(s.id));
  };

  const getGroupsBySubject = (classId: string, subjectId: string, includeArchived = false): Group[] => {
    return groups.filter(g => {
      if (g.classId !== classId || g.subjectId !== subjectId) return false;
      if (!includeArchived && g.status === 'archived') return false;
      return true;
    }).sort((a, b) => a.groupNumber - b.groupNumber);
  };

  const getGroupStudentAssignments = (classId: string, subjectId: string): Map<string, string> => {
    const map = new Map<string, string>();
    const activeGroups = groups.filter(
      g => g.classId === classId && g.subjectId === subjectId && g.status === 'active'
    );
    activeGroups.forEach(g => {
      g.memberIds.forEach(mId => {
        map.set(mId, g.name);
      });
    });
    return map;
  };

  // Assignment methods
  const createAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt'>): Assignment => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAssignments(prev => [newAssignment, ...prev]);
    dbUpsertAssignment(newAssignment).catch(err => console.warn('[Firebase Sync] createAssignment:', err));
    return newAssignment;
  };

  const updateAssignment = (updated: Assignment) => {
    setAssignments(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    dbUpsertAssignment(updated).catch(err => console.warn('[Firebase Sync] updateAssignment:', err));
  };

  const deleteAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    dbDeleteAssignment(assignmentId).catch(err => console.warn('[Firebase Sync] deleteAssignment:', err));
  };

  // Submission method
  const submitAssignmentWork = (submissionData: {
    assignmentId: string;
    classId: string;
    subjectId: string;
    groupId?: string;
    studentId: string;
    fileName: string;
    fileSize?: string;
    fileUrl?: string;
    fileType?: string;
    note?: string;
  }) => {
    const asg = assignments.find(a => a.id === submissionData.assignmentId);
    let coveredStudentIds: string[] = [submissionData.studentId];

    if (submissionData.groupId && asg?.submissionMode === 'single_file_group') {
      const group = groups.find(g => g.id === submissionData.groupId);
      if (group && group.memberIds.length > 0) {
        coveredStudentIds = [...group.memberIds];
      }
    }

    const newSubmission: Submission = {
      id: `subm-${Date.now()}`,
      assignmentId: submissionData.assignmentId,
      classId: submissionData.classId,
      subjectId: submissionData.subjectId,
      groupId: submissionData.groupId,
      studentId: submissionData.studentId,
      submittedForStudentIds: coveredStudentIds,
      fileName: submissionData.fileName,
      fileSize: submissionData.fileSize || `${(Math.random() * 1.5 + 0.8).toFixed(1)} MB`,
      fileUrl: submissionData.fileUrl,
      fileType: submissionData.fileType,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      note: submissionData.note,
    };

    if (submissionData.fileUrl) {
      storeFileInMemory(newSubmission.id, submissionData.fileUrl);
    }

    setSubmissions(prev => {
      // Remove any prior submission for this assignment by this student/group
      const remaining = prev.filter(s => {
        if (s.assignmentId !== submissionData.assignmentId) return true;
        if (submissionData.groupId && s.groupId === submissionData.groupId) return false;
        if (s.studentId === submissionData.studentId) return false;
        return true;
      });
      return [newSubmission, ...remaining];
    });

    dbUpsertSubmission(newSubmission).catch(err => console.warn('[Firebase Sync] submitAssignmentWork:', err));
  };

  // Grade methods
  const saveGroupUniformGrade = (
    assignmentId: string,
    groupId: string,
    score: number,
    feedback: string
  ) => {
    const group = groups.find(g => g.id === groupId);
    const asg = assignments.find(a => a.id === assignmentId);
    if (!group || !asg) return;

    const now = new Date().toISOString();
    const newGrades: Grade[] = group.memberIds.map(mId => ({
      id: `grd-${Date.now()}-${mId}`,
      assignmentId,
      classId: asg.classId,
      subjectId: asg.subjectId,
      studentId: mId,
      groupId,
      score,
      feedback: feedback || `Nilai Kelompok (${group.name})`,
      gradedAt: now,
      gradingMethod: 'group_uniform',
    }));

    setGrades(prev => {
      const remaining = prev.filter(
        g => !(g.assignmentId === assignmentId && g.groupId === groupId)
      );
      return [...newGrades, ...remaining];
    });

    dbBulkUpsertGrades(newGrades).catch(err => console.warn('[Firebase Sync] saveGroupUniformGrade:', err));
  };

  const saveIndividualGrade = (
    assignmentId: string,
    studentId: string,
    groupId: string | undefined,
    score: number,
    feedback: string
  ) => {
    const asg = assignments.find(a => a.id === assignmentId);
    if (!asg) return;

    const newGrade: Grade = {
      id: `grd-${Date.now()}-${studentId}`,
      assignmentId,
      classId: asg.classId,
      subjectId: asg.subjectId,
      studentId,
      groupId,
      score,
      feedback,
      gradedAt: new Date().toISOString(),
      gradingMethod: 'individual_specific',
    };

    setGrades(prev => {
      const remaining = prev.filter(
        g => !(g.assignmentId === assignmentId && g.studentId === studentId)
      );
      return [newGrade, ...remaining];
    });

    dbBulkUpsertGrades([newGrade]).catch(err => console.warn('[Firebase Sync] saveIndividualGrade:', err));
  };

  // Presentation assessment rubric
  const savePresentationAssessment = (assessment: Omit<PresentationAssessment, 'id' | 'assessedAt'>) => {
    const newAssessment: PresentationAssessment = {
      ...assessment,
      id: `pa-${Date.now()}`,
      assessedAt: new Date().toISOString(),
    };

    setPresentationAssessments(prev => {
      const filtered = prev.filter(
        pa => !(pa.assignmentId === assessment.assignmentId && pa.groupId === assessment.groupId)
      );
      return [newAssessment, ...filtered];
    });

    const { groupCriteria, memberCriteria, assignmentId, groupId, classId, subjectId } = assessment;
    const groupAvg =
      (groupCriteria.materialContent + groupCriteria.presentationMedia + groupCriteria.teamCollaboration) / 3;

    const updatedGrades: Grade[] = [];
    const now = new Date().toISOString();

    Object.entries(memberCriteria).forEach(([studentId, scores]) => {
      const indivAvg = (scores.mastery + scores.delivery + scores.confidence + scores.qnaHandling) / 4;
      const combinedScore = Math.round(groupAvg * 0.4 + indivAvg * 0.6);
      const studentFeedback = `Nilai Presentasi: Kelompok (${Math.round(groupAvg)}) + Individu (${Math.round(indivAvg)}). Catatan: ${scores.notes || 'Penampilan presentasi terdata.'}`;

      updatedGrades.push({
        id: `grd-pa-${Date.now()}-${studentId}`,
        assignmentId,
        classId,
        subjectId,
        studentId,
        groupId,
        score: combinedScore,
        feedback: studentFeedback,
        gradedAt: now,
        gradingMethod: 'individual_specific',
      });
    });

    setGrades(prev => {
      const studentIds = Object.keys(memberCriteria);
      const remaining = prev.filter(
        g => !(g.assignmentId === assignmentId && studentIds.includes(g.studentId))
      );
      return [...updatedGrades, ...remaining];
    });

    dbUpsertPresentation(newAssessment).catch(err => console.warn('[Firebase Sync] savePresentationAssessment:', err));
    dbBulkUpsertGrades(updatedGrades).catch(err => console.warn('[Firebase Sync] presentation grades:', err));
  };

  const resetAllData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}teachers`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}students`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}classes`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}groups`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}assignments`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}submissions`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}grades`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}presentationAssessments`);

    setTeachers(INITIAL_TEACHERS);
    setStudents(INITIAL_STUDENTS);
    setClasses(INITIAL_CLASSES);
    setGroups(INITIAL_GROUPS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setGrades(INITIAL_GRADES);
    setPresentationAssessments(INITIAL_PRESENTATION_ASSESSMENTS);
    setInternalSelectedClassId('c-3a');
    setSelectedSubjectId('sub-matematika');
  };

  return (
    <SchoolContext.Provider
      value={{
        databaseStatus,
        isDatabaseOnline: databaseStatus === 'connected',
        refreshDataFromDatabase,
        supabaseStatus: databaseStatus,
        isSupabaseOnline: databaseStatus === 'connected',
        refreshDataFromSupabase: refreshDataFromDatabase,
        currentUser,
        teachers,
        students,
        classes,
        subjects,
        groups,
        assignments,
        submissions,
        grades,
        presentationAssessments,
        selectedClassId,
        setSelectedClassId,
        selectedSubjectId,
        setSelectedSubjectId,
        login,
        loginAsRole,
        logout,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkAddStudents,
        clearStudentsInClass,
        createGroup,
        registerStudentGroup,
        updateGroup,
        deleteGroup,
        toggleGroupStatus,
        autoGenerateGroups,
        getStudentsByClass,
        getGroupsBySubject,
        getGroupStudentAssignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignmentWork,
        saveGroupUniformGrade,
        saveIndividualGrade,
        savePresentationAssessment,
        resetAllData,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
