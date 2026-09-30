import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  UploadCloud,
  X,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { checkFirebaseHealth, dbSeedInitialData } from '../../lib/firebase';
import firebaseConfig from '../../../firebase-applet-config.json';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({ isOpen, onClose }) => {
  const {
    teachers,
    students,
    classes,
    subjects,
    groups,
    assignments,
    submissions,
    grades,
    presentationAssessments,
    refreshDataFromDatabase,
    databaseStatus,
  } = useSchool();

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateSuccess, setMigrateSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setMigrateSuccess(null);
    try {
      const res = await checkFirebaseHealth();
      setTestResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ success: false, message: msg });
    } finally {
      setTesting(false);
    }
  };

  const handleSeedData = async () => {
    setIsMigrating(true);
    setMigrateSuccess(null);
    try {
      await dbSeedInitialData({
        teachers,
        students,
        classes,
        subjects,
        groups,
        assignments,
        submissions,
        grades,
        presentationAssessments,
      });
      setMigrateSuccess('Semua data berhasil disinkronkan ke Firebase Firestore!');
      await refreshDataFromDatabase();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ success: false, message: `Gagal sinkron data: ${msg}` });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Flame className="w-6 h-6 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Database Firebase Firestore</h3>
              <p className="text-xs text-amber-100">Koneksi & Sinkronisasi Cloud Real-time</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  databaseStatus === 'connected'
                    ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse'
                    : databaseStatus === 'syncing'
                    ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'
                    : 'bg-rose-500 ring-4 ring-rose-100'
                }`}
              />
              <div>
                <div className="font-bold text-slate-800 text-xs">
                  Status Database:{' '}
                  <span
                    className={
                      databaseStatus === 'connected'
                        ? 'text-emerald-700'
                        : databaseStatus === 'syncing'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }
                  >
                    {databaseStatus === 'connected'
                      ? 'Terhubung (Firebase Firestore)'
                      : databaseStatus === 'syncing'
                      ? 'Menyinkronkan...'
                      : 'Memeriksa / Offline'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Proyek: <span className="font-mono">{firebaseConfig.projectId}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>
          </div>

          {/* Test connection alert */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{testResult.success ? 'Koneksi Berhasil' : 'Koneksi Gagal'}</p>
                <p className="mt-0.5 opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Migrate / Seed success alert */}
          {migrateSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{migrateSuccess}</span>
            </div>
          )}

          {/* Details Config Info */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-xs text-slate-700 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>Detail Konfigurasi Cloud Firebase</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">PROJECT ID</span>
                <span className="font-mono text-slate-700 text-[11px] truncate block">
                  {firebaseConfig.projectId}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">DATABASE ID</span>
                <span className="font-mono text-slate-700 text-[11px] truncate block" title={firebaseConfig.firestoreDatabaseId}>
                  {firebaseConfig.firestoreDatabaseId || '(default)'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2">
                <span className="text-[10px] text-slate-400 block font-semibold">AUTH DOMAIN</span>
                <span className="font-mono text-slate-700 text-[11px] truncate block">
                  {firebaseConfig.authDomain}
                </span>
              </div>
            </div>
          </div>

          {/* Quick sync button */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <UploadCloud className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-amber-900">Sinkronisasi / Unggah Data ke Firebase</h5>
                <p className="text-[11px] text-amber-800/80 leading-relaxed mt-0.5">
                  Unggah seluruh data kelas, siswa, guru, kelompok, tugas, dan nilai yang ada saat ini ke koleksi Cloud Firestore.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSeedData}
              disabled={isMigrating}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              <span>{isMigrating ? 'Mengunggah ke Firebase...' : 'Unggah Data Saat Ini ke Firebase'}</span>
            </button>
          </div>

          {/* Storage notice reminder */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Dengan Firebase Firestore, seluruh data tersimpan di Cloud Google dan tidak dibatasi oleh batas kapasitas kuota browser.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
