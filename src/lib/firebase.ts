import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';
import {
  TeacherUser,
  Student,
  ClassRoom,
  Subject,
  Group,
  Assignment,
  Submission,
  Grade,
  PresentationAssessment,
} from '../types';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} else {
  app = getApp();
}

// In standard Firestore or named databases (if specified in config)
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const COLLECTIONS = {
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  CLASSES: 'classes',
  SUBJECTS: 'subjects',
  GROUPS: 'groups',
  ASSIGNMENTS: 'assignments',
  SUBMISSIONS: 'submissions',
  GRADES: 'grades',
  PRESENTATION_ASSESSMENTS: 'presentation_assessments',
} as const;

// Initial test connection to validate server connectivity as per Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    }
  }
}
testConnection();

export async function checkFirebaseHealth(): Promise<{ success: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { success: true, message: 'Terhubung ke Firebase Firestore.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('the client is offline')) {
      return { success: false, message: 'Tidak dapat terhubung: client offline / periksa koneksi internet.' };
    }
    // If doc simply doesn't exist or is empty, connection is still healthy
    return { success: true, message: 'Terhubung ke Firebase Firestore.' };
  }
}

export async function dbFetchAllData() {
  try {
    const [
      teachersSnap,
      studentsSnap,
      classesSnap,
      subjectsSnap,
      groupsSnap,
      assignmentsSnap,
      submissionsSnap,
      gradesSnap,
      paSnap,
    ] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.TEACHERS)),
      getDocs(collection(db, COLLECTIONS.STUDENTS)),
      getDocs(collection(db, COLLECTIONS.CLASSES)),
      getDocs(collection(db, COLLECTIONS.SUBJECTS)),
      getDocs(collection(db, COLLECTIONS.GROUPS)),
      getDocs(collection(db, COLLECTIONS.ASSIGNMENTS)),
      getDocs(collection(db, COLLECTIONS.SUBMISSIONS)),
      getDocs(collection(db, COLLECTIONS.GRADES)),
      getDocs(collection(db, COLLECTIONS.PRESENTATION_ASSESSMENTS)),
    ]);

    const teachers = teachersSnap.docs.map(d => d.data() as TeacherUser);
    const students = studentsSnap.docs.map(d => d.data() as Student);
    const classes = classesSnap.docs.map(d => d.data() as ClassRoom);
    const subjects = subjectsSnap.docs.map(d => d.data() as Subject);
    const groups = groupsSnap.docs.map(d => d.data() as Group);
    const assignments = assignmentsSnap.docs.map(d => d.data() as Assignment);
    const submissions = submissionsSnap.docs.map(d => d.data() as Submission);
    const grades = gradesSnap.docs.map(d => d.data() as Grade);
    const presentationAssessments = paSnap.docs.map(d => d.data() as PresentationAssessment);

    const hasData =
      teachers.length > 0 ||
      students.length > 0 ||
      classes.length > 0 ||
      groups.length > 0 ||
      assignments.length > 0;

    return {
      hasData,
      teachers,
      students,
      classes,
      subjects,
      groups,
      assignments,
      submissions,
      grades,
      presentationAssessments,
    };
  } catch (error) {
    console.warn('[Firebase] dbFetchAllData failed:', error);
    throw error;
  }
}

export async function dbSeedInitialData(data: {
  teachers: TeacherUser[];
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  groups: Group[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
  presentationAssessments: PresentationAssessment[];
}) {
  const batch = writeBatch(db);

  data.teachers.forEach(t => {
    batch.set(doc(db, COLLECTIONS.TEACHERS, t.id), t);
  });
  data.students.forEach(s => {
    batch.set(doc(db, COLLECTIONS.STUDENTS, s.id), s);
  });
  data.classes.forEach(c => {
    batch.set(doc(db, COLLECTIONS.CLASSES, c.id), c);
  });
  data.subjects.forEach(sub => {
    batch.set(doc(db, COLLECTIONS.SUBJECTS, sub.id), sub);
  });
  data.groups.forEach(g => {
    batch.set(doc(db, COLLECTIONS.GROUPS, g.id), g);
  });
  data.assignments.forEach(a => {
    batch.set(doc(db, COLLECTIONS.ASSIGNMENTS, a.id), a);
  });
  data.submissions.forEach(subm => {
    batch.set(doc(db, COLLECTIONS.SUBMISSIONS, subm.id), subm);
  });
  data.grades.forEach(grd => {
    batch.set(doc(db, COLLECTIONS.GRADES, grd.id), grd);
  });
  data.presentationAssessments.forEach(pa => {
    batch.set(doc(db, COLLECTIONS.PRESENTATION_ASSESSMENTS, pa.id), pa);
  });

  await batch.commit();
}

// Teacher
export async function dbUpsertTeacher(teacher: TeacherUser) {
  await setDoc(doc(db, COLLECTIONS.TEACHERS, teacher.id), teacher, { merge: true });
}

export async function dbDeleteTeacher(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.TEACHERS, id));
}

// Student
export async function dbUpsertStudent(student: Student) {
  await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student, { merge: true });
}

export async function dbDeleteStudent(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id));
}

export async function dbBulkUpsertStudents(students: Student[]) {
  const batch = writeBatch(db);
  students.forEach(s => {
    batch.set(doc(db, COLLECTIONS.STUDENTS, s.id), s, { merge: true });
  });
  await batch.commit();
}

export async function dbDeleteStudentsByClass(classId: string) {
  const q = query(collection(db, COLLECTIONS.STUDENTS), where('classId', '==', classId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => {
    batch.delete(d.ref);
  });
  await batch.commit();
}

// Class
export async function dbUpsertClass(classItem: ClassRoom) {
  await setDoc(doc(db, COLLECTIONS.CLASSES, classItem.id), classItem, { merge: true });
}

// Subject
export async function dbUpsertSubject(subject: Subject) {
  await setDoc(doc(db, COLLECTIONS.SUBJECTS, subject.id), subject, { merge: true });
}

// Group
export async function dbUpsertGroup(group: Group) {
  await setDoc(doc(db, COLLECTIONS.GROUPS, group.id), group, { merge: true });
}

export async function dbDeleteGroup(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.GROUPS, id));
}

export async function dbBulkUpsertGroups(groupsList: Group[]) {
  const batch = writeBatch(db);
  groupsList.forEach(g => {
    batch.set(doc(db, COLLECTIONS.GROUPS, g.id), g, { merge: true });
  });
  await batch.commit();
}

// Assignment
export async function dbUpsertAssignment(assignment: Assignment) {
  await setDoc(doc(db, COLLECTIONS.ASSIGNMENTS, assignment.id), assignment, { merge: true });
}

export async function dbDeleteAssignment(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.ASSIGNMENTS, id));
}

// Submission
export async function dbUpsertSubmission(submission: Submission) {
  await setDoc(doc(db, COLLECTIONS.SUBMISSIONS, submission.id), submission, { merge: true });
}

// Grade
export async function dbBulkUpsertGrades(gradesList: Grade[]) {
  const batch = writeBatch(db);
  gradesList.forEach(g => {
    batch.set(doc(db, COLLECTIONS.GRADES, g.id), g, { merge: true });
  });
  await batch.commit();
}

// Presentation Assessment
export async function dbUpsertPresentation(assessment: PresentationAssessment) {
  await setDoc(doc(db, COLLECTIONS.PRESENTATION_ASSESSMENTS, assessment.id), assessment, { merge: true });
}
