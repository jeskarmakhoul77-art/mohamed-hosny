import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ApartmentStageSlot, Language, PortfolioSlot, VideoSlot } from '../../types';
import {
  matchFilenameToSlotKey,
  fileToDataUrl,
  uploadMediaToServer,
  createSignedUploadUrl,
  confirmDirectUpload,
  triggerBatchMigration,
  saveSlotToServer,
  deleteSlotFromServer,
  resetAllSlotsOnServer,
  storeMediaBlob,
  deleteMediaBlob,
  saveLocalApartmentStages,
  saveLocalPortfolioSlots,
  saveLocalVideoSlots,
  fetchSupabaseStatus,
  saveSupabaseSettings
} from '../../services/mediaStorage';
import { resetAllMediaOverrides } from '../../services/bookingStorage';
import {
  X,
  Upload,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
  Video,
  FileCheck,
  AlertTriangle,
  Lock,
  Layers,
  Search,
  ExternalLink,
  Cloud,
  Check,
  ShieldAlert,
  Server,
  Save
} from 'lucide-react';

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  apartmentStages: ApartmentStageSlot[];
  portfolioSlots: PortfolioSlot[];
  videoSlots: VideoSlot[];
  onRefreshData: () => void;
}

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  detectedSlotKey: string | null;
  assignedSlotKey: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
}

