/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/Navbar';
import { ClassOverview } from './components/ClassOverview';
import { SubjectHeader, SubjectTab } from './components/SubjectHeader';
import { GroupListView } from './components/groups/GroupListView';
import { AssignmentListView } from './components/assignments/AssignmentListView';
import { GradingView } from './components/grading/GradingView';
import { ArchiveView } from './components/archive/ArchiveView';
import { LoginView } from './components/auth/LoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentManagementModal } from './components/students/StudentManagementModal';

const MainLayout: React.FC = () => {
  const { currentUser, setSelectedSubjectId } = useSchool();
  const [currentView, setCurrentView] = useState<'overview' | 'subject'>('subject');
  const [activeTab, setActiveTab] = useState<SubjectTab>('groups');
  const [targetGradingAssignmentId, setTargetGradingAssignmentId] = useState<string | undefined>(undefined);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return <LoginView />;
  }

  const handleSelectSubjectFromOverview = (
    subjectId: string,
    initialTab: SubjectTab = 'groups'
  ) => {
    setSelectedSubjectId(subjectId);
    setActiveTab(initialTab);
    setCurrentView('subject');
  };

  const handleNavigateToGrading = (assignmentId: string) => {
    setTargetGradingAssignmentId(assignmentId);
    setActiveTab('grades');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Bar */}
      <Navbar
        currentView={currentView}
        onNavigateToOverview={() => setCurrentView('overview')}
        onNavigateToSubject={() => setCurrentView('subject')}
        onOpenStudentManagement={() => setIsStudentModalOpen(true)}
      />

      {/* Main Content Area based on User Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 1. ROLE: ADMIN */}
        {currentUser.role === 'admin' && <AdminDashboard />}

        {/* 2. ROLE: SISWA (Strictly locked to their own class) */}
        {currentUser.role === 'siswa' && <StudentDashboard />}

        {/* 3. ROLE: GURU */}
        {currentUser.role === 'guru' && (
          <>
            {currentView === 'overview' ? (
              <ClassOverview
                onSelectSubject={handleSelectSubjectFromOverview}
                onOpenStudentManagement={() => setIsStudentModalOpen(true)}
              />
            ) : (
              <div>
                {/* Subject Tabs and Sub-Header */}
                <SubjectHeader
                  activeTab={activeTab}
                  onTabChange={tab => {
                    setActiveTab(tab);
                    setTargetGradingAssignmentId(undefined);
                  }}
                  onNavigateToOverview={() => setCurrentView('overview')}
                />

                {/* Active Sub-Module View */}
                <div className="mt-6">
                  {activeTab === 'groups' && <GroupListView />}
                  {activeTab === 'assignments' && (
                    <AssignmentListView onNavigateToGrading={handleNavigateToGrading} />
                  )}
                  {activeTab === 'grades' && (
                    <GradingView initialAssignmentId={targetGradingAssignmentId} />
                  )}
                  {activeTab === 'archive' && <ArchiveView />}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Student Management Modal (for Guru quick access) */}
      <StudentManagementModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>KELAS</strong> — Kelompok, Edukasi, Laporan, Aktivitas Siswa.
          </p>
          <p className="text-slate-400">
            Akses Multi-Peran: Administrator (Kelola Akun) • Guru (Tugas & Penilaian) • Siswa (Tugas, Kelompok, & Pengumpulan).
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
