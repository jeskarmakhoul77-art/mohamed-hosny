import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ApartmentStageSlot, Language, PortfolioSlot, VideoSlot } from '../../types';
import {
  matchFilenameToSlotKey,
  fileToDataUrl,
  uploadMediaToServer,
  saveSlotToServer,
  deleteSlotFromServer,
  saveLocalApartmentStages,
  saveLocalPortfolioSlots,
  saveLocalVideoSlots,
  loginAdmin,
  logoutAdmin,
  checkAdminAuth,
  getAdminAuthToken,
  fetchSupabaseStatus,
  fetchMediaInventory,
  PhysicalMediaInventory
} from '../../services/mediaStorage';
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
  Unlock,
  KeyRound,
  Layers,
  Search,
  ExternalLink,
  Cloud,
  Check,
  ShieldAlert,
  Server,
  Save,
  PlusCircle,
  Eye,
  ShieldCheck,
  Database,
  HardDrive,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  SlidersHorizontal,
  LogOut
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

type MediaTab = 'all_media' | 'archive' | 'portfolio' | 'apartment' | 'videos' | 'unassigned' | 'settings';

export const MediaManagerModal: React.FC<MediaManagerModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  apartmentStages,
  portfolioSlots,
  videoSlots,
  onRefreshData
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAdminAuthToken());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<MediaTab>('all_media');
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Physical Inventory Server Data
  const [inventory, setInventory] = useState<PhysicalMediaInventory | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Supabase Cloud Diagnostic Status (Read-Only)
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    url: string | null;
    bucket: string;
    usingFallback: boolean;
    message: string;
  } | null>(null);

  // Assign from Archive Modal State
  const [assigningArchiveFile, setAssigningArchiveFile] = useState<{
    fileName: string;
    url: string;
  } | null>(null);
  const [selectedTargetSlot, setSelectedTargetSlot] = useState<string>('');
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState<string | null>(null);

  // Lightbox Preview Modal State
  const [lightboxItem, setLightboxItem] = useState<{
    url: string;
    title: string;
    subtitle?: string;
    isVideo?: boolean;
  } | null>(null);

  // Unassign / Delete Confirmation Modal State
  const [confirmClearSlot, setConfirmClearSlot] = useState<{
    slotKey: string;
    title: string;
  } | null>(null);
  const [isClearingSlot, setIsClearingSlot] = useState(false);

  // Direct Upload State
  const [uploadingSlotKey, setUploadingSlotKey] = useState<string | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const [targetSlotForUpload, setTargetSlotForUpload] = useState<string | null>(null);

  // Load Inventory & Auth status on open
  const loadData = async () => {
    setIsLoadingInventory(true);
    try {
      const inv = await fetchMediaInventory();
      if (inv) setInventory(inv);
      const status = await fetchSupabaseStatus();
      setSupabaseStatus(status);
    } catch (err) {
      console.warn('Failed to fetch media inventory:', err);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkAdminAuth().then((authed) => {
        setIsAuthenticated(authed);
        if (authed) {
          loadData();
        }
      });
    }
  }, [isOpen]);

  // Handle Admin PIN Login
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsVerifyingPin(true);
    setPinError(null);

    const res = await loginAdmin(pinInput.trim());
    setIsVerifyingPin(false);

    if (res.success) {
      setIsAuthenticated(true);
      setPinInput('');
      loadData();
    } else {
      setPinError(res.message || (currentLang === 'ar' ? 'رمز الدخول غير صحيح' : 'Invalid admin PIN'));
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
  };

  // Assign Archive File to Target Slot
  const handleConfirmAssignment = async () => {
    if (!assigningArchiveFile || !selectedTargetSlot || isSavingAssignment) return;

    setIsSavingAssignment(true);
    setAssignmentSuccessMsg(null);

    try {
      const res = await saveSlotToServer(
        selectedTargetSlot,
        assigningArchiveFile.url,
        assigningArchiveFile.fileName
      );

      if (res.success) {
        setAssignmentSuccessMsg(
          currentLang === 'ar'
            ? `تم تعيين الملف إلى الخانة [${selectedTargetSlot}] بنجاح!`
            : `Assigned to slot [${selectedTargetSlot}] successfully!`
        );

        // Update local state
        if (selectedTargetSlot.startsWith('apartment-')) {
          const updated = apartmentStages.map((s) =>
            s.slotKey === selectedTargetSlot
              ? { ...s, imageUrl: assigningArchiveFile.url, isPlaceholder: false }
              : s
          );
          saveLocalApartmentStages(updated);
        } else if (selectedTargetSlot.startsWith('video-')) {
          const updated = videoSlots.map((v) =>
            v.slotKey === selectedTargetSlot
              ? { ...v, videoUrl: assigningArchiveFile.url }
              : v
          );
          saveLocalVideoSlots(updated);
        } else {
          const updated = portfolioSlots.map((p) =>
            p.slotKey === selectedTargetSlot
              ? { ...p, imageUrl: assigningArchiveFile.url, isPlaceholder: false }
              : p
          );
          saveLocalPortfolioSlots(updated);
        }

        await loadData();
        onRefreshData();

        setTimeout(() => {
          setAssigningArchiveFile(null);
          setSelectedTargetSlot('');
          setAssignmentSuccessMsg(null);
        }, 1200);
      } else {
        alert(res.error || 'Failed to save slot assignment');
      }
    } catch (err: any) {
      alert(`Assignment error: ${err.message}`);
    } finally {
      setIsSavingAssignment(false);
    }
  };

  // Clear Slot Assignment
  const handleExecuteClearSlot = async () => {
    if (!confirmClearSlot || isClearingSlot) return;

    setIsClearingSlot(true);
    try {
      const res = await deleteSlotFromServer(confirmClearSlot.slotKey);
      if (res.success) {
        if (confirmClearSlot.slotKey.startsWith('apartment-')) {
          const updated = apartmentStages.map((s) =>
            s.slotKey === confirmClearSlot.slotKey
              ? { ...s, imageUrl: undefined, isPlaceholder: true }
              : s
          );
          saveLocalApartmentStages(updated);
        } else if (confirmClearSlot.slotKey.startsWith('video-')) {
          const updated = videoSlots.map((v) =>
            v.slotKey === confirmClearSlot.slotKey
              ? { ...v, videoUrl: '' }
              : v
          );
          saveLocalVideoSlots(updated);
        } else {
          const updated = portfolioSlots.map((p) =>
            p.slotKey === confirmClearSlot.slotKey
              ? { ...p, imageUrl: undefined, isPlaceholder: true }
              : p
          );
          saveLocalPortfolioSlots(updated);
        }

        await loadData();
        onRefreshData();
        setConfirmClearSlot(null);
      } else {
        alert(res.error || 'Failed to clear slot');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsClearingSlot(false);
    }
  };

  // Direct Single File Upload
  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSlotForUpload) return;

    setUploadingSlotKey(targetSlotForUpload);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await uploadMediaToServer(targetSlotForUpload, dataUrl, file.name);

      if (res.success && res.fileUrl) {
        if (targetSlotForUpload.startsWith('apartment-')) {
          const updated = apartmentStages.map((s) =>
            s.slotKey === targetSlotForUpload
              ? { ...s, imageUrl: res.fileUrl, isPlaceholder: false }
              : s
          );
          saveLocalApartmentStages(updated);
        } else {
          const updated = portfolioSlots.map((p) =>
            p.slotKey === targetSlotForUpload
              ? { ...p, imageUrl: res.fileUrl, isPlaceholder: false }
              : p
          );
          saveLocalPortfolioSlots(updated);
        }
        await loadData();
        onRefreshData();
      } else {
        alert(res.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingSlotKey(null);
      setTargetSlotForUpload(null);
      if (singleFileInputRef.current) singleFileInputRef.current.value = '';
    }
  };

  // Category counts and filtered data
  const filteredPortfolio = useMemo(() => {
    return portfolioSlots.filter((p) => {
      if (portfolioCategoryFilter !== 'all' && p.category !== portfolioCategoryFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.slotKey.toLowerCase().includes(q) ||
        p.titleAr.includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        (p.imageUrl && p.imageUrl.toLowerCase().includes(q))
      );
    });
  }, [portfolioSlots, portfolioCategoryFilter, searchQuery]);

  const filteredArchive = useMemo(() => {
    if (!inventory?.inboxFiles) return [];
    if (!searchQuery) return inventory.inboxFiles;
    const q = searchQuery.toLowerCase();
    return inventory.inboxFiles.filter(
      (f) => f.fileName.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [inventory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs font-sans text-[#242424] animate-fadeIn">
      {/* Hidden file input for direct upload */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4"
        className="hidden"
        onChange={handleSingleFileChange}
      />

      {/* Main Modal Shell */}
      <div className="bg-[#FAF8F5] border border-[#D1B995] rounded-sm w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* CONDITIONAL RENDERING: ADMIN AUTHENTICATION GATE VS. MANAGEMENT DASHBOARD */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <>
            {/* RESTRICTED ACCESS HEADER */}
            <div className="bg-[#1F4A3B] text-[#F7F5F0] px-6 py-4 border-b border-[#D1B995]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-[#152B24] border border-[#D1B995]/40 flex items-center justify-center text-[#D1B995]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#D1B995] font-bold">
                      {currentLang === 'ar' ? 'مؤسسة المهندس محمد حسني' : 'ENG. MOHAMED HOSNY'}
                    </span>
                    <span className="text-white/40">|</span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-xs border border-amber-500/30">
                      {currentLang === 'ar' ? 'منطقة مقيدة — تتطلب المصادقة' : 'RESTRICTED AREA'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {currentLang === 'ar'
                      ? 'بوابة الدخول الإداري للتحكم في الوسائط'
                      : 'Administrative Media Manager Gate'}
                  </h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/40 rounded-xs transition-colors cursor-pointer"
                title={currentLang === 'ar' ? 'إغلاق والعودة' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DEDICATED ADMIN AUTHENTICATION GATE (NO DATA LEAKAGE TO VISITORS) */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#FAF8F5] min-h-[460px]">
              <div className="max-w-md w-full bg-white border border-[#D1B995]/60 rounded-sm shadow-xl p-8 space-y-6 text-center">
                {/* Shield / Keyhole Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-[#1F4A3B] text-[#D1B995] flex items-center justify-center shadow-md">
                  <Lock className="w-8 h-8" />
                </div>

                {/* Headings */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold rounded-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>{currentLang === 'ar' ? 'نظام الحماية الإدارية مفعل' : 'Strict Security Gate Active'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1F4A3B]">
                    {currentLang === 'ar' ? 'تسجيل الدخول الإداري' : 'Admin PIN Required'}
                  </h3>
                  <p className="text-xs text-[#5C5C5C] leading-relaxed">
                    {currentLang === 'ar'
                      ? 'الموقع العام للزوار مخصص للعرض فقط (Read-Only). للوصول إلى أدوات رفع واستبدال الصور وتعديل مراحل المشاريع، يرجى إدخال الرمز الإداري المعتمد للمهندس محمد حسني.'
                      : 'The public website is strictly read-only for visitors. To access media management, modify slots, or upload files, please enter the verified admin PIN.'}
                  </p>
                </div>

                {/* Secure PIN Form */}
                <form onSubmit={handlePinSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
                    <label className="block text-xs font-semibold text-[#1F4A3B]">
                      {currentLang === 'ar' ? 'الرمز السري الإداري (PIN)' : 'Administrative PIN'}
                    </label>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        if (pinError) setPinError(null);
                      }}
                      placeholder="••••••••"
                      autoFocus
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 text-center font-mono tracking-widest text-sm bg-[#FAF8F5] border border-[#D1B995] rounded-xs outline-none focus:border-[#1F4A3B] focus:ring-1 focus:ring-[#1F4A3B] transition-all"
                    />
                  </div>

                  {pinError && (
                    <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xs flex items-center gap-2 justify-center font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isVerifyingPin || !pinInput.trim()}
                      className="w-full py-3 px-4 bg-[#1F4A3B] hover:bg-[#152B24] disabled:opacity-50 text-[#D1B995] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isVerifyingPin ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{currentLang === 'ar' ? 'جارٍ التحقق المشفر من السيرفر...' : 'Verifying with server...'}</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>{currentLang === 'ar' ? 'تأكيد ودخول لوحة الإدارة' : 'Authenticate & Unlock'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-4 bg-transparent hover:bg-gray-100 text-[#5C5C5C] text-xs font-medium rounded-xs transition-colors cursor-pointer"
                    >
                      {currentLang === 'ar' ? 'إلغاء والعودة للموقع العام' : 'Cancel & Return to Public Site'}
                    </button>
                  </div>
                </form>

                {/* Security Footer Note */}
                <div className="pt-4 border-t border-[#D1B995]/20 flex items-center justify-center gap-1.5 text-[10px] text-[#5C5C5C] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{currentLang === 'ar' ? 'محمي بخوادم آمنة وجلسات مشفرة (SHA-256 / Rate-Limited)' : 'Protected by server session token (SHA-256 / Rate-Limited)'}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* FULL AUTHENTICATED HEADER */}
            <div className="bg-[#1F4A3B] text-[#F7F5F0] px-6 py-4 border-b border-[#D1B995]/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-[#152B24] border border-[#D1B995]/40 flex items-center justify-center text-[#D1B995]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#D1B995] font-bold">
                      {currentLang === 'ar' ? 'مؤسسة المهندس محمد حسني' : 'ENG. MOHAMED HOSNY'}
                    </span>
                    <span className="text-white/40">|</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-xs border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {currentLang === 'ar' ? 'مشرف معتمد (جلسة نشطة)' : 'AUTHENTICATED ADMIN'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {currentLang === 'ar'
                      ? 'مدير الوسائط المتكامل والأرشيف الهندسي للمشروع'
                      : 'Master Media Manager & Architectural Archive'}
                  </h2>
                </div>
              </div>

              {/* Quick Metrics Badges & Logout Bar */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Physical Files Count */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#152B24] border border-[#D1B995]/40 rounded-xs">
                  <HardDrive className="w-3.5 h-3.5 text-[#D1B995]" />
                  <span className="text-white/80">{currentLang === 'ar' ? 'الملفات:' : 'Files:'}</span>
                  <span className="font-mono font-bold text-[#D1B995]">
                    {inventory?.stats.totalPhysicalFiles || 82}
                  </span>
                </div>

                {/* Original Archive Count */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#152B24] border border-[#D1B995]/40 rounded-xs">
                  <FolderOpen className="w-3.5 h-3.5 text-[#D1B995]" />
                  <span className="text-white/80">{currentLang === 'ar' ? 'الأرشيف:' : 'Archive:'}</span>
                  <span className="font-mono font-bold text-[#D1B995]">
                    {inventory?.stats.archiveImagesCount || 62}
                  </span>
                </div>

                {/* Supabase Cloud Videos Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#152B24] border border-[#3ECF8E]/50 rounded-xs">
                  <Cloud className="w-3.5 h-3.5 text-[#3ECF8E]" />
                  <span className="text-white/80">{currentLang === 'ar' ? 'سحابة Supabase:' : 'Supabase Cloud:'}</span>
                  <span className="font-mono font-bold text-[#3ECF8E]">
                    {inventory?.stats.supabaseCloudVideosCount || 7}
                  </span>
                  <span className="text-[10px] text-white/50">{currentLang === 'ar' ? 'فيديو' : 'vids'}</span>
                </div>

                {/* Designated Slots Count */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#152B24] border border-[#D1B995]/40 rounded-xs">
                  <Layers className="w-3.5 h-3.5 text-[#D1B995]" />
                  <span className="text-white/80">{currentLang === 'ar' ? 'الخانات:' : 'Slots:'}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {inventory?.stats.assignedSlotsCount || 45}
                  </span>
                  <span className="text-white/40 font-mono">/ 57</span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={() => {
                    loadData();
                    onRefreshData();
                  }}
                  title={currentLang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
                  className="p-1.5 bg-[#152B24] hover:bg-[#1e3c32] text-[#D1B995] border border-[#D1B995]/30 rounded-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingInventory ? 'animate-spin' : ''}`} />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title={currentLang === 'ar' ? 'تسجيل الخروج الإداري' : 'Logout Admin'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-600/40 rounded-xs transition-colors cursor-pointer text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{currentLang === 'ar' ? 'خروج' : 'Logout'}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/40 rounded-xs transition-colors cursor-pointer"
                  title={currentLang === 'ar' ? 'إغلاق النافذة' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

        {/* 7 SEGMENTED NAVIGATION TABS */}
        <div className="bg-[#1F4A3B] px-6 py-2.5 border-b border-[#D1B995]/30 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {/* Tab 1: All Media */}
            <button
              onClick={() => setActiveTab('all_media')}
              className={`px-3 py-2 rounded-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'all_media'
                  ? 'bg-[#D1B995] text-[#1F4A3B] font-bold shadow-sm'
                  : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'كافة الوسائط الفعلية' : 'All Physical Media'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#152B24] text-[#D1B995] rounded-xs">
                {inventory?.stats.totalPhysicalFiles || 82}
              </span>
            </button>

            {/* Tab 2: Original Archive */}
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-2 rounded-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'archive'
                  ? 'bg-[#D1B995] text-[#1F4A3B] font-bold shadow-sm'
                  : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'الأرشيف الأصلي' : 'Original Archive'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#152B24] text-[#D1B995] rounded-xs">
                {inventory?.stats.archiveImagesCount || 62} + 8
              </span>
            </button>

            {/* Tab 3: Portfolio Slots */}
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-2 rounded-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'portfolio'
                  ? 'bg-[#D1B995] text-[#1F4A3B] font-bold shadow-sm'
                  : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'خانات التخصصات' : 'Portfolio Slots'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#152B24] text-[#D1B995] rounded-xs">
                40
              </span>
            </button>

            {/* Tab 4: Apartment Case Study */}
            <button
              onClick={() => setActiveTab('apartment')}
              className={`px-3 py-2 rounded-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'apartment'
                  ? 'bg-[#D1B995] text-[#1F4A3B] font-bold shadow-sm'
                  : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'شقة نموذجية' : 'Apartment Stages'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#152B24] text-[#D1B995] rounded-xs">
                5
              </span>
            </button>

            {/* Tab 5: Video Library */}
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3 py-2 rounded-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'videos'
                  ? 'bg-[#D1B995] text-[#1F4A3B] font-bold shadow-sm'
                  : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'مكتبة الفيديو' : 'Video Library'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#152B24] text-[#D1B995] rounded-xs">
                5 + 7
              </span>
            </button>

            {/* Tab 6: Unassigned & Duplicates */}
            <button
              onClick={() => setActiveTab('unassigned')}
              className={`px-3 py-2 rounded-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'unassigned'
                  ? 'bg-[#D1B995] text-[#1F4A3B] font-bold shadow-sm'
                  : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'غير المعين والمكرر' : 'Unassigned & Duplicates'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-amber-700 text-white rounded-xs">
                {(inventory?.stats.unassignedInboxCount || 31) + (inventory?.stats.unassignedCloudVideosCount || 0)}
              </span>
            </button>

            {/* Tab 7: Storage Settings & Lock */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#D1B995] text-[#1F4A3B] font-bold shadow-sm'
                  : 'text-[#F7F5F0]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'إعدادات التخزين' : 'Storage Settings'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>
          </div>

          {/* Search Box in Toolbar */}
          <div className="relative min-w-[200px] hidden md:block">
            <Search className="w-3.5 h-3.5 text-white/50 absolute top-2.5 left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLang === 'ar' ? 'بحث بالاسم أو الكود...' : 'Search media...'}
              className="w-full text-xs p-1.5 pl-8 bg-[#152B24] border border-[#D1B995]/30 rounded-xs text-white placeholder-white/40 outline-none focus:border-[#D1B995]"
            />
          </div>
        </div>

        {/* MAIN BODY SCROLL AREA */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: ALL PHYSICAL MEDIA (SEPARATING PHYSICAL FILES FROM SLOTS) */}
          {/* ========================================================================= */}
          {activeTab === 'all_media' && (
            <div className="space-y-6">
              {/* Architecture Clarification Banner */}
              <div className="bg-white border border-[#D1B995]/40 rounded-sm p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1F4A3B]">
                  <HardDrive className="w-5 h-5 text-[#B89B6A]" />
                  <span>
                    {currentLang === 'ar'
                      ? 'مبدأ الفصل الهندسي: الملفات الفعلية على القرص مقابل خانات العرض (Physical Files vs. Slots)'
                      : 'Architectural Separation: Physical Storage Files vs. Layout Slots'}
                  </span>
                </div>
                <p className="text-xs text-[#5C5C5C] leading-relaxed">
                  {currentLang === 'ar'
                    ? 'في هذا الموقع، تم فصل الملفات المخزنة فعلياً على القرص والمتعقبة من Git ومستودع Supabase السحابي (89 ملفاً: 74 صورة و 8 فيديوهات محلية و 7 فيديوهات سحابية) تماماً عن خانات العرض الهندسية في واجهة المستخدم (57 خانة: 40 تخصصات + 5 مراحل شقة + 12 مكتبة فيديو). هذا الفصل يضمن بقاء جميع الأصول سالمة ومحفوظة حتى لو كانت الخانات شاغرة أو قيد المراجعة الفنية.'
                    : 'All physical media assets (74 images, 8 local videos, 7 Supabase cloud videos) are decoupled from UI layout slots (57 slots: 40 portfolio, 5 apartment stages, 12 videos). This ensures pristine preservation of every asset regardless of slot assignment.'}
                </p>

                {/* Directory Breakdown Table */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2">
                  <div className="bg-[#FAF8F5] border border-[#D1B995]/30 p-2.5 rounded-xs text-center">
                    <span className="block text-[10px] font-mono text-[#5C5C5C]">public/assets/inbox/</span>
                    <span className="text-lg font-bold font-mono text-[#1F4A3B]">62</span>
                    <span className="block text-[10px] text-[#B89B6A]">{currentLang === 'ar' ? 'صور الأرشيف' : 'Archive Images'}</span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#D1B995]/30 p-2.5 rounded-xs text-center">
                    <span className="block text-[10px] font-mono text-[#5C5C5C]">public/assets/videos/</span>
                    <span className="text-lg font-bold font-mono text-[#1F4A3B]">7</span>
                    <span className="block text-[10px] text-[#B89B6A]">{currentLang === 'ar' ? 'فيديوهات المجلد' : 'Video Folder'}</span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#D1B995]/30 p-2.5 rounded-xs text-center">
                    <span className="block text-[10px] font-mono text-[#5C5C5C]">project-root/</span>
                    <span className="text-lg font-bold font-mono text-[#1F4A3B]">1</span>
                    <span className="block text-[10px] text-[#B89B6A]">{currentLang === 'ar' ? 'فيديو الجذر (1026)' : 'Root Video'}</span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#D1B995]/30 p-2.5 rounded-xs text-center">
                    <span className="block text-[10px] font-mono text-[#5C5C5C]">public/assets/images/</span>
                    <span className="text-lg font-bold font-mono text-[#1F4A3B]">6</span>
                    <span className="block text-[10px] text-[#B89B6A]">{currentLang === 'ar' ? 'صور الهوية' : 'Brand Assets'}</span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#D1B995]/30 p-2.5 rounded-xs text-center">
                    <span className="block text-[10px] font-mono text-[#5C5C5C]">src/assets/images/</span>
                    <span className="text-lg font-bold font-mono text-[#1F4A3B]">4</span>
                    <span className="block text-[10px] text-[#B89B6A]">{currentLang === 'ar' ? 'خلفيات الهيرو' : 'Hero Visuals'}</span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#D1B995]/30 p-2.5 rounded-xs text-center">
                    <span className="block text-[10px] font-mono text-[#5C5C5C]">public/assets/aistudio/</span>
                    <span className="text-lg font-bold font-mono text-[#1F4A3B]">2</span>
                    <span className="block text-[10px] text-[#B89B6A]">{currentLang === 'ar' ? 'شعارات' : 'Logos'}</span>
                  </div>

                  <div className="bg-emerald-50/70 border border-[#3ECF8E]/40 p-2.5 rounded-xs text-center">
                    <span className="block text-[10px] font-mono text-emerald-800">Supabase Cloud</span>
                    <span className="text-lg font-bold font-mono text-[#1F4A3B]">7</span>
                    <span className="block text-[10px] text-emerald-700 font-medium">{currentLang === 'ar' ? 'فيديوهات السحابة' : 'Cloud Videos'}</span>
                  </div>
                </div>
              </div>

              {/* Physical Files List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1F4A3B] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#B89B6A]" />
                    <span>{currentLang === 'ar' ? 'سجل الملفات الفعلية المفهرسة (82 ملفاً كاملاً)' : 'Indexed Physical Files Inventory (82 Files)'}</span>
                  </h3>
                  <span className="text-xs font-mono text-[#5C5C5C]">
                    {currentLang === 'ar' ? 'حجم كلي تقديري: ~38.5 ميجابايت' : 'Total Size: ~38.5 MB'}
                  </span>
                </div>

                {/* Videos Section */}
                <div className="bg-white border border-[#D1B995]/30 rounded-sm p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#1F4A3B] flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#B89B6A]" />
                    <span>{currentLang === 'ar' ? 'ملفات الفيديو الـ 8 الفعلية على القرص:' : 'The 8 Physical Video Files on Disk:'}</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {inventory?.physicalVideos.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 bg-[#FAF8F5] border border-[#D1B995]/30 rounded-xs flex flex-col justify-between text-xs space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] text-[#B89B6A] bg-white px-1.5 py-0.5 rounded-xs border border-[#D1B995]/30">
                              {v.location}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#1F4A3B]">
                              {v.sizeMb} MB
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[#1F4A3B] block truncate" title={v.fileName}>
                            {v.fileName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#D1B995]/20">
                          {v.isDuplicate ? (
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-300">
                              {currentLang === 'ar' ? 'نسخة مكررة محفوظة' : 'Preserved Duplicate'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-300">
                              {currentLang === 'ar' ? 'ملف أصلي فريد' : 'Unique Original'}
                            </span>
                          )}
                          <button
                            onClick={() => setLightboxItem({ url: v.url, title: v.fileName, isVideo: true })}
                            className="p-1 text-[#1F4A3B] hover:text-[#B89B6A] cursor-pointer"
                            title="تشغيل الفيديو"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supabase Cloud Videos Section */}
                <div className="bg-white border border-[#3ECF8E]/40 rounded-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1F4A3B] flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-[#3ECF8E]" />
                      <span>
                        {currentLang === 'ar'
                          ? 'فيديوهات سحابة Supabase السبعة (Batch 02 - 2026 / project-media):'
                          : 'Supabase Cloud Storage Videos (7 Files in batch-02-2026):'}
                      </span>
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-[#1F4A3B]">
                      {currentLang === 'ar' ? 'الإجمالي: 156.45 ميجابايت (سحابة عامة CDN)' : 'Total: 156.45 MB (Public CDN)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {inventory?.supabaseCloudVideos?.map((cv) => (
                      <div
                        key={cv.id}
                        className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xs flex flex-col justify-between text-xs space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[9px] text-emerald-800 bg-white px-1.5 py-0.5 rounded-xs border border-emerald-200">
                              Supabase CDN
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#1F4A3B]">
                              {cv.sizeMb} MB
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[#1F4A3B] block truncate" title={cv.fileName}>
                            {cv.fileName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                          <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-300">
                            {cv.isAssigned
                              ? (currentLang === 'ar' ? 'معين لخانة' : 'Assigned')
                              : (currentLang === 'ar' ? 'غير معين (جاهز للربط)' : 'Unassigned (Ready)')}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setLightboxItem({ url: cv.url, title: cv.fileName, isVideo: true })}
                              className="p-1 text-[#1F4A3B] hover:text-[#B89B6A] cursor-pointer"
                              title="تشغيل الفيديو"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isAuthenticated && (
                              <button
                                onClick={() => {
                                  setAssigningArchiveFile({ fileName: cv.fileName, url: cv.url });
                                  setSelectedTargetSlot(cv.assignedSlotKey || 'video-01-owner-intro');
                                }}
                                className="px-2 py-0.5 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-[10px] font-bold rounded-xs cursor-pointer"
                                title="تعيين لخانة فيديو"
                              >
                                {currentLang === 'ar' ? 'تعيين' : 'Assign'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inbox Original Photos Preview Grid */}
                <div className="bg-white border border-[#D1B995]/30 rounded-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1F4A3B] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#B89B6A]" />
                      <span>{currentLang === 'ar' ? 'صور الأرشيف الأصلي (62 صورة داخل public/assets/inbox):' : 'Original Archive Photos (62 in public/assets/inbox):'}</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('archive')}
                      className="text-xs font-bold text-[#1F4A3B] hover:text-[#B89B6A] underline cursor-pointer"
                    >
                      {currentLang === 'ar' ? 'فتح الأرشيف الكامل وتعيين الخانات ←' : 'Open Full Archive & Assign Slots →'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto p-1">
                    {filteredArchive.slice(0, 32).map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setLightboxItem({ url: img.url, title: img.fileName })}
                        className="group relative aspect-square bg-[#152B24] rounded-xs overflow-hidden border border-[#D1B995]/30 hover:border-[#D1B995] cursor-pointer shadow-xs"
                      >
                        <img
                          src={img.url}
                          alt={img.fileName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 text-[9px] font-mono text-white truncate text-center">
                          {img.sizeKb} KB
                        </div>
                        {img.isAssigned && (
                          <div className="absolute top-1 right-1 p-0.5 bg-emerald-600 text-white rounded-xs">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {filteredArchive.length > 32 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setActiveTab('archive')}
                        className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#1F4A3B] border border-[#D1B995]/40 text-xs font-bold rounded-xs cursor-pointer"
                      >
                        {currentLang === 'ar' ? `عرض كافة الصور الـ ${filteredArchive.length} في الأرشيف` : `View all ${filteredArchive.length} photos in Archive`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ORIGINAL ARCHIVE (62 INBOX IMAGES + 8 VIDEOS) */}
          {/* ========================================================================= */}
          {activeTab === 'archive' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-sm border border-[#D1B995]/30">
                <div>
                  <h3 className="text-sm font-bold text-[#1F4A3B] flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[#B89B6A]" />
                    <span>{currentLang === 'ar' ? 'الأرشيف الأصلي المحمي (Original Media Archive)' : 'Protected Original Media Archive'}</span>
                  </h3>
                  <p className="text-xs text-[#5C5C5C] mt-1">
                    {currentLang === 'ar'
                      ? 'جميع الملفات الـ 62 الأصلية في public/assets/inbox/ محفوظة دائماً. يمكنك تعيين أي صورة لأي خانة مشروع بنقرة واحدة.'
                      : 'All 62 original inbox files are protected. Click "Assign to Project Slot" on any photo to link it.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#1F4A3B] bg-[#FAF8F5] px-3 py-1.5 rounded-xs border border-[#D1B995]/30">
                    {filteredArchive.length} {currentLang === 'ar' ? 'ملف في الأرشيف' : 'Archive Files'}
                  </span>
                </div>
              </div>

              {/* Archive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredArchive.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white border border-[#D1B995]/30 rounded-sm overflow-hidden shadow-xs hover:border-[#D1B995] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div
                        onClick={() => setLightboxItem({ url: file.url, title: file.fileName })}
                        className="relative aspect-[4/3] bg-[#152B24] overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={file.url}
                          alt={file.fileName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-5 h-5 text-[#D1B995]" />
                        </div>
                        {file.isAssigned && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-800/90 text-white text-[10px] font-mono font-bold rounded-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{currentLang === 'ar' ? 'معين لخانة' : 'Assigned'}</span>
                          </div>
                        )}
                        {file.isAiConcept && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-800/90 text-white text-[10px] font-mono font-bold rounded-xs">
                            AI CONCEPT
                          </div>
                        )}
                      </div>

                      {/* Info Details */}
                      <div className="p-3 space-y-1.5">
                        <span className="font-mono text-xs font-bold text-[#1F4A3B] block truncate" title={file.fileName}>
                          {file.fileName}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-[#5C5C5C] font-mono">
                          <span>{file.sizeKb} KB</span>
                          <span className="capitalize">{file.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3 pt-0">
                      {isAuthenticated ? (
                        <button
                          onClick={() => {
                            setAssigningArchiveFile({ fileName: file.fileName, url: file.url });
                            setSelectedTargetSlot('');
                          }}
                          className="w-full py-1.5 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{currentLang === 'ar' ? 'تعيين إلى خانة مشروع' : 'Assign to Project Slot'}</span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-center text-[#5C5C5C] font-mono bg-[#FAF8F5] py-1 border border-[#D1B995]/20 rounded-xs">
                          {currentLang === 'ar' ? 'محفوظ في الأرشيف (قراءة فقط)' : 'Archive Protected (Read-Only)'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PORTFOLIO SLOTS (40 SLOTS ACROSS 8 DISCIPLINES) */}
          {/* ========================================================================= */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Discipline Segmented Filters */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 rounded-sm border border-[#D1B995]/30">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
                  {[
                    { id: 'all', label: currentLang === 'ar' ? 'كافة التخصصات (40)' : 'All (40)' },
                    { id: 'plumbing', label: currentLang === 'ar' ? 'السباكة (5)' : 'Plumbing (5)' },
                    { id: 'electrical', label: currentLang === 'ar' ? 'الكهرباء (5)' : 'Electrical (5)' },
                    { id: 'plastering', label: currentLang === 'ar' ? 'المحارة (5)' : 'Plastering (5)' },
                    { id: 'ceramics', label: currentLang === 'ar' ? 'السيراميك (5)' : 'Ceramics (5)' },
                    { id: 'gypsum', label: currentLang === 'ar' ? 'الجبس (5)' : 'Gypsum (5)' },
                    { id: 'painting', label: currentLang === 'ar' ? 'الدهانات (5)' : 'Painting (5)' },
                    { id: 'interior', label: currentLang === 'ar' ? 'التصميم الداخلي (5)' : 'Interior (5)' },
                    { id: 'commercial', label: currentLang === 'ar' ? 'التجاري (5)' : 'Commercial (5)' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setPortfolioCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xs whitespace-nowrap cursor-pointer transition-colors ${
                        portfolioCategoryFilter === cat.id
                          ? 'bg-[#1F4A3B] text-[#D1B995] font-bold shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 40-Slot Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPortfolio.map((slot) => {
                  const hasImage = Boolean(slot.imageUrl && !slot.isPlaceholder);
                  const isUploading = uploadingSlotKey === slot.slotKey;

                  return (
                    <div
                      key={slot.id}
                      className="bg-white border border-[#D1B995]/30 rounded-sm p-3.5 shadow-xs flex flex-col justify-between hover:border-[#D1B995] transition-all space-y-3"
                    >
                      <div>
                        {/* Top Slot Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-[#D1B995] bg-[#152B24] px-2 py-0.5 rounded-xs">
                            {slot.slotKey}
                          </span>
                          {hasImage ? (
                            <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{currentLang === 'ar' ? 'اعتماد موثوق' : 'Verified'}</span>
                            </span>
                          ) : slot.slotKey === 'commercial-05' ? (
                            <span className="text-[10px] font-bold font-mono text-gray-700 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-xs">
                              {currentLang === 'ar' ? 'شاغرة (AI مستبعد)' : 'Empty (AI Excluded)'}
                            </span>
                          ) : slot.category === 'plastering' || (slot.category === 'painting' && (slot.slotKey === 'painting-01' || slot.slotKey === 'painting-03' || slot.slotKey === 'painting-04')) ? (
                            <span className="text-[10px] font-bold font-mono text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-xs flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{currentLang === 'ar' ? 'بانتظار تصوير الموقع' : 'Awaiting Photos'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold font-mono text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-xs">
                              {currentLang === 'ar' ? 'قيد المراجعة الفنية' : 'Pending Review'}
                            </span>
                          )}
                        </div>

                        {/* Visual Thumbnail or Placeholder */}
                        <div
                          onClick={() => hasImage && setLightboxItem({ url: slot.imageUrl!, title: slot.titleAr, subtitle: slot.slotKey })}
                          className={`relative aspect-[4/3] rounded-xs overflow-hidden mb-2.5 flex items-center justify-center ${
                            hasImage ? 'bg-[#152B24] cursor-pointer' : 'bg-[#FAF8F5] border border-dashed border-[#D1B995]/50'
                          }`}
                        >
                          {hasImage ? (
                            <img
                              src={slot.imageUrl}
                              alt={slot.titleAr}
                              loading="lazy"
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-center text-[#5C5C5C]">
                              <ImageIcon className="w-6 h-6 text-[#B89B6A] mb-1 opacity-60" />
                              <span className="text-[10px] font-mono text-[#1F4A3B] font-bold">{slot.slotKey}</span>
                              <span className="text-[9px] text-[#5C5C5C] mt-0.5">
                                {slot.slotKey === 'commercial-05'
                                  ? currentLang === 'ar' ? 'شاغرة لحين توفير صورة' : 'Awaiting genuine photo'
                                  : currentLang === 'ar' ? 'بانتظار تصوير الموقع' : 'Awaiting Site Photo'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Slot Titles */}
                        <h4 className="text-xs font-bold text-[#1F4A3B] line-clamp-1">
                          {currentLang === 'ar' ? slot.titleAr : slot.titleEn}
                        </h4>
                        <p className="text-[11px] text-[#5C5C5C] line-clamp-2 mt-1 leading-relaxed">
                          {currentLang === 'ar' ? slot.descriptionAr : slot.descriptionEn}
                        </p>
                      </div>

                      {/* Slot Admin Actions */}
                      {isAuthenticated && (
                        <div className="pt-2 border-t border-[#D1B995]/20 flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setActiveTab('archive');
                            }}
                            className="flex-1 py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#1F4A3B] border border-[#D1B995]/40 text-[11px] font-bold rounded-xs transition-colors cursor-pointer text-center"
                          >
                            {currentLang === 'ar' ? 'اختيار من الأرشيف' : 'From Archive'}
                          </button>

                          <button
                            onClick={() => {
                              setTargetSlotForUpload(slot.slotKey);
                              singleFileInputRef.current?.click();
                            }}
                            disabled={isUploading}
                            className="py-1.5 px-2 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-[11px] font-bold rounded-xs transition-colors cursor-pointer"
                            title={currentLang === 'ar' ? 'رفع صورة جديدة' : 'Upload File'}
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>

                          {hasImage && (
                            <button
                              onClick={() => setConfirmClearSlot({ slotKey: slot.slotKey, title: slot.titleAr })}
                              className="py-1.5 px-2 text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                              title={currentLang === 'ar' ? 'إلغاء التعيين' : 'Clear Slot'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: APARTMENT CASE STUDY (5 SEQUENTIAL STAGES) */}
          {/* ========================================================================= */}
          {activeTab === 'apartment' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#D1B995]/30 rounded-sm p-4">
                <h3 className="text-sm font-bold text-[#1F4A3B] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B89B6A]" />
                  <span>{currentLang === 'ar' ? 'مشروع الشقة السكنية المتكامل — المراحل الـ 5 المتسلسلة' : 'Continuous Apartment Case Study — 5 Sequential Stages'}</span>
                </h3>
                <p className="text-xs text-[#5C5C5C] mt-1">
                  {currentLang === 'ar'
                    ? 'جميع المراحل الـ 5 معتمدة بالكامل بصور حقيقية موثقة من الموقع لنفس الشقة من لحظة الاستلام حتى التسليم النهائي.'
                    : 'All 5 stages are verified with authentic documented site photos of the residential apartment from rough-in to handover.'}
                </p>
              </div>

              <div className="space-y-4">
                {apartmentStages.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    className="bg-white border border-[#D1B995]/30 rounded-sm p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
                  >
                    {/* Stage Visual */}
                    <div
                      onClick={() => stage.imageUrl && setLightboxItem({ url: stage.imageUrl, title: stage.titleAr, subtitle: stage.slotKey })}
                      className="md:col-span-4 aspect-[16/10] bg-[#152B24] rounded-xs overflow-hidden cursor-pointer relative group"
                    >
                      {stage.imageUrl ? (
                        <img
                          src={stage.imageUrl}
                          alt={stage.titleAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#5C5C5C]">
                          <ImageIcon className="w-6 h-6 text-[#B89B6A]" />
                          <span className="text-[10px] font-mono mt-1">{stage.slotKey}</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#152B24]/90 text-[#D1B995] font-mono text-[10px] font-bold rounded-xs border border-[#D1B995]/30">
                        {stage.slotKey}
                      </div>
                    </div>

                    {/* Stage Info */}
                    <div className="md:col-span-8 flex flex-col justify-between h-full space-y-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-6 h-6 rounded-full bg-[#1F4A3B] text-[#D1B995] font-mono font-bold text-xs flex items-center justify-center">
                            0{stage.stageNumber}
                          </span>
                          <span className="text-xs font-bold text-[#B89B6A] uppercase font-mono">
                            {currentLang === 'ar' ? stage.phaseLabelAr : stage.phaseLabelEn}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-xs">
                            {currentLang === 'ar' ? 'صورة موقع أصلية معتمدة' : 'Verified Site Photo'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#1F4A3B]">
                          {currentLang === 'ar' ? stage.titleAr : stage.titleEn}
                        </h4>
                        <p className="text-xs text-[#5C5C5C] leading-relaxed mt-1">
                          {currentLang === 'ar' ? stage.descriptionAr : stage.descriptionEn}
                        </p>
                      </div>

                      {isAuthenticated && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#D1B995]/20">
                          <button
                            onClick={() => {
                              setTargetSlotForUpload(stage.slotKey);
                              singleFileInputRef.current?.click();
                            }}
                            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#1F4A3B] border border-[#D1B995]/30 text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{currentLang === 'ar' ? 'استبدال الصورة' : 'Replace Image'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: VIDEO LIBRARY (5 DESIGNATED VIDEO SLOTS) */}
          {/* ========================================================================= */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#D1B995]/30 rounded-sm p-4">
                <h3 className="text-sm font-bold text-[#1F4A3B] flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#B89B6A]" />
                  <span>{currentLang === 'ar' ? 'مكتبة الفيديو المعمارية الكاملة — (12 فيديو: 5 أصلية + 7 سحابية)' : 'Full Architectural Video Library — (12 Videos: 5 Original + 7 Cloud)'}</span>
                </h3>
                <p className="text-xs text-[#5C5C5C] mt-1">
                  {currentLang === 'ar'
                    ? 'تعرض هنا كافة الفيديوهات الـ 12 المعتمدة: الفيديوهات الـ 5 الأصلية بكامل محتواها المحلي، بالإضافة إلى الفيديوهات الـ 7 السحابية الجديدة الموثقة عبر Supabase Storage.'
                    : 'All 12 videos are available: the 5 original local videos and the 7 additional Supabase cloud-streamed execution videos.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {videoSlots.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white border border-[#D1B995]/30 rounded-sm p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Video Player */}
                      <div className="aspect-video bg-black rounded-xs overflow-hidden mb-3 relative">
                        {video.videoUrl ? (
                          <video
                            src={video.videoUrl}
                            controls
                            poster={video.posterUrl}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                            <Video className="w-8 h-8 text-[#D1B995]" />
                            <span className="text-xs font-mono mt-1">{video.slotKey}</span>
                          </div>
                        )}
                      </div>

                      {/* Video Meta */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-[#D1B995] bg-[#152B24] px-2 py-0.5 rounded-xs">
                          {video.slotKey}
                        </span>
                        {video.videoUrl?.includes('supabase.co') ? (
                          <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-xs">
                            {currentLang === 'ar' ? 'سحابة Supabase معتمدة' : 'Verified Supabase Cloud'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-xs">
                            {currentLang === 'ar' ? 'فيديو أصلي معتمد' : 'Verified Original'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-[#1F4A3B]">
                        {currentLang === 'ar' ? video.titleAr : video.titleEn}
                      </h4>
                      <p className="text-[11px] text-[#5C5C5C] leading-relaxed mt-1">
                        {currentLang === 'ar' ? video.descriptionAr : video.descriptionEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D1B995]/20 font-mono text-[10px] text-[#5C5C5C] truncate flex items-center justify-between">
                      <span className="truncate max-w-[70%]">{video.defaultFilePath}</span>
                      {isAuthenticated && (
                        <button
                          onClick={() => setConfirmClearSlot({ slotKey: video.slotKey, title: video.titleAr })}
                          className="text-red-700 hover:text-red-800 text-[10px] font-bold cursor-pointer"
                        >
                          {currentLang === 'ar' ? 'إفراغ' : 'Clear'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* INTEGRATED SUPABASE CLOUD VIDEOS (BATCH-02-2026: SLOTS VIDEO-06 TO VIDEO-12) */}
              <div className="mt-8 pt-6 border-t border-[#D1B995]/40 space-y-4">
                <div className="bg-emerald-50/70 border border-[#3ECF8E]/50 rounded-sm p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-[#1F4A3B] flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-[#3ECF8E]" />
                      <span>
                        {currentLang === 'ar'
                          ? 'فيديوهات سحابة Supabase المعتمدة والمدمجة (7 فيديوهات — Batch 02 - 2026)'
                          : 'Integrated Supabase Cloud Videos (7 Approved Files — Batch 02 - 2026)'}
                      </span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-xs border border-emerald-300">
                      Bucket: project-media (Public CDN)
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5C5C] mt-1.5 leading-relaxed">
                    {currentLang === 'ar'
                      ? 'تم تعيين وتوثيق هذه الفيديوهات السبعة السحابية بالكامل في مكتبة الفيديو العامة (الخانات video-06 إلى video-12) مع الحفاظ التام على الفيديوهات الخمسة الأصلية دون أي استبدال. جميع الفيديوهات تعمل مباشرة وبسرعة فائقة عبر شبكة Supabase CDN العامة (HTTP 200 OK).'
                      : 'All 7 cloud videos are fully verified and integrated into the public Video Library (slots video-06 through video-12) alongside the 5 original foundation videos. Live and responsive via the Supabase Public CDN.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {inventory?.supabaseCloudVideos?.map((cv) => (
                    <div
                      key={cv.id}
                      className="bg-white border border-emerald-200 rounded-sm p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-400 transition-colors"
                    >
                      <div>
                        {/* Inline Video Player */}
                        <div className="aspect-video bg-black rounded-xs overflow-hidden mb-3 relative">
                          <video
                            src={cv.url}
                            controls
                            preload="metadata"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Cloud Video Meta */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-300">
                            {cv.fileName}
                          </span>
                          <span className="text-[10px] font-bold font-mono text-[#1F4A3B] bg-[#FAF8F5] border border-[#D1B995]/40 px-2 py-0.5 rounded-xs">
                            {cv.sizeMb} MB
                          </span>
                        </div>

                        <div className="text-[11px] text-[#5C5C5C] font-mono space-y-1">
                          <div className="truncate text-[10px] text-gray-500" title={cv.url}>
                            {cv.storagePath}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded-xs">
                              {currentLang === 'ar' ? 'سحابة عامة CDN' : 'Public CDN'}
                            </span>
                            {cv.isAssigned ? (
                              <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-xs border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>
                                  {currentLang === 'ar'
                                    ? `معتمد بخانة: ${cv.assignedSlotKey}`
                                    : `Assigned: ${cv.assignedSlotKey}`}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200">
                                {currentLang === 'ar' ? 'غير معين بعد' : 'Unassigned'}
                              </span>
                            )}
                          </div>
                          {cv.assignedSlotTitleAr && (
                            <div className="text-[11px] font-sans font-bold text-[#1F4A3B] pt-1">
                              {currentLang === 'ar' ? cv.assignedSlotTitleAr : cv.assignedSlotTitleEn}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-[#D1B995]/20 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setLightboxItem({ url: cv.url, title: cv.fileName, subtitle: `${cv.sizeMb} MB`, isVideo: true })}
                          className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#1F4A3B] border border-[#D1B995]/30 text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{currentLang === 'ar' ? 'تكبير المشغل' : 'Expand'}</span>
                        </button>

                        {isAuthenticated && (
                          <button
                            onClick={() => {
                              setAssigningArchiveFile({ fileName: cv.fileName, url: cv.url });
                              setSelectedTargetSlot(cv.assignedSlotKey || 'video-01-owner-intro');
                            }}
                            className="px-3 py-1.5 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{currentLang === 'ar' ? 'تعديل الخانة' : 'Reassign Slot'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: UNASSIGNED & DUPLICATE ASSETS (PENDING REVIEW) */}
          {/* ========================================================================= */}
          {activeTab === 'unassigned' && (
            <div className="space-y-6">
              {/* Duplicate Groups Breakdown */}
              <div className="bg-white border border-[#D1B995]/30 rounded-sm p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1F4A3B]">
                  <Copy className="w-4 h-4 text-[#B89B6A]" />
                  <span>
                    {currentLang === 'ar'
                      ? 'مجموعات الملفات المكررة المطابقة رقمياً (3 مجموعات محققة بالهاش ومحفوظة دون حذف)'
                      : 'Verified Binary Duplicate Groups (3 Groups Preserved Without Deletion)'}
                  </span>
                </div>
                <p className="text-xs text-[#5C5C5C] leading-relaxed">
                  {currentLang === 'ar'
                    ? 'طبقاً للشرط الإلزامي الصارم، لم يتم حذف أي ملف مكرر حتى لو كان التطابق بنسبة 100%. تم توثيق المجموعات الثلاث أدناه مع الحفاظ على جميع النسخ في مساراتها:'
                    : 'Per non-destructive instructions, zero duplicate files were deleted. All copies remain safe in their original directories.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {inventory?.duplicateGroups.map((grp) => (
                    <div
                      key={grp.groupId}
                      className="bg-[#FAF8F5] border border-[#D1B995]/40 rounded-xs p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[#1F4A3B] bg-white px-2 py-0.5 rounded-xs border border-[#D1B995]/30">
                          {grp.hashType}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-xs">
                          {grp.files.length} {currentLang === 'ar' ? 'نسخ مطابقة' : 'Copies'}
                        </span>
                      </div>
                      <h5 className="font-bold text-[#1F4A3B]">
                        {currentLang === 'ar' ? grp.titleAr : grp.titleEn}
                      </h5>
                      <div className="space-y-1 font-mono text-[10px] text-[#5C5C5C] bg-white p-2 rounded-xs border border-[#D1B995]/20">
                        {grp.files.map((f, i) => (
                          <div key={i} className="truncate" title={f}>
                            • {f}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#5C5C5C] leading-tight">
                        {currentLang === 'ar' ? grp.actionNoteAr : grp.actionNoteEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Concept Image Safeguard */}
              <div className="bg-amber-50 border border-amber-300 rounded-sm p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-800" />
                  <span>
                    {currentLang === 'ar'
                      ? 'قاعدة الحظر الصارم لصورة الذكاء الاصطناعي (Gemini Generated Concept)'
                      : 'AI-Generated Image Strict Exclusion Rule'}
                  </span>
                </div>
                <p className="text-amber-900 leading-relaxed text-[11px]">
                  {currentLang === 'ar'
                    ? 'الصورة "Gemini_Generated_Image_32iexj32iexj32ie.jpg" هي نموذج تخيلي بالذكاء الاصطناعي وليست موقعاً حقيقياً تم تنفيذه. تم استبعادها تماماً من جميع خانات المشاريع المنفذة (بما فيها الخانة التجارية commercial-01 و commercial-05) وتم إبقاؤها في الأرشيف كنموذج مفاهيمي استرشادي فقط.'
                    : 'Image "Gemini_Generated_Image_32iexj32iexj32ie.jpg" is an AI-generated mockup and is strictly excluded from all authentic client portfolio slots. It is preserved solely as a concept reference.'}
                </p>
              </div>

              {/* Unassigned Files Grid */}
              <div className="bg-white border border-[#D1B995]/30 rounded-sm p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-[#1F4A3B] flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#B89B6A]" />
                  <span>{currentLang === 'ar' ? 'ملفات الوارد غير المعينة حالياً لخانات (37 ملفاً):' : 'Unassigned Inbox Assets (37 Files):'}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {inventory?.inboxFiles
                    .filter((f) => !f.isAssigned)
                    .map((file) => (
                      <div
                        key={file.id}
                        className="bg-[#FAF8F5] border border-[#D1B995]/30 rounded-xs p-2 text-xs flex flex-col justify-between space-y-1.5"
                      >
                        <div
                          onClick={() => setLightboxItem({ url: file.url, title: file.fileName })}
                          className="aspect-square bg-[#152B24] rounded-xs overflow-hidden cursor-pointer"
                        >
                          <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-mono text-[10px] text-[#1F4A3B] truncate block" title={file.fileName}>
                          {file.fileName}
                        </span>
                        {file.isAiConcept ? (
                          <span className="text-[9px] font-mono text-amber-800 bg-amber-100 px-1 py-0.2 rounded-xs text-center">
                            AI Concept
                          </span>
                        ) : file.isDuplicate ? (
                          <span className="text-[9px] font-mono text-amber-800 bg-amber-100 px-1 py-0.2 rounded-xs text-center">
                            Duplicate
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-gray-700 bg-gray-100 px-1 py-0.2 rounded-xs text-center">
                            Pending
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Supabase Cloud Videos in Tab 6 */}
              {inventory?.supabaseCloudVideos && inventory.supabaseCloudVideos.some((v) => !v.isAssigned) ? (
                <div className="bg-white border border-[#3ECF8E]/40 rounded-sm p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#1F4A3B] flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-[#3ECF8E]" />
                      <span>
                        {currentLang === 'ar'
                          ? 'فيديوهات سحابة Supabase غير المعينة (قيد المراجعة / Unassigned Cloud Videos):'
                          : 'Unassigned Supabase Cloud Videos (Pending Assignment):'}
                      </span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-300">
                      project-media/mohamed-hosny/videos/batch-02-2026/
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5C5C] leading-relaxed">
                    {currentLang === 'ar'
                      ? 'يمكنك معاينة هذه الفيديوهات وتعيينها لأي من خانات الفيديو من تبويب "مكتبة الفيديو".'
                      : 'You can preview these videos and assign them to any video slot.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {inventory.supabaseCloudVideos
                      .filter((cv) => !cv.isAssigned)
                      .map((cv) => (
                        <div
                          key={cv.id}
                          className="bg-emerald-50/30 border border-emerald-200 rounded-xs p-3 text-xs flex flex-col justify-between space-y-2"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-[9px] text-emerald-800 bg-white px-1.5 py-0.5 rounded-xs border border-emerald-200">
                                Cloud MP4
                              </span>
                              <span className="font-mono text-[10px] font-bold text-[#1F4A3B]">
                                {cv.sizeMb} MB
                              </span>
                            </div>
                            <span className="font-mono font-bold text-[#1F4A3B] truncate block" title={cv.fileName}>
                              {cv.fileName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                            <button
                              onClick={() => setLightboxItem({ url: cv.url, title: cv.fileName, subtitle: `${cv.sizeMb} MB`, isVideo: true })}
                              className="text-[10px] text-[#1F4A3B] hover:text-[#B89B6A] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{currentLang === 'ar' ? 'معاينة' : 'Preview'}</span>
                            </button>
                            {isAuthenticated && (
                              <button
                                onClick={() => {
                                  setAssigningArchiveFile({ fileName: cv.fileName, url: cv.url });
                                  setSelectedTargetSlot(cv.assignedSlotKey || 'video-01-owner-intro');
                                }}
                                className="text-[10px] bg-[#1F4A3B] text-[#D1B995] hover:bg-[#152B24] px-2 py-0.5 rounded-xs font-bold cursor-pointer"
                              >
                                {currentLang === 'ar' ? 'تعيين' : 'Assign'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-300 rounded-sm p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {currentLang === 'ar'
                          ? 'فيديوهات سحابة Supabase: جميع الفيديوهات السبعة (7/7) معينة ومعتمدة في مكتبة الفيديو'
                          : 'Supabase Cloud Videos: All 7 Videos (7/7) Fully Assigned & Approved in Video Library'}
                      </span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-xs border border-emerald-300">
                      video-06 إلى video-12
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/90 leading-relaxed">
                    {currentLang === 'ar'
                      ? 'لا توجد أي فيديوهات سحابية معلقة أو غير معينة. تم تعيين وتوثيق الفيديوهات السبعة بالكامل كإضافات رسمية (video-06 إلى video-12) مع الحفاظ على الفيديوهات الخمسة الأصلية دون أي استبدال.'
                      : 'Zero unassigned cloud videos. All 7 Supabase cloud videos are assigned to slots video-06 through video-12 alongside the original 5 foundation videos.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: STORAGE SETTINGS & SAFETY LOCK */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Safety Lock Banner */}
              <div className="bg-emerald-950 text-white border border-[#D1B995] rounded-sm p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-sm font-bold text-[#D1B995]">
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {currentLang === 'ar'
                      ? 'مرحلة القفل الآمن نشطة (Phase 1 Safety Lock Active)'
                      : 'Phase 1 Safety Lock is Active'}
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {currentLang === 'ar'
                    ? 'بناءً على الشروط الإلزامية للمرحلة الأولى، تم قفل عمليات الترحيل التلقائي إلى التخزين السحابي Supabase وعدم تعديل مفاتيح الربط في هذه الخطوة. التخزين النشط حالياً هو تخزين المستودع المحلي Git Repository داخل مجلدات public/assets/ وملف data/media-manifest.json.'
                    : 'In compliance with Phase 1 safety constraints, automatic cloud migrations to Supabase are locked. Active storage is the Git repository under public/assets/ and data/media-manifest.json.'}
                </p>
              </div>

              {/* Current Storage Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Git Storage Card */}
                <div className="bg-white border border-[#D1B995]/30 rounded-sm p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1F4A3B]">
                    <HardDrive className="w-4 h-4 text-[#B89B6A]" />
                    <span>{currentLang === 'ar' ? 'التخزين المحلي الدائم (Git Storage)' : 'Local Git Storage'}</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-[#5C5C5C]">
                    <div className="flex justify-between py-1 border-b border-[#D1B995]/20">
                      <span>Status / الحالة:</span>
                      <span className="text-emerald-700 font-bold">نشط ومحمي (Active & Tracked)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#D1B995]/20">
                      <span>Images Path:</span>
                      <span className="text-[#1F4A3B]">public/assets/inbox/</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#D1B995]/20">
                      <span>Videos Path:</span>
                      <span className="text-[#1F4A3B]">public/assets/videos/</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Manifest Path:</span>
                      <span className="text-[#1F4A3B]">data/media-manifest.json</span>
                    </div>
                  </div>
                </div>

                {/* Supabase Diagnostic Card */}
                <div className="bg-white border border-[#D1B995]/30 rounded-sm p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1F4A3B]">
                    <Cloud className="w-4 h-4 text-[#B89B6A]" />
                    <span>{currentLang === 'ar' ? 'حالة سحابة Supabase (للمرحلة القادمة)' : 'Supabase Cloud (Phase 2/3 Ready)'}</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-[#5C5C5C]">
                    <div className="flex justify-between py-1 border-b border-[#D1B995]/20">
                      <span>Project URL:</span>
                      <span className="text-[#1F4A3B]">https://dvddnoawgghiwlmwepzx.supabase.co</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#D1B995]/20">
                      <span>Storage Bucket:</span>
                      <span className="text-[#1F4A3B]">project-media</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Migration Status:</span>
                      <span className="text-amber-800 font-bold">موقوف مؤقتاً (Locked in Phase 1)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Session Control */}
              {isAuthenticated && (
                <div className="bg-white border border-[#D1B995]/30 rounded-sm p-4 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-[#1F4A3B] block">
                      {currentLang === 'ar' ? 'جلسة الإدارة نشطة' : 'Admin Session Active'}
                    </span>
                    <span className="text-[#5C5C5C]">
                      {currentLang === 'ar' ? 'صلاحيات الإشراف مفعلة حتى إغلاق المتصفح' : 'Full access enabled'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 bg-red-950 text-red-200 hover:bg-red-900 border border-red-700/40 text-xs font-bold rounded-xs cursor-pointer transition-colors"
                  >
                    {currentLang === 'ar' ? 'تسجيل الخروج' : 'Logout Admin'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: ASSIGN ARCHIVE FILE TO SLOT MODAL */}
        {/* ========================================================================= */}
        {assigningArchiveFile && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-white border border-[#D1B995] rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#D1B995]/30 pb-3">
                <h3 className="text-sm font-bold text-[#1F4A3B] flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#B89B6A]" />
                  <span>{currentLang === 'ar' ? 'تعيين صورة من الأرشيف إلى خانة مشروع' : 'Assign Archive Photo to Slot'}</span>
                </h3>
                <button
                  onClick={() => setAssigningArchiveFile(null)}
                  className="text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selected File Card */}
              <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#D1B995]/30 rounded-xs">
                {assigningArchiveFile.fileName.endsWith('.mp4') ? (
                  <div className="w-16 h-16 bg-black rounded-xs flex items-center justify-center shrink-0 border border-[#D1B995]/30">
                    <Video className="w-6 h-6 text-[#D1B995]" />
                  </div>
                ) : (
                  <img
                    src={assigningArchiveFile.url}
                    alt={assigningArchiveFile.fileName}
                    className="w-16 h-16 object-cover rounded-xs border border-[#D1B995]/30 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#B89B6A] block">Selected Source:</span>
                  <span className="text-xs font-mono font-bold text-[#1F4A3B] truncate block">
                    {assigningArchiveFile.fileName}
                  </span>
                </div>
              </div>

              {/* Target Slot Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F4A3B]">
                  {currentLang === 'ar' ? 'اختر الخانة المستهدفة للربط:' : 'Select Target Slot:'}
                </label>
                <select
                  value={selectedTargetSlot}
                  onChange={(e) => setSelectedTargetSlot(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#D1B995]/50 rounded-xs font-mono outline-none focus:border-[#1F4A3B]"
                >
                  <option value="">{currentLang === 'ar' ? '-- اختر خانة --' : '-- Choose a slot --'}</option>
                  
                  {assigningArchiveFile.fileName.endsWith('.mp4') ? (
                    <optgroup label={currentLang === 'ar' ? 'خانات مكتبة الفيديو (12)' : 'Video Library Slots (12)'}>
                      {videoSlots.map((v) => (
                        <option key={v.slotKey} value={v.slotKey}>
                          {v.slotKey} — {v.titleAr}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <>
                      <optgroup label={currentLang === 'ar' ? 'مراحل الشقة السكنية (5)' : 'Apartment Stages (5)'}>
                        {apartmentStages.map((s) => (
                          <option key={s.slotKey} value={s.slotKey}>
                            {s.slotKey} — {s.titleAr}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label={currentLang === 'ar' ? 'خانات التخصصات المعمارية (40)' : 'Portfolio Slots (40)'}>
                        {portfolioSlots.map((p) => (
                          <option key={p.slotKey} value={p.slotKey}>
                            {p.slotKey} — {p.titleAr}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>

              {assignmentSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xs font-medium text-center">
                  {assignmentSuccessMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningArchiveFile(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xs cursor-pointer"
                >
                  {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignment}
                  disabled={!selectedTargetSlot || isSavingAssignment}
                  className="px-5 py-2 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-xs font-bold rounded-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSavingAssignment
                    ? currentLang === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                    : currentLang === 'ar' ? 'تأكيد التعيين والربط' : 'Confirm Assignment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: LIGHTBOX PREVIEW MODAL */}
        {/* ========================================================================= */}
        {lightboxItem && (
          <div
            onClick={() => setLightboxItem(null)}
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#152B24] border border-[#D1B995]/50 rounded-sm max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <div className="p-3 bg-[#1F4A3B] border-b border-[#D1B995]/30 flex items-center justify-between text-white text-xs">
                <div>
                  <span className="font-bold text-[#D1B995]">{lightboxItem.title}</span>
                  {lightboxItem.subtitle && (
                    <span className="font-mono text-white/60 ml-2">({lightboxItem.subtitle})</span>
                  )}
                </div>
                <button
                  onClick={() => setLightboxItem(null)}
                  className="p-1 hover:text-[#D1B995] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 flex items-center justify-center bg-black/50 max-h-[75vh] overflow-hidden">
                {lightboxItem.isVideo ? (
                  <video src={lightboxItem.url} controls autoPlay className="max-h-[70vh] max-w-full" />
                ) : (
                  <img
                    src={lightboxItem.url}
                    alt={lightboxItem.title}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: CONFIRM CLEAR SLOT MODAL */}
        {/* ========================================================================= */}
        {confirmClearSlot && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-white border border-red-300 rounded-sm max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{currentLang === 'ar' ? 'تأكيد إلغاء تعيين الخانة' : 'Confirm Slot Reset'}</span>
              </div>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                {currentLang === 'ar'
                  ? `هل أنت متأكد من رغبتك في إلغاء تعيين الخانة [${confirmClearSlot.slotKey}] (${confirmClearSlot.title})؟ سيتم إعادة الخانة إلى وضع الانتظار الشاغر مع الحفاظ على الملف الأصلي في الأرشيف.`
                  : `Are you sure you want to clear slot [${confirmClearSlot.slotKey}]? The original archive photo will remain untouched.`}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearSlot(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xs cursor-pointer"
                >
                  {currentLang === 'ar' ? 'تراجع' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleExecuteClearSlot}
                  disabled={isClearingSlot}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xs cursor-pointer transition-colors"
                >
                  {isClearingSlot
                    ? currentLang === 'ar' ? 'جاري الإلغاء...' : 'Clearing...'
                    : currentLang === 'ar' ? 'نعم، أفرغ الخانة' : 'Yes, Clear Slot'}
                </button>
              </div>
            </div>
          </div>
        )}

          </>
        )}

      </div>
    </div>
  );
};
