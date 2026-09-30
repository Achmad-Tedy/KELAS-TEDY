/**
 * Utility helper for student and teacher assignment file operations
 */

export const formatBytes = (bytes: number, decimals: number = 1): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const getFileExtension = (fileName: string): string => {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
};

export interface FileTypeInfo {
  label: string;
  badgeBg: string;
  badgeText: string;
  iconType: 'pdf' | 'doc' | 'slide' | 'sheet' | 'image' | 'archive' | 'generic';
}

export const getFileTypeInfo = (fileName: string): FileTypeInfo => {
  const ext = getFileExtension(fileName);

  switch (ext) {
    case 'pdf':
      return { label: 'PDF Document', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700', iconType: 'pdf' };
    case 'doc':
    case 'docx':
      return { label: 'Word Document', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', iconType: 'doc' };
    case 'ppt':
    case 'pptx':
      return { label: 'PowerPoint Slide', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', iconType: 'slide' };
    case 'xls':
    case 'xlsx':
      return { label: 'Excel Spreadsheet', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', iconType: 'sheet' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return { label: 'Gambar / Foto', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', iconType: 'image' };
    case 'zip':
    case 'rar':
    case '7z':
      return { label: 'Arsip Kompresi', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', iconType: 'archive' };
    default:
      return { label: ext.toUpperCase() || 'Berkas', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', iconType: 'generic' };
  }
};

// In-memory cache for uploaded files during session (prevents localStorage quota overflow)
const inMemoryFileStore = new Map<string, string>();

export const storeFileInMemory = (id: string, fileUrl: string) => {
  try {
    inMemoryFileStore.set(id, fileUrl);
  } catch {}
};

export const getFileFromMemory = (id: string): string | undefined => {
  return inMemoryFileStore.get(id);
};

/**
 * Triggers actual browser download for a file.
 * If fileUrl (e.g. data URL or blob URL) is available, uses it.
 * Otherwise creates a temporary text/plain data URI containing submission info so download always succeeds.
 */
export const triggerFileDownload = (
  fileUrl: string | undefined,
  fileName: string,
  metaFallback?: { assignmentTitle?: string; studentName?: string; note?: string; submittedAt?: string; submissionId?: string }
) => {
  let downloadUrl = fileUrl;

  if (!downloadUrl && metaFallback?.submissionId) {
    downloadUrl = getFileFromMemory(metaFallback.submissionId);
  }

  if (!downloadUrl) {
    const content = [
      `============================================================`,
      `BERKAS PENGUMPULAN TUGAS SISWA`,
      `============================================================`,
      `Nama Berkas: ${fileName}`,
      metaFallback?.assignmentTitle ? `Tugas: ${metaFallback.assignmentTitle}` : '',
      metaFallback?.studentName ? `Pengumpul: ${metaFallback.studentName}` : '',
      metaFallback?.submittedAt ? `Waktu Pengumpulan: ${new Date(metaFallback.submittedAt).toLocaleString('id-ID')}` : '',
      metaFallback?.note ? `Catatan Siswa: ${metaFallback.note}` : '',
      `============================================================`,
      `Berkas ini dikumpulkan melalui Sistem Manajemen Tugas Kelas.`,
    ].filter(Boolean).join('\n');

    downloadUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
  }

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
