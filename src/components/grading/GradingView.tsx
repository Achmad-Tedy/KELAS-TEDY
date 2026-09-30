import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Assignment, Group, Student, MemberPresentationRubric, Submission } from '../../types';
import {
  Award,
  Users,
  User,
  CheckCircle2,
  Save,
  Mic,
  Sliders,
  ChevronDown,
  Sparkles,
  FileCheck,
  TrendingUp,
  HelpCircle,
  Download,
  Paperclip,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { triggerFileDownload } from '../../utils/fileHelper';

interface GradingViewProps {
  initialAssignmentId?: string;
}

export const GradingView: React.FC<GradingViewProps> = ({ initialAssignmentId }) => {
  const {
    selectedClassId,
    selectedSubjectId,
    classes,
    subjects,
    students,
    groups,
    assignments,
    submissions,
    grades,
    presentationAssessments,
    saveGroupUniformGrade,
    saveIndividualGrade,
    savePresentationAssessment,
  } = useSchool();

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Assignments in current subject
  const subjectAssignments = assignments.filter(
    a => a.classId === selectedClassId && a.subjectId === selectedSubjectId
  );

  const [selectedAsgId, setSelectedAsgId] = useState<string>(
    initialAssignmentId || subjectAssignments[0]?.id || ''
  );

  const selectedAssignment = subjectAssignments.find(a => a.id === selectedAsgId) || subjectAssignments[0];

  // Active groups for this class & subject
  const activeGroups = groups.filter(
    g => g.classId === selectedClassId && g.subjectId === selectedSubjectId && g.status === 'active'
  );

  // Sub-tabs: 'standard' | 'presentation'
  const [activeGradingTab, setActiveGradingTab] = useState<'standard' | 'presentation'>(
    selectedAssignment?.rubricType === 'presentation' ? 'presentation' : 'standard'
  );

  useEffect(() => {
    if (selectedAssignment) {
      if (selectedAssignment.rubricType === 'presentation') {
        setActiveGradingTab('presentation');
      } else {
        setActiveGradingTab('standard');
      }
    }
  }, [selectedAssignment?.id]);

  // STANDARD GRADING STATES
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [gradingType, setGradingType] = useState<'group_uniform' | 'individual_specific'>('group_uniform');
  const [uniformScore, setUniformScore] = useState<number>(85);
  const [uniformFeedback, setUniformFeedback] = useState<string>('');
  const [individualScores, setIndividualScores] = useState<{ [studentId: string]: number }>({});
  const [individualFeedbacks, setIndividualFeedbacks] = useState<{ [studentId: string]: string }>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // PRESENTATION RUBRIC STATES
  const [presentationGroupId, setPresentationGroupId] = useState<string>('');
  const [matContent, setMatContent] = useState<number>(85); // Isi materi
  const [presMedia, setPresMedia] = useState<number>(85); // Media
  const [teamCollab, setTeamCollab] = useState<number>(90); // Kerja sama
  const [overallPresNotes, setOverallPresNotes] = useState<string>('');
  const [memberRubrics, setMemberRubrics] = useState<{
    [studentId: string]: MemberPresentationRubric;
  }>({});

  // Sync selected group for standard grading
  useEffect(() => {
    if (activeGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(activeGroups[0].id);
    }
    if (activeGroups.length > 0 && !presentationGroupId) {
      setPresentationGroupId(activeGroups[0].id);
    }
  }, [activeGroups.length]);

  // Load existing grades when group or assignment changes in standard grading
  const currentGradingGroup = activeGroups.find(g => g.id === selectedGroupId);

  useEffect(() => {
    if (currentGradingGroup && selectedAssignment) {
      const scoresMap: { [id: string]: number } = {};
      const feedbackMap: { [id: string]: string } = {};

      currentGradingGroup.memberIds.forEach(id => {
        const existingGrade = grades.find(
          gr => gr.assignmentId === selectedAssignment.id && gr.studentId === id
        );
        scoresMap[id] = existingGrade?.score ?? 80;
        feedbackMap[id] = existingGrade?.feedback ?? '';
      });

      setIndividualScores(scoresMap);
      setIndividualFeedbacks(feedbackMap);
    }
  }, [selectedGroupId, selectedAssignment?.id]);

  // Load existing presentation assessment when presentation group changes
  const currentPresentationGroup = activeGroups.find(g => g.id === presentationGroupId);

  useEffect(() => {
    if (currentPresentationGroup && selectedAssignment) {
      const existingPA = presentationAssessments.find(
        pa => pa.assignmentId === selectedAssignment.id && pa.groupId === currentPresentationGroup.id
      );

      if (existingPA) {
        setMatContent(existingPA.groupCriteria.materialContent);
        setPresMedia(existingPA.groupCriteria.presentationMedia);
        setTeamCollab(existingPA.groupCriteria.teamCollaboration);
        setOverallPresNotes(existingPA.overallNotes || '');
        setMemberRubrics(existingPA.memberCriteria || {});
      } else {
        setMatContent(85);
        setPresMedia(85);
        setTeamCollab(88);
        setOverallPresNotes('');

        const initialMembers: { [id: string]: MemberPresentationRubric } = {};
        currentPresentationGroup.memberIds.forEach(id => {
          initialMembers[id] = {
            mastery: 85,
            delivery: 85,
            confidence: 85,
            qnaHandling: 85,
            notes: '',
          };
        });
        setMemberRubrics(initialMembers);
      }
    }
  }, [presentationGroupId, selectedAssignment?.id]);

  if (!selectedAssignment) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
        <Award className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Belum Ada Tugas Untuk Dinilai</h3>
        <p className="text-xs text-slate-500 mt-1">
          Buat tugas terlebih dahulu di menu 📝 Tugas agar Anda dapat menilai kelompok atau siswa.
        </p>
      </div>
    );
  }

  // Handle saving Standard Grade
  const handleSaveStandardGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGradingGroup) return;

    if (gradingType === 'group_uniform') {
      saveGroupUniformGrade(
        selectedAssignment.id,
        currentGradingGroup.id,
        uniformScore,
        uniformFeedback || 'Nilai kelompok seragam.'
      );
    } else {
      currentGradingGroup.memberIds.forEach(id => {
        const score = individualScores[id] ?? 80;
        const fb = individualFeedbacks[id] ?? '';
        saveIndividualGrade(selectedAssignment.id, id, currentGradingGroup.id, score, fb);
      });
    }

    setSaveSuccessMsg(`Nilai untuk ${currentGradingGroup.name} berhasil disimpan!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Handle saving Presentation Rubric
  const handleSavePresentationRubric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPresentationGroup) return;

    savePresentationAssessment({
      assignmentId: selectedAssignment.id,
      groupId: currentPresentationGroup.id,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      groupCriteria: {
        materialContent: Number(matContent),
        presentationMedia: Number(presMedia),
        teamCollaboration: Number(teamCollab),
      },
      memberCriteria: memberRubrics,
      overallNotes: overallPresNotes,
    });

    setSaveSuccessMsg(`Rubrik penilaian presentasi untuk ${currentPresentationGroup.name} berhasil disimpan! Nilai akhir otomatis dihitung.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pilih Tugas Yang Dinilai
            </span>
            <select
              value={selectedAsgId}
              onChange={e => setSelectedAsgId(e.target.value)}
              className="mt-0.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjectAssignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.type === 'group' ? 'Kelompok' : 'Individu'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab switch between Standard vs Presentation Rubric */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveGradingTab('presentation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeGradingTab === 'presentation'
                ? 'bg-white text-purple-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-purple-600" />
            <span>Rubrik Presentasi Kelompok</span>
          </button>
          <button
            onClick={() => setActiveGradingTab('standard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeGradingTab === 'standard'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Penilaian Biasa (Kelompok / Individu)</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PRESENTATION ASSESSMENT RUBRIC (INTEGRASI PENILAIAN PRESENTER)        */}
      {/* ========================================================================= */}
      {activeGradingTab === 'presentation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Modul Presenter Kelompok
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Pilih Kelompok Yang Maju Presentasi:
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Anggota kelompok otomatis muncul. Guru memberikan nilai kolektif (materi, media, kerja sama) serta skor kemampuan individu per anak.
                </p>
              </div>

              {/* Group Selector Dropdown */}
              <div className="shrink-0">
                <select
                  value={presentationGroupId}
                  onChange={e => setPresentationGroupId(e.target.value)}
                  className="px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-purple-300 rounded-xl shadow-xs focus:ring-2 focus:ring-purple-500"
                >
                  {activeGroups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.memberIds.length} Siswa)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {currentPresentationGroup ? (
            <div className="space-y-6">
              {/* Submitted File Banner for Presentation Group */}
              {(() => {
                const subm = submissions.find(
                  s => s.assignmentId === selectedAssignment.id && s.groupId === currentPresentationGroup.id
                );
                const submitter = subm ? students.find(s => s.id === subm.studentId) : null;

                if (subm) {
                  return (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{subm.fileName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                              {subm.fileSize}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Diunggah oleh: <strong className="text-slate-800">{submitter?.name || 'Siswa'}</strong> mewakili {currentPresentationGroup.name} ({new Date(subm.submittedAt).toLocaleString('id-ID')})
                          </div>
                          {subm.note && (
                            <div className="text-[11px] text-emerald-800 italic mt-1 bg-white/70 p-1.5 rounded border border-emerald-100">
                              💬 Catatan siswa: "{subm.note}"
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          triggerFileDownload(subm.fileUrl, subm.fileName, {
                            assignmentTitle: selectedAssignment.title,
                            studentName: submitter?.name,
                            submittedAt: subm.submittedAt,
                            note: subm.note,
                          })
                        }
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh / Buka Berkas Siswa</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Kelompok {currentPresentationGroup.name} belum mengumpulkan berkas tugas untuk penugasan ini.</span>
                  </div>
                );
              })()}

              <form onSubmit={handleSavePresentationRubric} className="space-y-6">
              {/* Part 1: Nilai Kelompok (Kolektif) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 uppercase tracking-tight">
                      1. Nilai Kelompok: {currentPresentationGroup.name} (Bobot 40%)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Nilai kriteria kolektif ini dibagikan secara adil ke seluruh anggota tim.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Isi Materi */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">Isi & Penguasaan Materi</span>
                      <span className="text-base font-extrabold text-blue-700">{matContent}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Kedalaman pembahasan, ketepatan rumus/konsep aljabar.</p>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={matContent}
                      onChange={e => setMatContent(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Media Presentasi */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">Media & Alat Peraga</span>
                      <span className="text-base font-extrabold text-blue-700">{presMedia}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Slide visual, poster, kejelasan bagan dan keterbacaan.</p>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={presMedia}
                      onChange={e => setPresMedia(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Kerja Sama */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">Kerja Sama Tim</span>
                      <span className="text-base font-extrabold text-blue-700">{teamCollab}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Kompak, saling mendukung saat menjawab, giliran bicara tertib.</p>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={teamCollab}
                      onChange={e => setTeamCollab(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Rata-rata Nilai Kelompok:</span>
                  <span className="font-extrabold text-sm text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    {Math.round((Number(matContent) + Number(presMedia) + Number(teamCollab)) / 3)} / 100
                  </span>
                </div>
              </div>

              {/* Part 2: Nilai Individu Anggota Kelompok */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 uppercase tracking-tight">
                      2. Nilai Individu Anggota ({currentPresentationGroup.memberIds.length} Siswa) (Bobot 60%)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Penilaian performa setiap anak saat berbicara, menjawab pertanyaan, dan gestur percaya diri.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentPresentationGroup.memberIds.map(studentId => {
                    const student = students.find(s => s.id === studentId);
                    const isLeader = currentPresentationGroup.leaderId === studentId;
                    const rubric = memberRubrics[studentId] || {
                      mastery: 85,
                      delivery: 85,
                      confidence: 85,
                      qnaHandling: 85,
                      notes: '',
                    };

                    const updateRubricField = (field: keyof MemberPresentationRubric, val: any) => {
                      setMemberRubrics(prev => ({
                        ...prev,
                        [studentId]: {
                          ...prev[studentId],
                          [field]: val,
                        },
                      }));
                    };

                    const groupAvg = (Number(matContent) + Number(presMedia) + Number(teamCollab)) / 3;
                    const indivAvg = (rubric.mastery + rubric.delivery + rubric.confidence + rubric.qnaHandling) / 4;
                    const finalWeightedScore = Math.round(groupAvg * 0.4 + indivAvg * 0.6);

                    return (
                      <div
                        key={studentId}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{student?.name}</span>
                            {isLeader && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                                Ketua Kelompok
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">NISN: {student?.nisn}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Nilai Akhir Presentasi:</span>
                            <span className="font-black text-sm text-purple-800 bg-purple-100 px-3 py-1 rounded-lg border border-purple-200">
                              {finalWeightedScore}
                            </span>
                          </div>
                        </div>

                        {/* 4 Rubric Sliders */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex justify-between font-semibold text-slate-700 text-[11px] mb-1">
                              <span>Penguasaan Materi</span>
                              <span className="text-purple-700 font-bold">{rubric.mastery}</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={100}
                              value={rubric.mastery}
                              onChange={e => updateRubricField('mastery', Number(e.target.value))}
                              className="w-full accent-purple-600"
                            />
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex justify-between font-semibold text-slate-700 text-[11px] mb-1">
                              <span>Penyampaian / Vokal</span>
                              <span className="text-purple-700 font-bold">{rubric.delivery}</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={100}
                              value={rubric.delivery}
                              onChange={e => updateRubricField('delivery', Number(e.target.value))}
                              className="w-full accent-purple-600"
                            />
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex justify-between font-semibold text-slate-700 text-[11px] mb-1">
                              <span>Kepercayaan Diri</span>
                              <span className="text-purple-700 font-bold">{rubric.confidence}</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={100}
                              value={rubric.confidence}
                              onChange={e => updateRubricField('confidence', Number(e.target.value))}
                              className="w-full accent-purple-600"
                            />
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex justify-between font-semibold text-slate-700 text-[11px] mb-1">
                              <span>Menjawab Pertanyaan</span>
                              <span className="text-purple-700 font-bold">{rubric.qnaHandling}</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={100}
                              value={rubric.qnaHandling}
                              onChange={e => updateRubricField('qnaHandling', Number(e.target.value))}
                              className="w-full accent-purple-600"
                            />
                          </div>
                        </div>

                        {/* Individual Teacher Comment */}
                        <div>
                          <input
                            type="text"
                            placeholder={`Catatan evaluasi untuk ${student?.name}...`}
                            value={rubric.notes || ''}
                            onChange={e => updateRubricField('notes', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Overall Presentation Notes */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Catatan Refleksi Presentasi Kelompok (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={overallPresNotes}
                    onChange={e => setOverallPresNotes(e.target.value)}
                    placeholder="Contoh: Sangat baik dalam mendemonstrasikan peraga, diskusi aktif dengan audiens..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Nilai Rubrik Presentasi</span>
                </button>
              </div>
            </form>
          </div>
          ) : (
            <p className="text-xs text-slate-500">Pilih kelompok untuk memulai penilaian.</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STANDARD GRADING (UNIFORM GROUP GRADE VS INDIVIDUAL SPECIFIC GRADE)    */}
      {/* ========================================================================= */}
      {activeGradingTab === 'standard' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Metode Penilaian Kelompok: {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih apakah satu nilai seragam diberikan ke seluruh anggota, atau nilai berbeda per siswa.
                </p>
              </div>

              {/* Choose Group */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Pilih Kelompok:</span>
                <select
                  value={selectedGroupId}
                  onChange={e => setSelectedGroupId(e.target.value)}
                  className="px-3 py-1.5 font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {activeGroups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.memberIds.length} Siswa)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Switch between Uniform vs Individual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setGradingType('group_uniform')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  gradingType === 'group_uniform'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">1. Nilai Kelompok (Seragam)</div>
                <div className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  Satu nilai diberikan kepada seluruh anggota. Contoh: Kelompok 1 Nilai 90, maka semua anggota otomatis mendapatkan nilai 90.
                </div>
              </label>

              <label
                onClick={() => setGradingType('individual_specific')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  gradingType === 'individual_specific'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">2. Nilai Individu</div>
                <div className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  Guru memberikan nilai berbeda kepada setiap anggota. Contoh: Ahmad (90), Budi (85), Citra (92), Deni (88).
                </div>
              </label>
            </div>

            {/* Submitted File Banner for Standard Group Grading */}
            {(() => {
              if (!currentGradingGroup) return null;
              const subm = submissions.find(
                s => s.assignmentId === selectedAssignment.id && s.groupId === currentGradingGroup.id
              );
              const submitter = subm ? students.find(s => s.id === subm.studentId) : null;

              if (subm) {
                return (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{subm.fileName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                            {subm.fileSize}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Diunggah oleh: <strong className="text-slate-800">{submitter?.name || 'Siswa'}</strong> mewakili {currentGradingGroup.name} ({new Date(subm.submittedAt).toLocaleString('id-ID')})
                        </div>
                        {subm.note && (
                          <div className="text-[11px] text-emerald-800 italic mt-1 bg-white/70 p-1.5 rounded border border-emerald-100">
                            💬 Catatan siswa: "{subm.note}"
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        triggerFileDownload(subm.fileUrl, subm.fileName, {
                          assignmentTitle: selectedAssignment.title,
                          studentName: submitter?.name,
                          submittedAt: subm.submittedAt,
                          note: subm.note,
                        })
                      }
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh / Buka Berkas Siswa</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Kelompok {currentGradingGroup.name} belum mengumpulkan berkas tugas untuk penugasan ini.</span>
                </div>
              );
            })()}

            {/* Form */}
            {currentGradingGroup && (
              <form onSubmit={handleSaveStandardGrade} className="space-y-4 pt-2">
                {gradingType === 'group_uniform' ? (
                  /* Form Uniform Group Score */
                  <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-blue-900">
                        Input Nilai Seragam Untuk {currentGradingGroup.name}
                      </span>
                      <span className="text-xs text-blue-700 font-semibold">
                        Akan diterapkan ke {currentGradingGroup.memberIds.length} anggota
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Skor Nilai (0 - 100):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={uniformScore}
                          onChange={e => setUniformScore(Number(e.target.value))}
                          className="w-full px-3 py-2 text-base font-extrabold text-blue-900 bg-white border border-blue-300 rounded-lg text-center"
                          required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Catatan / Umpan Balik untuk Kelompok:
                        </label>
                        <input
                          type="text"
                          value={uniformFeedback}
                          onChange={e => setUniformFeedback(e.target.value)}
                          placeholder="Contoh: Kerja kelompok sangat kompak dan laporan rapi."
                          className="w-full px-3 py-2 text-xs border border-blue-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-slate-600">
                      <span className="font-semibold">Daftar Penerima Nilai {uniformScore}: </span>
                      {currentGradingGroup.memberIds.map((mId, idx) => (
                        <span key={mId}>
                          {students.find(s => s.id === mId)?.name}
                          {idx < currentGradingGroup.memberIds.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Form Individual Score per Member */
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Input Nilai Spesifik Per Anggota {currentGradingGroup.name}:
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {currentGradingGroup.memberIds.map(studentId => {
                        const student = students.find(s => s.id === studentId);
                        const isLeader = currentGradingGroup.leaderId === studentId;
                        const score = individualScores[studentId] ?? 80;
                        const feedback = individualFeedbacks[studentId] ?? '';

                        return (
                          <div
                            key={studentId}
                            className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/60"
                          >
                            <div className="flex items-center gap-2 sm:w-1/3">
                              <span className="font-bold text-slate-900">{student?.name}</span>
                              {isLeader && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                  Ketua
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 sm:w-2/3">
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-slate-500 font-medium">Nilai:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={score}
                                  onChange={e =>
                                    setIndividualScores(prev => ({
                                      ...prev,
                                      [studentId]: Number(e.target.value),
                                    }))
                                  }
                                  className="w-16 px-2 py-1 text-center font-bold text-slate-900 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <input
                                type="text"
                                placeholder={`Catatan untuk ${student?.name}...`}
                                value={feedback}
                                onChange={e =>
                                  setIndividualFeedbacks(prev => ({
                                    ...prev,
                                    [studentId]: e.target.value,
                                  }))
                                }
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Nilai Tugas</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Recap Table of Grades for this assignment */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-1">
          Rekap Nilai Siswa Terdaftar: {selectedAssignment.title}
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Status nilai terkini yang terekam pada tugas ini.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">No</th>
                <th className="px-4 py-2.5">Nama Siswa</th>
                <th className="px-4 py-2.5">Kelompok</th>
                <th className="px-4 py-2.5">Berkas Tugas</th>
                <th className="px-4 py-2.5 text-center">Metode Penilaian</th>
                <th className="px-4 py-2.5 text-center">Nilai Akhir</th>
                <th className="px-4 py-2.5">Umpan Balik / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students
                .filter(s => currentClass?.studentIds.includes(s.id))
                .map((student, idx) => {
                  const studentGrade = grades.find(
                    g => g.assignmentId === selectedAssignment.id && g.studentId === student.id
                  );
                  const memberGroup = groups.find(
                    g =>
                      g.classId === selectedClassId &&
                      g.subjectId === selectedSubjectId &&
                      g.status === 'active' &&
                      g.memberIds.includes(student.id)
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-2 font-medium text-slate-800">
                        {student.name}
                        {memberGroup?.leaderId === student.id && (
                          <span className="ml-1 text-[9px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded font-bold">
                            Ketua
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {memberGroup ? memberGroup.name : <span className="text-slate-400 italic">Tanpa Kelompok</span>}
                      </td>
                      <td className="px-4 py-2">
                        {(() => {
                          const studentSubm = submissions.find(
                            s =>
                              s.assignmentId === selectedAssignment.id &&
                              (s.studentId === student.id ||
                                (s.groupId && memberGroup && s.groupId === memberGroup.id) ||
                                (s.submittedForStudentIds && s.submittedForStudentIds.includes(student.id)))
                          );

                          if (!studentSubm) {
                            return <span className="text-[11px] text-slate-400 italic">Belum Ada</span>;
                          }

                          return (
                            <button
                              type="button"
                              onClick={() =>
                                triggerFileDownload(studentSubm.fileUrl, studentSubm.fileName, {
                                  assignmentTitle: selectedAssignment.title,
                                  studentName: student.name,
                                  submittedAt: studentSubm.submittedAt,
                                  note: studentSubm.note,
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition cursor-pointer max-w-[150px]"
                              title={`Unduh berkas: ${studentSubm.fileName}`}
                            >
                              <Paperclip className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{studentSubm.fileName}</span>
                              <Download className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-2 text-center text-slate-500">
                        {studentGrade ? (
                          studentGrade.gradingMethod === 'group_uniform' ? (
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                              Nilai Kelompok
                            </span>
                          ) : (
                            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">
                              Nilai Individu
                            </span>
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {studentGrade ? (
                          <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {studentGrade.score}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum dinilai</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-600 truncate max-w-xs">
                        {studentGrade?.feedback || '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