export const MediaManagerModal: React.FC<MediaManagerModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  apartmentStages,
  portfolioSlots,
  videoSlots,
  onRefreshData
}) => {
  // Authentication State: Direct Owner Access (Password prompt removed)
  const [isAuthenticated] = useState<boolean>(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'images' | 'bulk' | 'videos' | 'settings'>('images');
  const [imageCategoryFilter, setImageCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Supabase Cloud Status
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    url: string | null;
    bucket: string;
    usingFallback: boolean;
    message: string;
  } | null>(null);
  const [isLoadingSupabaseStatus, setIsLoadingSupabaseStatus] = useState(false);

  // Supabase Settings Form
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('https://dvddnoawgghiwlmwepzx.supabase.co');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [supabaseBucketInput, setSupabaseBucketInput] = useState('project-media');
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [supabaseSaveMsg, setSupabaseSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Migration State & Progress
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationReport, setMigrationReport] = useState<{
    totalFiles: number;
    verifiedCount: number;
    results: Array<{ fileName: string; slotKey: string; sizeBytes: number; publicUrl: string; verified: boolean; error?: string }>;
  } | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  // Individual Upload State & Progress
  const [uploadingSlotKey, setUploadingSlotKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [lastUploadWarning, setLastUploadWarning] = useState<string | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const [targetSlotForUpload, setTargetSlotForUpload] = useState<string | null>(null);

  // Bulk Upload State
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<{
    slotKey: string;
    type: 'apartment' | 'portfolio' | 'video';
    title: string;
  } | null>(null);

  // Video URL inline editor state
  const [editingVideoSlot, setEditingVideoSlot] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [targetVideoForUpload, setTargetVideoForUpload] = useState<string | null>(null);

  // Refresh Supabase status on open
  useEffect(() => {
    if (isOpen) {
      refreshSupabaseStatus();
    }
  }, [isOpen]);

  const refreshSupabaseStatus = async () => {
    setIsLoadingSupabaseStatus(true);
    try {
      const status = await fetchSupabaseStatus();
      setSupabaseStatus(status);
      if (status.url) setSupabaseUrlInput(status.url);
      if (status.bucket) setSupabaseBucketInput(status.bucket);
    } catch {
      // ignore
    } finally {
      setIsLoadingSupabaseStatus(false);
    }
  };

  // Build combined list of all 45 slots for dropdown assignment
  const allImageSlots = useMemo(() => {
    const list: { slotKey: string; label: string; group: string }[] = [];
    apartmentStages.forEach((s) => {
      list.push({
        slotKey: s.slotKey,
        label: `${s.slotKey} — ${currentLang === 'ar' ? s.titleAr : s.titleEn}`,
        group: currentLang === 'ar' ? 'مشروع الشقة (5 مراحل)' : 'Apartment (5 Stages)'
      });
    });
    portfolioSlots.forEach((p) => {
      list.push({
        slotKey: p.slotKey,
        label: `${p.slotKey} — ${currentLang === 'ar' ? p.titleAr : p.titleEn}`,
        group: currentLang === 'ar' ? p.categoryLabelAr : p.categoryLabelEn
      });
    });
    return list;
  }, [apartmentStages, portfolioSlots, currentLang]);

  if (!isOpen) return null;

  // Trigger file picker for a single slot
  const handleTriggerSingleUpload = (slotKey: string) => {
    setTargetSlotForUpload(slotKey);
    if (singleFileInputRef.current) {
      singleFileInputRef.current.value = '';
      singleFileInputRef.current.click();
    }
  };

  // Process single file selection
  const handleSingleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSlotForUpload) return;

    const slotKey = targetSlotForUpload;
    setUploadingSlotKey(slotKey);
    setUploadProgress(15);

    try {
      let activeUrl = '';

      // If Supabase is connected, upload directly via signed upload URL (bypassing Vercel 4.5MB limit)
      if (supabaseStatus?.connected) {
        setUploadProgress(35);
        const signedRes = await createSignedUploadUrl(slotKey, file.name, file.type || 'image/jpeg');
        if (signedRes.success && signedRes.signedUrl && signedRes.publicUrl) {
          setUploadProgress(60);
          const putRes = await fetch(signedRes.signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'image/jpeg'
            }
          });

          if (!putRes.ok) {
            throw new Error(`Direct cloud upload failed with HTTP ${putRes.status}`);
          }

          setUploadProgress(85);
          await confirmDirectUpload(slotKey, file.name, signedRes.publicUrl);
          activeUrl = signedRes.publicUrl;
        }
      }

      // Fallback for local development or when Supabase is not connected
      if (!activeUrl) {
        const dataUrl = await fileToDataUrl(file);
        setUploadProgress(40);
        await storeMediaBlob(slotKey, dataUrl, file.name);
        setUploadProgress(65);

        const res = await uploadMediaToServer(slotKey, dataUrl, file.name);
        setUploadProgress(90);

        if (!res.success) {
          throw new Error(res.error || 'Server upload failed');
        }

        activeUrl = res.fileUrl || dataUrl;
        if (res.warning) {
          setLastUploadWarning(res.warning);
        }
      }

      // Update React state & persistent localStorage cache
      if (slotKey.startsWith('apartment-stage')) {
        const updated = apartmentStages.map((s) =>
          s.slotKey === slotKey ? { ...s, imageUrl: activeUrl, isPlaceholder: false } : s
        );
        saveLocalApartmentStages(updated);
      } else {
        const updated = portfolioSlots.map((p) =>
          p.slotKey === slotKey ? { ...p, imageUrl: activeUrl, isPlaceholder: false } : p
        );
        saveLocalPortfolioSlots(updated);
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploadingSlotKey(null);
        setUploadProgress(0);
        setTargetSlotForUpload(null);
        onRefreshData();
      }, 300);
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      alert(`Upload error: ${err.message}`);
      setUploadingSlotKey(null);
      setUploadProgress(0);
      setTargetSlotForUpload(null);
    }
  };

  // Trigger Bulk File Selection
  const handleTriggerBulkSelect = () => {
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = '';
      bulkFileInputRef.current.click();
    }
  };

  // Handle files selected for bulk upload
  const handleBulkFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newQueued: QueuedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const detected = matchFilenameToSlotKey(f.name);
      const previewUrl = URL.createObjectURL(f);
      newQueued.push({
        id: `bulk_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        previewUrl,
        detectedSlotKey: detected,
        assignedSlotKey: detected || allImageSlots[0]?.slotKey || 'apartment-stage-01',
        status: 'pending',
        progress: 0
      });
    }

    setQueuedFiles(newQueued);
    setActiveTab('bulk');
  };

  const handleReassignQueuedFile = (id: string, newSlotKey: string) => {
    setQueuedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, assignedSlotKey: newSlotKey } : item))
    );
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Execute bulk commit with server token
  const handleExecuteBulkUpload = async () => {
    setIsProcessingBulk(true);
    setShowBulkConfirmModal(false);

    let updatedApartments = [...apartmentStages];
    let updatedPortfolio = [...portfolioSlots];

    for (let i = 0; i < queuedFiles.length; i++) {
      const item = queuedFiles[i];
      const slotKey = item.assignedSlotKey;

      setQueuedFiles((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 25 } : q))
      );

      try {
        const dataUrl = await fileToDataUrl(item.file);
        await storeMediaBlob(slotKey, dataUrl, item.file.name);

        setQueuedFiles((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, progress: 60 } : q))
        );

        const res = await uploadMediaToServer(slotKey, dataUrl, item.file.name);
        if (!res.success) {
          throw new Error(res.error || 'Upload failed');
        }

        const activeUrl = res.fileUrl || dataUrl;

        if (slotKey.startsWith('apartment-stage')) {
          updatedApartments = updatedApartments.map((s) =>
            s.slotKey === slotKey ? { ...s, imageUrl: activeUrl, isPlaceholder: false } : s
          );
        } else {
          updatedPortfolio = updatedPortfolio.map((p) =>
            p.slotKey === slotKey ? { ...p, imageUrl: activeUrl, isPlaceholder: false } : p
          );
        }

        setQueuedFiles((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q))
        );
      } catch (err: any) {
        setQueuedFiles((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'error', errorMessage: err.message } : q
          )
        );
      }
    }

    saveLocalApartmentStages(updatedApartments);
    saveLocalPortfolioSlots(updatedPortfolio);
    setIsProcessingBulk(false);
    onRefreshData();
  };

  // Delete / Reset single slot
  const handleConfirmDelete = async () => {
    if (!deleteConfirmSlot) return;
    const { slotKey, type } = deleteConfirmSlot;

    await deleteMediaBlob(slotKey);
    await deleteSlotFromServer(slotKey);

    if (type === 'apartment') {
      const updated = apartmentStages.map((s) =>
        s.slotKey === slotKey ? { ...s, imageUrl: undefined, isPlaceholder: true } : s
      );
      saveLocalApartmentStages(updated);
    } else if (type === 'portfolio') {
      const updated = portfolioSlots.map((p) =>
        p.slotKey === slotKey ? { ...p, imageUrl: undefined, isPlaceholder: true } : p
      );
      saveLocalPortfolioSlots(updated);
    } else if (type === 'video') {
      const updated = videoSlots.map((v) =>
        v.slotKey === slotKey ? { ...v, videoUrl: undefined, isAvailable: false } : v
      );
      saveLocalVideoSlots(updated);
    }

    setDeleteConfirmSlot(null);
    onRefreshData();
  };

  // Video URL save
  const handleSaveVideoUrl = async (slotKey: string) => {
    const val = videoUrlInput.trim();
    const updated = videoSlots.map((v) =>
      v.slotKey === slotKey ? { ...v, videoUrl: val || undefined, isAvailable: !!val } : v
    );
    saveLocalVideoSlots(updated);
    await saveSlotToServer(slotKey, val || '', `${slotKey}`);
    setEditingVideoSlot(null);
    setVideoUrlInput('');
    onRefreshData();
  };

  // Video direct file upload
  const handleTriggerVideoUpload = (slotKey: string) => {
    setTargetVideoForUpload(slotKey);
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
      videoFileInputRef.current.click();
    }
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetVideoForUpload) return;
    const slotKey = targetVideoForUpload;

    setUploadingSlotKey(slotKey);
    setUploadProgress(15);

    try {
      let fileUrl = '';

      // For large videos, upload directly to Supabase Storage via signed URL (bypassing Vercel 4.5MB limit)
      if (supabaseStatus?.connected) {
        setUploadProgress(30);
        const signedRes = await createSignedUploadUrl(slotKey, file.name, file.type || 'video/mp4');
        if (signedRes.success && signedRes.signedUrl && signedRes.publicUrl) {
          setUploadProgress(50);
          const putRes = await fetch(signedRes.signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'video/mp4'
            }
          });

          if (!putRes.ok) {
            throw new Error(`Direct cloud video upload failed with HTTP ${putRes.status}`);
          }

          setUploadProgress(85);
          await confirmDirectUpload(slotKey, file.name, signedRes.publicUrl);
          fileUrl = signedRes.publicUrl;
        }
      }

      // Fallback for local server
      if (!fileUrl) {
        const dataUrl = await fileToDataUrl(file);
        setUploadProgress(60);

        const res = await uploadMediaToServer(slotKey, dataUrl, file.name);
        setUploadProgress(90);

        if (!res.success) {
          throw new Error(res.error || 'Video upload failed');
        }
        fileUrl = res.fileUrl || dataUrl;
      }

      const updated = videoSlots.map((v) =>
        v.slotKey === slotKey ? { ...v, videoUrl: fileUrl, isAvailable: true } : v
      );
      saveLocalVideoSlots(updated);

      setUploadProgress(100);
      setTimeout(() => {
        setUploadingSlotKey(null);
        setUploadProgress(0);
        setTargetVideoForUpload(null);
        onRefreshData();
      }, 300);
    } catch (err: any) {
      alert(`Video upload failed: ${err.message}`);
      setUploadingSlotKey(null);
      setUploadProgress(0);
      setTargetVideoForUpload(null);
    }
  };

  // Reset all to defaults
  const handleResetAll = async () => {
    if (
      confirm(
        currentLang === 'ar'
          ? 'تحذير: هل أنت متأكد من رغبتك في حذف كافة التعديلات واستعادة الحالة الافتراضية؟'
          : 'Warning: Are you sure you want to delete all uploaded overrides and restore defaults?'
      )
    ) {
      await resetAllSlotsOnServer();
      resetAllMediaOverrides();
      onRefreshData();
    }
  };

  // Save Supabase credentials from Settings Tab
  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSupabase(true);
    setSupabaseSaveMsg(null);

    const res = await saveSupabaseSettings({
      supabaseUrl: supabaseUrlInput.trim(),
      supabaseKey: supabaseKeyInput.trim(),
      bucketName: supabaseBucketInput.trim() || 'project-media'
    });

    setIsSavingSupabase(false);
    if (res.success) {
      setSupabaseSaveMsg({
        type: 'success',
        text:
          currentLang === 'ar'
            ? 'تم التحقق من الاتصال مع Supabase بنجاح! التخزين السحابي الدائم نشط الآن.'
            : 'Supabase credentials verified successfully! Cloud storage is now active.'
      });
      refreshSupabaseStatus();
    } else {
      setSupabaseSaveMsg({
        type: 'error',
        text: res.message || 'Failed to verify Supabase credentials.'
      });
    }
  };

  // Run non-destructive cloud migration
  const handleRunMigration = async () => {
    setIsMigrating(true);
    setMigrationError(null);
    setMigrationReport(null);

    const res = await triggerBatchMigration();
    setIsMigrating(false);

    if (res.success && res.results) {
      setMigrationReport({
        totalFiles: res.totalFiles || res.results.length,
        verifiedCount: res.verifiedCount || 0,
        results: res.results
      });
      onRefreshData();
    } else {
      setMigrationError(
        res.message || res.error || (currentLang === 'ar' ? 'فشل الترحيل. تأكد من إعداد مفاتيح Supabase.' : 'Migration failed. Ensure Supabase credentials are configured.')
      );
    }
  };

  // Filter image slots for Tab 1
  const filteredApartment = apartmentStages.filter((s) => {
    if (imageCategoryFilter !== 'all' && imageCategoryFilter !== 'apartment') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.slotKey.includes(q) || s.titleAr.includes(q) || s.titleEn.toLowerCase().includes(q);
  });

  const filteredPortfolio = portfolioSlots.filter((p) => {
    if (imageCategoryFilter !== 'all' && imageCategoryFilter !== p.category) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.slotKey.includes(q) ||
      p.category.includes(q) ||
      p.titleAr.includes(q) ||
      p.titleEn.toLowerCase().includes(q)
    );
  });

  const totalUploadedImages =
    apartmentStages.filter((s) => s.imageUrl).length +
    portfolioSlots.filter((p) => p.imageUrl).length;
  const totalUploadedVideos = videoSlots.filter((v) => v.videoUrl).length;

  // Accurate, transparent storage provenance classifier
  const getSlotStorageInfo = (url?: string) => {
    if (!url) {
      return {
        type: 'empty',
        labelAr: 'بانتظار الصورة',
        labelEn: 'Empty Slot',
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-300'
      };
    }
    if (url.includes('supabase.co')) {
      return {
        type: 'supabase',
        labelAr: 'سحابي دائم (Supabase)',
        labelEn: 'Cloud CDN (Permanent)',
        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-300'
      };
    }
    if (url.startsWith('/assets/')) {
      return {
        type: 'repository',
        labelAr: 'مستودع Git (ثابت ودائم)',
        labelEn: 'Repository (Permanent)',
        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-300'
      };
    }
    if (url.startsWith('/uploads/')) {
      return {
        type: 'ephemeral',
        labelAr: 'مؤقت محلي (غير مثبت بـ Git)',
        labelEn: 'Temporary Runtime (Uncommitted)',
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-300'
      };
    }
    return {
      type: 'external',
      labelAr: 'رابط خارجي',
      labelEn: 'External URL',
      badgeClass: 'text-blue-800 bg-blue-50 border-blue-300'
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Hidden single file pickers */}
      <input
        type="file"
        ref={singleFileInputRef}
        onChange={handleSingleFileSelected}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={bulkFileInputRef}
        onChange={handleBulkFilesSelected}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={videoFileInputRef}
        onChange={handleVideoFileSelected}
        accept="video/mp4,video/webm"
        className="hidden"
      />

      {/* Main Container */}
      <div className="relative max-w-6xl w-full bg-[#FAF8F5] text-[#242424] border border-[#D1B995]/50 rounded-sm shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#152B24] text-[#F7F5F0] px-6 py-4 flex items-center justify-between border-b border-[#D1B995]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#1F4A3B] border border-[#D1B995]/50 flex items-center justify-center text-[#D1B995] shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D1B995]">
                  MOHAMED HOSNY ADMIN PORTAL
                </span>
                <span className="text-xs text-[#D1B995]/50">·</span>
                {supabaseStatus?.connected ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    {currentLang === 'ar' ? 'تخزين سحابي Supabase نشط' : 'Supabase Cloud CDN Active'}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-300 font-semibold flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    {currentLang === 'ar' ? 'وضع التخزين المحلي (Local)' : 'Local Storage Mode'}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F7F5F0]">
                {currentLang === 'ar' ? 'مدير الوسائط والصور (Media Manager)' : 'Media Manager Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium bg-[#1F4A3B] border border-[#D1B995]/40 text-[#D1B995] rounded-sm">
              <Check className="w-3 h-3 text-[#D1B995]" />
              <span>{currentLang === 'ar' ? 'وصول مباشر مفعل' : 'Direct Owner Access'}</span>
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-[#F7F5F0]/70 hover:text-white rounded-sm cursor-pointer hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DIRECT DASHBOARD VIEW */}
        <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Supabase Ephemeral Storage Warning Banner (if using fallback) */}
            {supabaseStatus && !supabaseStatus.connected && (
              <div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-6 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>
                    {currentLang === 'ar'
                      ? 'تنبيه النشر على Vercel: التخزين السحابي Supabase غير متصل حالياً. الملفات المرفوعة محفوظة محلياً فقط. لضمان بقائها بعد إعادة النشر، اربط Supabase من تبويب الإعدادات.'
                      : 'Deployment Notice: Supabase Cloud Storage is not connected. Uploads are stored locally and will reset on Vercel redeployments. Connect Supabase in Settings.'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="underline font-bold text-amber-900 hover:text-black shrink-0 cursor-pointer text-left rtl:text-right"
                >
                  {currentLang === 'ar' ? 'ربط Supabase الآن ←' : 'Connect Supabase Now →'}
                </button>
              </div>
            )}

            {/* Top Toolbar: Tabs & Global Actions */}
            <div className="bg-[#1F4A3B] px-6 py-3 border-b border-[#D1B995]/30 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F7F5F0]">
              
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-4 py-2 rounded-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'images'
                      ? 'bg-[#D1B995] text-[#1F4A3B] shadow-sm'
                      : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{currentLang === 'ar' ? 'خانات الصور (45 خانة)' : '45 Image Slots'}</span>
                  <span className="px-1.5 py-0.2 bg-[#152B24] text-[#D1B995] rounded-full text-[10px] font-mono">
                    {totalUploadedImages}/45
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`px-4 py-2 rounded-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'bulk'
                      ? 'bg-[#D1B995] text-[#1F4A3B] shadow-sm'
                      : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{currentLang === 'ar' ? 'رفع صور متعددة' : 'Bulk Upload'}</span>
                  {queuedFiles.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-emerald-700 text-white rounded-full text-[10px] font-mono">
                      {queuedFiles.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-4 py-2 rounded-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'videos'
                      ? 'bg-[#D1B995] text-[#1F4A3B] shadow-sm'
                      : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{currentLang === 'ar' ? 'مكتبة الفيديوهات (5 خانات)' : '5 Video Slots'}</span>
                  <span className="px-1.5 py-0.2 bg-[#152B24] text-[#D1B995] rounded-full text-[10px] font-mono">
                    {totalUploadedVideos}/5
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2 rounded-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'bg-[#D1B995] text-[#1F4A3B] shadow-sm'
                      : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{currentLang === 'ar' ? 'إعدادات التخزين السحابي' : 'Cloud Storage'}</span>
                  {supabaseStatus?.connected ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              </div>

              {/* Action: Prominent Bulk Upload Trigger Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerBulkSelect}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] font-bold rounded-sm shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{currentLang === 'ar' ? 'رفع صور متعددة من الجهاز' : 'Upload Multiple Images'}</span>
                </button>
              </div>

            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: 45 INDIVIDUAL IMAGE SLOTS */}
              {activeTab === 'images' && (
                <div className="space-y-5">
                  {/* GitHub + Vercel Permanent Storage Architecture Guidance Banner */}
                  <div className="bg-[#FAF8F5] border border-[#D1B995]/40 rounded-sm p-4 text-xs text-[#242424] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold text-[#1F4A3B]">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-[#B89B6A] shrink-0" />
                        <span>
                          {currentLang === 'ar'
                            ? 'منهجية الحفظ الدائم عبر مستودع المشروع (GitHub + Vercel):'
                            : 'Permanent Media Persistence via Project Repository (GitHub + Vercel):'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#1F4A3B] bg-white px-2.5 py-1 rounded-xs border border-[#D1B995]/40 w-fit">
                        public/assets/projects/{'{category}'}/
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C5C5C] leading-relaxed">
                      {currentLang === 'ar'
                        ? 'لكي تظل الصور والفيديوهات دائمة بعد النشر ولا تختفي عند إعادة تشغيل السيرفرات، توضع الملفات في مجلدات المشروع العامة (public/assets/projects/ و public/assets/videos/)، ثم تلتزم في مستودع GitHub وتُنشر مع الموقع على Vercel. التخزين السحابي Supabase متاح أيضاً كخيار متزامن للتجاوز اللحظي دون إعادة نشر.'
                        : 'To ensure media survives server restarts and Vercel redeployments permanently, place files into public project directories (public/assets/projects/ and public/assets/videos/), commit to GitHub, and deploy to Vercel. Supabase Cloud Storage remains available for on-the-fly dynamic overrides.'}
                    </p>
                  </div>

                  {/* Category Filter & Search Bar */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 rounded-sm border border-[#D1B995]/30">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                      {[
                        { id: 'all', label: currentLang === 'ar' ? 'الكل (45)' : 'All (45)' },
                        { id: 'apartment', label: currentLang === 'ar' ? 'الشقة (5)' : 'Apartment (5)' },
                        { id: 'plumbing', label: currentLang === 'ar' ? 'السباكة (5)' : 'Plumbing (5)' },
                        { id: 'electrical', label: currentLang === 'ar' ? 'الكهرباء (5)' : 'Electrical (5)' },
                        { id: 'plastering', label: currentLang === 'ar' ? 'المحارة (5)' : 'Plastering (5)' },
                        { id: 'ceramics', label: currentLang === 'ar' ? 'السيراميك tiling (5)' : 'Tiling (5)' },
                        { id: 'gypsum', label: currentLang === 'ar' ? 'الجبس (5)' : 'Gypsum (5)' },
                        { id: 'painting', label: currentLang === 'ar' ? 'الدهانات (5)' : 'Painting (5)' },
                        { id: 'interior', label: currentLang === 'ar' ? 'التصميم (5)' : 'Interior (5)' },
                        { id: 'commercial', label: currentLang === 'ar' ? 'التجاري (5)' : 'Commercial (5)' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setImageCategoryFilter(cat.id)}
                          className={`px-2.5 py-1 text-xs rounded-sm whitespace-nowrap cursor-pointer transition-colors ${
                            imageCategoryFilter === cat.id
                              ? 'bg-[#1F4A3B] text-[#D1B995] font-bold'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[240px]">
                      <Search className="w-4 h-4 text-gray-400 absolute top-2.5 left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={currentLang === 'ar' ? 'بحث بالاسم أو الكود...' : 'Search slot or title...'}
                        className="w-full text-xs p-2 pl-8 border rounded-sm bg-[#FAF8F5] border-gray-300 focus:border-[#1F4A3B] outline-none"
                      />
                    </div>
                  </div>

                  {/* 1. Apartment Stages Section */}
                  {filteredApartment.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#D1B995]/30 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1F4A3B]" />
                          <h3 className="text-sm font-bold text-[#1F4A3B]">
                            {currentLang === 'ar'
                              ? 'مشروع الشقة من البداية إلى النهاية (5 مراحل متسلسلة)'
                              : 'Continuous Apartment Project (5 Sequential Stages)'}
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-[#B89B6A]">
                          apartment-stage-01 .. 05
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredApartment.map((stage) => {
                          const isCurrentlyUploading = uploadingSlotKey === stage.slotKey;
                          return (
                            <div
                              key={stage.slotKey}
                              className="bg-white border border-[#D1B995]/30 rounded-sm p-4 shadow-xs flex flex-col justify-between hover:border-[#D1B995] transition-all"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className="text-xs font-mono font-bold text-[#D1B995] bg-[#152B24] px-2 py-0.5 rounded-xs">
                                    {stage.slotKey}
                                  </span>
                                  {(() => {
                                    const info = getSlotStorageInfo(stage.imageUrl);
                                    return (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border flex items-center gap-1 ${info.badgeClass}`}>
                                        {info.type === 'repository' || info.type === 'supabase' ? (
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        ) : info.type === 'ephemeral' ? (
                                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                                        ) : (
                                          <Clock className="w-3 h-3 text-amber-600" />
                                        )}
                                        {currentLang === 'ar' ? info.labelAr : info.labelEn}
                                      </span>
                                    );
                                  })()}
                                </div>

                                <div
                                  onClick={() => handleTriggerSingleUpload(stage.slotKey)}
                                  className="relative aspect-video rounded-xs overflow-hidden bg-[#162C26] border border-[#D1B995]/20 cursor-pointer group mb-3 flex items-center justify-center"
                                  title={currentLang === 'ar' ? 'انقر لرفع أو استبدال الصورة' : 'Click to upload or replace image'}
                                >
                                  {stage.imageUrl ? (
                                    <>
                                      <img
                                        src={stage.imageUrl}
                                        alt={stage.titleAr}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-[#152B24]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#D1B995] gap-1 p-2">
                                        <RefreshCw className="w-5 h-5 animate-spin-hover" />
                                        <span className="text-[11px] font-bold">
                                          {currentLang === 'ar' ? 'استبدال هذه الصورة' : 'Replace Image'}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-3 text-[#F7F5F0]">
                                      <div className="w-9 h-9 rounded-full bg-[#1F4A3B] border border-[#D1B995]/40 flex items-center justify-center text-[#D1B995] mb-1.5 group-hover:scale-110 transition-transform">
                                        <Upload className="w-4 h-4" />
                                      </div>
                                      <span className="text-[11px] font-bold text-[#D1B995]">
                                        {currentLang === 'ar' ? 'انقر لاختيار صورة من جهازك' : 'Click to select photo'}
                                      </span>
                                    </div>
                                  )}

                                  {isCurrentlyUploading && (
                                    <div className="absolute inset-0 bg-[#152B24]/90 flex flex-col items-center justify-center p-4 text-[#D1B995]">
                                      <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                                      <span className="text-xs font-mono font-bold">{uploadProgress}%</span>
                                    </div>
                                  )}
                                </div>

                                <h4 className="text-xs font-bold text-[#1F4A3B] leading-snug line-clamp-1">
                                  0{stage.stageNumber}. {currentLang === 'ar' ? stage.titleAr : stage.titleEn}
                                </h4>
                                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                  {currentLang === 'ar' ? stage.descriptionAr : stage.descriptionEn}
                                </p>
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                                <button
                                  onClick={() => handleTriggerSingleUpload(stage.slotKey)}
                                  className="inline-flex items-center gap-1 text-[11px] text-[#1F4A3B] hover:text-[#B89B6A] font-semibold cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>{stage.imageUrl ? (currentLang === 'ar' ? 'استبدال' : 'Replace') : (currentLang === 'ar' ? 'رفع ملف' : 'Upload')}</span>
                                </button>

                                {stage.imageUrl && (
                                  <button
                                    onClick={() =>
                                      setDeleteConfirmSlot({
                                        slotKey: stage.slotKey,
                                        type: 'apartment',
                                        title: currentLang === 'ar' ? stage.titleAr : stage.titleEn
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 cursor-pointer"
                                    title="Delete/Reset Image"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>{currentLang === 'ar' ? 'حذف' : 'Delete'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Portfolio 40 Slots Section */}
                  {filteredPortfolio.length > 0 && (
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center justify-between border-b border-[#D1B995]/30 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1F4A3B]" />
                          <h3 className="text-sm font-bold text-[#1F4A3B]">
                            {currentLang === 'ar'
                              ? 'معرض الأعمال الرئيسي (40 خانة موزعة على 8 أقسام)'
                              : 'Main Portfolio Slots (40 Slots across 8 Categories)'}
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-[#B89B6A]">
                          {filteredPortfolio.length} / 40 {currentLang === 'ar' ? 'خانة' : 'slots'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPortfolio.map((slot) => {
                          const isCurrentlyUploading = uploadingSlotKey === slot.slotKey;
                          return (
                            <div
                              key={slot.slotKey}
                              className="bg-white border border-[#D1B995]/30 rounded-sm p-3.5 shadow-xs flex flex-col justify-between hover:border-[#D1B995] transition-all"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-mono font-bold text-[#D1B995] bg-[#152B24] px-2 py-0.5 rounded-xs">
                                    {slot.slotKey}
                                  </span>
                                  {(() => {
                                    const info = getSlotStorageInfo(slot.imageUrl);
                                    return (
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs border flex items-center gap-1 ${info.badgeClass}`}>
                                        {info.type === 'repository' || info.type === 'supabase' ? (
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        ) : info.type === 'ephemeral' ? (
                                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                                        ) : (
                                          <Clock className="w-3 h-3 text-amber-600" />
                                        )}
                                        {currentLang === 'ar' ? info.labelAr : info.labelEn}
                                      </span>
                                    );
                                  })()}
                                </div>

                                <div
                                  onClick={() => handleTriggerSingleUpload(slot.slotKey)}
                                  className="relative aspect-[4/3] rounded-xs overflow-hidden bg-[#162C26] border border-[#D1B995]/20 cursor-pointer group mb-2.5 flex items-center justify-center"
                                  title={currentLang === 'ar' ? 'انقر لرفع أو استبدال الصورة' : 'Click to upload or replace image'}
                                >
                                  {slot.imageUrl ? (
                                    <>
                                      <img
                                        src={slot.imageUrl}
                                        alt={slot.titleAr}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-[#152B24]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#D1B995] gap-1 p-2">
                                        <RefreshCw className="w-5 h-5 animate-spin-hover" />
                                        <span className="text-[10px] font-bold">
                                          {currentLang === 'ar' ? 'استبدال الصورة' : 'Replace Image'}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-2 text-[#F7F5F0]">
                                      <div className="w-8 h-8 rounded-full bg-[#1F4A3B] border border-[#D1B995]/40 flex items-center justify-center text-[#D1B995] mb-1 group-hover:scale-110 transition-transform">
                                        <Upload className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-[10px] font-bold text-[#D1B995]">
                                        {currentLang === 'ar' ? 'اختر صورة من جهازك' : 'Choose photo'}
                                      </span>
                                    </div>
                                  )}

                                  {isCurrentlyUploading && (
                                    <div className="absolute inset-0 bg-[#152B24]/90 flex flex-col items-center justify-center p-4 text-[#D1B995]">
                                      <RefreshCw className="w-5 h-5 animate-spin mb-1" />
                                      <span className="text-xs font-mono font-bold">{uploadProgress}%</span>
                                    </div>
                                  )}
                                </div>

                                <h4 className="text-xs font-bold text-[#1F4A3B] leading-snug line-clamp-1">
                                  {currentLang === 'ar' ? slot.titleAr : slot.titleEn}
                                </h4>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                                <button
                                  onClick={() => handleTriggerSingleUpload(slot.slotKey)}
                                  className="inline-flex items-center gap-1 text-[11px] text-[#1F4A3B] hover:text-[#B89B6A] font-semibold cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>{slot.imageUrl ? (currentLang === 'ar' ? 'استبدال' : 'Replace') : (currentLang === 'ar' ? 'رفع' : 'Upload')}</span>
                                </button>

                                {slot.imageUrl && (
                                  <button
                                    onClick={() =>
                                      setDeleteConfirmSlot({
                                        slotKey: slot.slotKey,
                                        type: 'portfolio',
                                        title: currentLang === 'ar' ? slot.titleAr : slot.titleEn
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 cursor-pointer"
                                    title="Delete/Reset Image"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>{currentLang === 'ar' ? 'حذف' : 'Delete'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BULK IMAGE UPLOADER */}
              {activeTab === 'bulk' && (
                <div className="space-y-6">
                  <div className="bg-[#152B24] text-[#F7F5F0] p-5 rounded-sm border border-[#D1B995]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-[#D1B995] mb-1">
                        {currentLang === 'ar' ? 'نظام الرفع المتعدد للصور وتطابق الأسماء الذكي' : 'Bulk Image Upload & Smart Slot Matching'}
                      </h3>
                      <p className="text-xs text-[#F7F5F0]/80 leading-relaxed max-w-2xl">
                        {currentLang === 'ar'
                          ? 'يمكنك تحديد مجموعة كاملة من الصور دفعة واحدة من جهازك (حتى 45 صورة). يتعرف النظام تلقائياً على الخانات المناسبة إذا كان اسم الملف يحتوي على الكود (مثل plumbing-01 أو stage-02 أو tiling-03)، ويمكنك إعادة تعيين أي صورة يدوياً قبل الحفظ.'
                          : 'Select multiple photos from your computer at once. The system automatically maps filenames matching slot keys (e.g., plumbing-01, stage-02, tiling-03), and provides dropdown controls to manually assign non-matching files before committing.'}
                      </p>
                    </div>

                    <button
                      onClick={handleTriggerBulkSelect}
                      className="px-5 py-3 bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] text-xs font-bold uppercase rounded-sm shadow-md cursor-pointer flex items-center gap-2 shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{currentLang === 'ar' ? 'اختيار صور من جهازك' : 'Select Files'}</span>
                    </button>
                  </div>

                  {queuedFiles.length === 0 ? (
                    <div
                      onClick={handleTriggerBulkSelect}
                      className="border-2 border-dashed border-[#D1B995]/50 bg-white hover:bg-amber-50/30 p-12 rounded-sm text-center cursor-pointer transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#152B24] text-[#D1B995] flex items-center justify-center mx-auto mb-3 shadow-md">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-[#1F4A3B] mb-1">
                        {currentLang === 'ar' ? 'لم تقم بتحديد صور بعد' : 'No images in queue'}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        {currentLang === 'ar'
                          ? 'اضغط هنا لاختيار عدة صور من حاسوبك، أو اسحب الصور إلى هذه المساحة.'
                          : 'Click here to pick multiple project photos from your computer.'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-sm border border-[#D1B995]/30 overflow-hidden shadow-xs">
                      <div className="p-4 bg-[#FAF8F5] border-b border-[#D1B995]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#1F4A3B]">
                            {currentLang === 'ar' ? 'قائمة الملفات المحددة للرفع: ' : 'Files Selected for Upload: '}
                          </span>
                          <span className="px-2 py-0.5 bg-[#1F4A3B] text-[#D1B995] rounded-full text-xs font-mono font-bold">
                            {queuedFiles.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQueuedFiles([])}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                          >
                            {currentLang === 'ar' ? 'إلغاء الكل' : 'Clear All'}
                          </button>

                          <button
                            onClick={() => setShowBulkConfirmModal(true)}
                            disabled={isProcessingBulk}
                            className="px-5 py-2 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-xs font-bold uppercase rounded-sm shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                          >
                            {isProcessingBulk ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                            <span>{currentLang === 'ar' ? 'مراجعة وحفظ الصور على الموقع' : 'Review & Commit All'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                        {queuedFiles.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/20 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-gray-400 font-mono text-[11px] w-5">
                                #{idx + 1}
                              </span>
                              
                              <img
                                src={item.previewUrl}
                                alt={item.file.name}
                                className="w-12 h-10 object-cover rounded-xs border border-gray-200 shrink-0"
                              />

                              <div className="min-w-0">
                                <div className="font-bold text-[#1F4A3B] truncate max-w-xs sm:max-w-md">
                                  {item.file.name}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                                  <span>{(item.file.size / 1024).toFixed(1)} KB</span>
                                  {item.detectedSlotKey && (
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200 font-sans">
                                      ✓ {currentLang === 'ar' ? 'تطابق تلقائي' : 'Auto-matched'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex flex-col items-end">
                                <label className="text-[10px] text-gray-400 font-mono mb-0.5">
                                  {currentLang === 'ar' ? 'الخانة المخصصة:' : 'Assigned Slot:'}
                                </label>
                                <select
                                  value={item.assignedSlotKey}
                                  onChange={(e) => handleReassignQueuedFile(item.id, e.target.value)}
                                  className="text-xs p-1.5 border border-[#D1B995]/50 rounded-sm bg-white font-mono text-[#1F4A3B] focus:border-[#1F4A3B] outline-none max-w-[220px]"
                                >
                                  {allImageSlots.map((slot) => (
                                    <option key={slot.slotKey} value={slot.slotKey}>
                                      {slot.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {item.status === 'uploading' && (
                                <div className="w-20">
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#1F4A3B] transition-all"
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {item.status === 'completed' && (
                                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}

                              <button
                                onClick={() => handleRemoveFromQueue(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-sm cursor-pointer"
                                title="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: 5 VIDEO SLOTS */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="bg-[#152B24] text-[#F7F5F0] p-4 rounded-sm border border-[#D1B995]/30 text-xs">
                    <p>
                      {currentLang === 'ar'
                        ? 'تتيح لك هذه اللوحة إدارة الـ 5 فيديوهات الأساسية للموقع (المقابلة التعريفية، صالون محمد وخالد، مراحل التنفيذ، جولة الشقة، والمشروع التجاري). يمكنك رفع ملف فيديو مباشر (MP4/WebM) أو إدخال رابط يوتيوب أو فيميو.'
                        : 'Manage the 5 designated video slots across the site. Upload video files directly (MP4/WebM) or provide streaming URLs (YouTube, Vimeo, MP4 direct).'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {videoSlots.map((video) => {
                      const isEditing = editingVideoSlot === video.slotKey;
                      const isUploading = uploadingSlotKey === video.slotKey;

                      return (
                        <div
                          key={video.slotKey}
                          className="bg-white border border-[#D1B995]/30 rounded-sm p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 max-w-xl">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[#D1B995] bg-[#152B24] px-2 py-0.5 rounded-xs">
                                {video.slotKey}
                              </span>
                              <strong className="text-sm text-[#1F4A3B]">
                                0{video.id}. {currentLang === 'ar' ? video.titleAr : video.titleEn}
                              </strong>
                              {(() => {
                                const info = getSlotStorageInfo(video.videoUrl);
                                return (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border flex items-center gap-1 ${info.badgeClass}`}>
                                    {info.type === 'repository' || info.type === 'supabase' ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    ) : info.type === 'ephemeral' ? (
                                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    ) : (
                                      <Clock className="w-3 h-3 text-amber-600" />
                                    )}
                                    {currentLang === 'ar' ? info.labelAr : info.labelEn}
                                  </span>
                                );
                              })()}
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">
                              {currentLang === 'ar' ? video.descriptionAr : video.descriptionEn}
                            </p>

                            {video.videoUrl && (
                              <div className="text-[11px] font-mono text-emerald-800 truncate max-w-md">
                                Current URL: {video.videoUrl}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={videoUrlInput}
                                  onChange={(e) => setVideoUrlInput(e.target.value)}
                                  placeholder="https://youtube.com/..."
                                  className="p-1.5 text-xs border rounded-sm w-56 font-mono bg-white"
                                />
                                <button
                                  onClick={() => handleSaveVideoUrl(video.slotKey)}
                                  className="px-2.5 py-1.5 bg-[#1F4A3B] text-[#D1B995] rounded-sm text-xs font-bold"
                                >
                                  {currentLang === 'ar' ? 'حفظ' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingVideoSlot(null)}
                                  className="p-1.5 bg-gray-200 rounded-sm text-xs"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleTriggerVideoUpload(video.slotKey)}
                                  disabled={isUploading}
                                  className="px-3 py-1.5 text-xs bg-[#1F4A3B] text-[#D1B995] rounded-sm flex items-center justify-center gap-1.5 hover:bg-[#152B24] cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{isUploading ? `${uploadProgress}%` : (currentLang === 'ar' ? 'رفع ملف MP4' : 'Upload MP4')}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingVideoSlot(video.slotKey);
                                    setVideoUrlInput(video.videoUrl || '');
                                  }}
                                  className="px-3 py-1.5 text-xs border border-[#1F4A3B] text-[#1F4A3B] hover:bg-[#1F4A3B] hover:text-[#D1B995] rounded-sm flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>{currentLang === 'ar' ? 'رابط URL' : 'Set URL'}</span>
                                </button>

                                {video.videoUrl && (
                                  <button
                                    onClick={() =>
                                      setDeleteConfirmSlot({
                                        slotKey: video.slotKey,
                                        type: 'video',
                                        title: currentLang === 'ar' ? video.titleAr : video.titleEn
                                      })
                                    }
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm"
                                    title="Delete Video"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS & SUPABASE STORAGE */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Real Status Banner */}
                  <div
                    className={`p-5 rounded-sm border shadow-xs space-y-3 ${
                      supabaseStatus?.connected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {supabaseStatus?.connected ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-amber-700" />
                        )}
                        <h3 className="text-sm font-bold">
                          {supabaseStatus?.connected
                            ? (currentLang === 'ar' ? 'التخزين السحابي الدائم: متصل بنجاح مع Supabase' : 'Persistent Cloud Storage: Connected to Supabase')
                            : (currentLang === 'ar' ? 'التخزين السحابي: غير متصل (يعمل في وضع التخزين المحلي المؤقت)' : 'Cloud Storage: Not Connected (Using Local Fallback)')}
                        </h3>
                      </div>

                      <button
                        onClick={refreshSupabaseStatus}
                        className="inline-flex items-center gap-1 text-xs text-[#1F4A3B] hover:underline cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupabaseStatus ? 'animate-spin' : ''}`} />
                        <span>{currentLang === 'ar' ? 'تحديث الفحص' : 'Refresh Check'}</span>
                      </button>
                    </div>

                    <p className="text-xs leading-relaxed opacity-90">
                      {supabaseStatus?.message}
                    </p>

                    {supabaseStatus?.connected ? (
                      <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-emerald-900 border-t border-emerald-200">
                        <div>
                          <strong>Project URL:</strong> {supabaseStatus.url}
                        </div>
                        <div>
                          <strong>Bucket:</strong> {supabaseStatus.bucket}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/70 border border-amber-200 rounded-sm text-xs text-amber-900 leading-relaxed">
                        <strong>
                          {currentLang === 'ar' ? 'لماذا يعد ربط Supabase ضرورياً للنشر على Vercel؟' : 'Why is Supabase necessary for Vercel?'}
                        </strong>
                        <p className="mt-1">
                          {currentLang === 'ar'
                            ? 'في منصات الاستضافة مثل Vercel، تعمل الخوادم بتقنية Serverless ويكون القرص المحلي مؤقتاً ومقروءاً فقط، وتختفي الصور بمجرد إعادة النشر أو انطفاء الخادم. عند ربط Supabase، يتم رفع الصور ومساراتها مباشرة إلى خوادم CDN سحابية عالمية دائمة، مما يضمن بقاء جميع الصور الـ 45 والفيديوهات الـ 5 مرئية لجميع زوار موقعك في كافة الأوقات.'
                            : 'On serverless platforms like Vercel, the local filesystem is ephemeral and reset upon redeployment. Connecting Supabase ensures all 45 project photos and 5 videos are securely stored in global cloud object storage, remaining permanently viewable by all website visitors.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Supabase Environment Status Display */}
                  <div className="bg-white p-6 rounded-sm border border-[#D1B995]/40 shadow-xs space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#1F4A3B] mb-1 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#1F4A3B]" />
                          <span>{currentLang === 'ar' ? 'إعدادات البيئة السحابية (آمنة تماماً)' : 'Server Environment Configuration (Strictly Secure)'}</span>
                        </h4>
                        <p className="text-xs text-gray-500">
                          {currentLang === 'ar'
                            ? 'حفاظاً على الأمان الكامل، تتم قراءة مفاتيح السحابة حصرياً عبر متغيرات بيئة الخادم (Environment Variables) ولا يتم إدخالها أو نقلها عبر المتصفح مطلقاً.'
                            : 'For strict security, credentials are read exclusively via server-side environment variables and are never transmitted or input via the browser.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={refreshSupabaseStatus}
                        disabled={isLoadingSupabaseStatus}
                        className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#D1B995] text-[#1F4A3B] font-bold rounded-xs cursor-pointer flex items-center gap-1.5 text-xs hover:bg-[#F2EDE4] self-start sm:self-auto"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupabaseStatus ? 'animate-spin' : ''}`} />
                        <span>{currentLang === 'ar' ? 'إعادة فحص الاتصال' : 'Check Status'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#FAF8F5] rounded-xs border border-[#D1B995]/20 space-y-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Supabase Project URL</span>
                        <span className="font-mono text-xs text-[#1F4A3B] font-bold break-all">https://dvddnoawgghiwlmwepzx.supabase.co</span>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] rounded-xs border border-[#D1B995]/20 space-y-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Storage Bucket</span>
                        <span className="font-mono text-xs text-[#1F4A3B] font-bold">project-media</span>
                      </div>

                      <div className="md:col-span-2 p-3 bg-[#FAF8F5] rounded-xs border border-[#D1B995]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Server Secret Key (SUPABASE_SERVICE_ROLE_KEY)</span>
                          <span className="text-xs text-gray-600">
                            {supabaseStatus?.connected
                              ? (currentLang === 'ar' ? 'مفعل ومقروء من بيئة الخادم بأمان' : 'Configured securely via server environment')
                              : (currentLang === 'ar' ? 'غير مسجل في متغيرات البيئة حالياً' : 'Not configured in environment variables')}
                          </span>
                        </div>
                        <div>
                          {supabaseStatus?.connected ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>{currentLang === 'ar' ? 'متصل' : 'Active'}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-xs flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{currentLang === 'ar' ? 'بانتظار الإعداد في البيئة' : 'Pending Config'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Migration to Supabase Card (Non-Destructive) */}
                  <div className="p-5 bg-[#F2EDE4] border border-[#D1B995]/60 rounded-sm space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-[#1F4A3B]" />
                        <strong className="text-[#1F4A3B] text-sm font-bold">
                          {currentLang === 'ar' ? 'ترحيل الملفات الموجودة حالياً (31 ملف) إلى Supabase' : 'Migrate Existing Media (31 files) to Supabase Storage'}
                        </strong>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xs">
                        {currentLang === 'ar' ? 'آمن وبدون حذف' : 'Non-Destructive'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      {currentLang === 'ar'
                        ? 'يقوم هذا الإجراء بنسخ كافة الصور والفيديوهات الموجودة حالياً في مجلد public/uploads (28 صورة و 3 فيديوهات) إلى سحابة Supabase Storage مباشرة والحصول على روابط CDN دائمة وتثبيتها في الـ Manifest، دون حذف أو تعديل أي ملف محلي.'
                        : 'Safely copies all 28 existing photos and 3 videos from public/uploads to your Supabase Storage bucket, generates permanent CDN links, and syncs the media manifest without deleting local originals.'}
                    </p>

                    {migrationError && (
                      <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                        <span>{migrationError}</span>
                      </div>
                    )}

                    {migrationReport && (
                      <div className="p-3 bg-white border border-emerald-300 rounded-xs space-y-2">
                        <div className="flex items-center justify-between text-emerald-900 font-bold">
                          <span>{currentLang === 'ar' ? 'اكتمل الترحيل بنجاح:' : 'Migration Completed:'}</span>
                          <span>{migrationReport.verifiedCount} / {migrationReport.totalFiles} {currentLang === 'ar' ? 'ملف تم التحقق منه' : 'verified'}</span>
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[10px] text-gray-700 divide-y divide-gray-100">
                          {migrationReport.results.map((r) => (
                            <div key={r.fileName} className="pt-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                {r.verified ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-red-600" />}
                                {r.fileName}
                              </span>
                              <span className="text-gray-400">{(r.sizeBytes / 1024).toFixed(1)} KB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        {currentLang === 'ar' ? 'يتطلب اتصالاً نشطاً بـ Supabase أولاً.' : 'Requires verified Supabase connection first.'}
                      </span>
                      <button
                        type="button"
                        onClick={handleRunMigration}
                        disabled={isMigrating || !supabaseStatus?.connected}
                        className="px-5 py-2 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] font-bold text-xs uppercase tracking-wider rounded-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        {isMigrating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                        <span>
                          {isMigrating
                            ? (currentLang === 'ar' ? 'جارٍ ترحيل والتحقق من الملفات...' : 'Migrating & Verifying...')
                            : (currentLang === 'ar' ? 'بدء الترحيل السحابي والتحقق' : 'Run Cloud Migration')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-red-900 block font-bold">
                        {currentLang === 'ar' ? 'استعادة الحالة الافتراضية للوسائط' : 'Reset All Media Slots'}
                      </strong>
                      <span className="text-red-700 text-[11px]">
                        {currentLang === 'ar'
                          ? 'سيؤدي هذا إلى مسح كافة الصور والفيديوهات المرفوعة والعودة للـ manifest الافتراضي.'
                          : 'Deletes all uploaded overrides and restores original manifest placeholders.'}
                      </span>
                    </div>

                    <button
                      onClick={handleResetAll}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                      {currentLang === 'ar' ? 'إعادة ضبط شاملة' : 'Reset All'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Footer Bar */}
            <div className="bg-[#FAF8F5] px-6 py-3.5 border-t border-[#D1B995]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-[#5C5C5C] font-mono text-[11px]">
                <span>Total: 45 Photo Slots (40 Portfolio + 5 Apartment) · 5 Video Slots</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] font-bold rounded-sm transition-colors cursor-pointer"
                >
                  {currentLang === 'ar' ? 'إغلاق اللوحة' : 'Close Dashboard'}
                </button>
              </div>
            </div>

          </div>

      </div>

      {/* CONFIRMATION MODAL BEFORE BULK COMMIT */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#D1B995] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#1F4A3B]">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">
                  {currentLang === 'ar' ? 'تأكيد حفظ الصور على الموقع' : 'Confirm Bulk Image Upload'}
                </h4>
                <p className="text-xs text-gray-500">
                  {currentLang === 'ar'
                    ? `أنت على وشك حفظ ${queuedFiles.length} صورة في الخانات المحددة.`
                    : `You are about to commit ${queuedFiles.length} photos to designated slots.`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xs border border-amber-200 text-xs text-amber-900 leading-relaxed">
              {currentLang === 'ar'
                ? 'سيتم استبدال الصور الحالية في هذه الخانات بالملفات المختارة. هل ترغب في المتابعة؟'
                : 'Any existing photos in the assigned slots will be replaced with your newly chosen files. Proceed?'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBulkConfirmModal(false)}
                className="px-4 py-2 border rounded-sm text-xs cursor-pointer hover:bg-gray-100"
              >
                {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleExecuteBulkUpload}
                className="px-6 py-2 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] font-bold rounded-sm text-xs cursor-pointer shadow-md"
              >
                {currentLang === 'ar' ? 'تأكيد الحفظ الآن' : 'Commit & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR SINGLE DELETE */}
      {deleteConfirmSlot && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-red-300 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">
                  {currentLang === 'ar' ? 'تأكيد حذف الصورة' : 'Confirm Delete Media'}
                </h4>
                <p className="text-xs text-gray-500 font-mono">
                  Slot: {deleteConfirmSlot.slotKey}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-700">
              {currentLang === 'ar'
                ? `هل أنت متأكد من حذف الصورة الخاصة بـ (${deleteConfirmSlot.title})؟ سيتم إعادة الخانة للحالة الافتراضية.`
                : `Are you sure you want to delete the media for (${deleteConfirmSlot.title})? The slot will revert to default placeholder.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmSlot(null)}
                className="px-4 py-2 border rounded-sm text-xs cursor-pointer hover:bg-gray-100"
              >
                {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm text-xs cursor-pointer shadow-md"
              >
                {currentLang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
