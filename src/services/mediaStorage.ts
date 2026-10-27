import { ApartmentStageSlot, PortfolioSlot, VideoSlot } from '../types';
import {
  APARTMENT_STAGES_MANIFEST,
  PORTFOLIO_SLOTS_MANIFEST,
  VIDEO_SLOTS_MANIFEST
} from '../config/assetsManifest';

const DB_NAME = 'MohamedHosnyMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

const LOCAL_STORAGE_APARTMENT = 'mh_apartment_override_v3';
const LOCAL_STORAGE_PORTFOLIO = 'mh_portfolio_override_v3';
const LOCAL_STORAGE_VIDEOS = 'mh_videos_override_v3';
const SESSION_STORAGE_TOKEN = 'mh_admin_bearer_token';

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slotKey' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store blob / base64 in IndexedDB for fast client-side caching
export async function storeMediaBlob(slotKey: string, dataUrl: string, fileName?: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      slotKey,
      dataUrl,
      fileName: fileName || `${slotKey}.jpg`,
      updatedAt: new Date().toISOString()
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB store error', err);
  }
}

// Get blob from IndexedDB
export async function getMediaBlob(slotKey: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(slotKey);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Delete blob from IndexedDB
export async function deleteMediaBlob(slotKey: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(slotKey);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore error
  }
}

// Clear all blobs
export async function clearAllMediaBlobs(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch {
    // Ignore error
  }
}

/**
 * Slot matching utility
 * Given a filename like 'plumbing-01.jpg', 'stage-02.png', or 'tiling-03.jpeg',
 * returns the best matching slotKey or null.
 */
export function matchFilenameToSlotKey(filename: string): string | null {
  const clean = filename.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Apartment Stages (1-5)
  for (let i = 1; i <= 5; i++) {
    const keys = [`apartmentstage0${i}`, `apartmentstage${i}`, `stage0${i}`, `stage${i}`];
    if (keys.some((k) => clean.includes(k))) {
      return `apartment-stage-0${i}`;
    }
  }

  // 2. Main Portfolio Categories (8 categories, 5 slots each)
  const categories = [
    { prefix: 'plumbing', aliases: ['plumbing', 'plumb', 'pipe', 'drain'] },
    { prefix: 'electrical', aliases: ['electrical', 'electric', 'elec', 'wire'] },
    { prefix: 'plastering', aliases: ['plastering', 'plaster', 'cement', 'wallprep'] },
    { prefix: 'tiling', aliases: ['tiling', 'tile', 'ceramics', 'ceramic', 'marble', 'porcelain'] },
    { prefix: 'gypsum', aliases: ['gypsum', 'ceiling', 'drywall', 'board'] },
    { prefix: 'painting', aliases: ['painting', 'paint', 'decor', 'finish'] },
    { prefix: 'interior', aliases: ['interior', 'design', 'furniture', 'joinery'] },
    { prefix: 'commercial', aliases: ['commercial', 'shop', 'retail', 'barber', 'office'] }
  ];

  for (const cat of categories) {
    for (let i = 1; i <= 5; i++) {
      const slot = `${cat.prefix}-0${i}`;
      if (clean.includes(`${cat.prefix}0${i}`) || clean.includes(`${cat.prefix}${i}`)) {
        return slot;
      }
      for (const alias of cat.aliases) {
        if (clean.includes(`${alias}0${i}`) || clean.includes(`${alias}${i}`)) {
          return slot;
        }
      }
    }
  }

  // 3. Videos
  const videoMatches = [
    { key: 'video-01-owner-intro', aliases: ['video01', 'video1', 'ownerintro', 'meetowner', 'intro'] },
    { key: 'video-02-client-interview', aliases: ['video02', 'video2', 'clientinterview', 'interview', 'barbershop'] },
    { key: 'video-03-finishing-process', aliases: ['video03', 'video3', 'finishingprocess', 'process', 'execution'] },
    { key: 'video-04-completed-apartment', aliases: ['video04', 'video4', 'completedapartment', 'walkthrough', 'apartmenttour'] },
    { key: 'video-05-commercial-project', aliases: ['video05', 'video5', 'commercialproject', 'shoptour'] }
  ];

  for (const vm of videoMatches) {
    if (vm.aliases.some((alias) => clean.includes(alias))) {
      return vm.key;
    }
  }

  return null;
}

// Convert a File to base64 Data URL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------------------------
// Secure Server Authentication (No PIN in client-side code)
// ----------------------------------------------------------------------

export function getAdminAuthToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_TOKEN);
  } catch {
    return null;
  }
}

export function setAdminAuthToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(SESSION_STORAGE_TOKEN, token);
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_TOKEN);
    }
  } catch {
    // ignore
  }
}

export async function loginAdmin(pin: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token) {
      setAdminAuthToken(data.token);
      return { success: true };
    }
    return { success: false, message: data.message || 'Invalid administrative PIN' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error during authentication' };
  }
}

export async function checkAdminAuth(): Promise<boolean> {
  const token = getAdminAuthToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setAdminAuthToken(null);
      return false;
    }
    const data = await res.json();
    if (!data.authenticated) {
      setAdminAuthToken(null);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  const token = getAdminAuthToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // ignore
    }
  }
  setAdminAuthToken(null);
}

// Helper to add auth header
function getAuthHeaders(): Record<string, string> {
  const token = getAdminAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ----------------------------------------------------------------------
// Server API Calls (Protected by Bearer Token)
// ----------------------------------------------------------------------

export async function uploadMediaToServer(
  slotKey: string,
  dataUrl: string,
  fileName: string
): Promise<{
  success: boolean;
  fileUrl?: string;
  storageType?: 'supabase' | 'local_fallback';
  warning?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotKey, dataUrl, fileName })
    });

    if (res.status === 401) {
      setAdminAuthToken(null);
      return {
        success: false,
        error: 'Session expired or unauthorized. Please log in again.'
      };
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Server returned ${res.status}`);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveSlotToServer(
  slotKey: string,
  url: string,
  fileName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/media/save-slot', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotKey, url, fileName })
    });
    if (res.status === 401) {
      setAdminAuthToken(null);
      return { success: false, error: 'Unauthorized' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSlotFromServer(slotKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/media/delete-slot', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotKey })
    });
    if (res.status === 401) {
      setAdminAuthToken(null);
      return { success: false, error: 'Unauthorized' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resetAllSlotsOnServer(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/media/reset-all', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ confirmResetAll: true })
    });
    if (res.status === 401) {
      setAdminAuthToken(null);
      return { success: false, error: 'Unauthorized' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchSupabaseStatus(): Promise<{
  connected: boolean;
  url: string | null;
  bucket: string;
  bucketExists?: boolean;
  usingFallback: boolean;
  message: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/settings/supabase-status');
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      connected: false,
      url: null,
      bucket: 'project-media',
      usingFallback: true,
      message: `Status check failed: ${err.message}`
    };
  }
}

export async function saveSupabaseSettings(settings: {
  supabaseUrl: string;
  supabaseKey: string;
  bucketName: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/settings/supabase', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function createSignedUploadUrl(
  slotKey: string,
  fileName: string,
  mimeType: string
): Promise<{
  success: boolean;
  signedUrl?: string;
  token?: string;
  path?: string;
  storageFilePath?: string;
  publicUrl?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/media/create-signed-upload-url', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotKey, fileName, mimeType })
    });
    if (res.status === 401) {
      setAdminAuthToken(null);
      return { success: false, error: 'Unauthorized' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function confirmDirectUpload(
  slotKey: string,
  fileName: string,
  publicUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/media/confirm-upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotKey, fileName, publicUrl })
    });
    if (res.status === 401) {
      setAdminAuthToken(null);
      return { success: false, error: 'Unauthorized' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function triggerBatchMigration(): Promise<{
  success: boolean;
  totalFiles?: number;
  verifiedCount?: number;
  results?: Array<{
    fileName: string;
    slotKey: string;
    sizeBytes: number;
    publicUrl: string;
    verified: boolean;
    error?: string;
  }>;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/media/migrate-existing-files', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.status === 401) {
      setAdminAuthToken(null);
      return { success: false, error: 'Unauthorized' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------------------------
// Manifest Synchronization (Ensures visitors across devices see media)
// ----------------------------------------------------------------------

const SUPABASE_CDN_MANIFEST_URL =
  'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/manifest/media-manifest.json';

export async function fetchAndApplyRemoteManifest(): Promise<{
  apartment: ApartmentStageSlot[];
  portfolio: PortfolioSlot[];
  videos: VideoSlot[];
}> {
  let slotsMap: Record<string, { url: string; fileName: string }> = {};

  try {
    // 1. Try fetching from server API
    const res = await fetch('/api/media/manifest');
    if (res.ok) {
      const data = await res.json();
      if (data && data.slots && Object.keys(data.slots).length > 0) {
        slotsMap = data.slots;
      }
    }
  } catch {
    // ignore
  }

  // 2. If server manifest is empty, try direct public Supabase CDN manifest
  if (Object.keys(slotsMap).length === 0) {
    try {
      const cdnRes = await fetch(SUPABASE_CDN_MANIFEST_URL);
      if (cdnRes.ok) {
        const cdnData = await cdnRes.json();
        if (cdnData && cdnData.slots && Object.keys(cdnData.slots).length > 0) {
          slotsMap = cdnData.slots;
        }
      }
    } catch {
      // ignore
    }
  }

  const existingApartment = getSavedApartmentStages();
  const existingPortfolio = getSavedPortfolioSlots();
  const existingVideos = getSavedVideoSlots();

  // 1. Merge Apartment Stages prioritizing permanent repository paths and cloud overrides
  const mergedApartment: ApartmentStageSlot[] = APARTMENT_STAGES_MANIFEST.map((stage) => {
    const match = slotsMap[stage.slotKey];
    const activeUrl = match?.url || stage.imageUrl || stage.defaultFilePath;
    return {
      ...stage,
      imageUrl: activeUrl,
      isPlaceholder: !activeUrl
    };
  });
  saveLocalApartmentStages(mergedApartment);

  // 2. Merge Portfolio Slots prioritizing permanent repository paths and cloud overrides
  const mergedPortfolio: PortfolioSlot[] = PORTFOLIO_SLOTS_MANIFEST.map((slot) => {
    const match = slotsMap[slot.slotKey];
    const activeUrl = match?.url || slot.imageUrl || slot.defaultFilePath;
    return {
      ...slot,
      imageUrl: activeUrl,
      isPlaceholder: !activeUrl
    };
  });
  saveLocalPortfolioSlots(mergedPortfolio);

  // 3. Merge Video Slots prioritizing permanent repository paths and cloud overrides
  const mergedVideos: VideoSlot[] = VIDEO_SLOTS_MANIFEST.map((video) => {
    const match = slotsMap[video.slotKey];
    const activeUrl = match?.url || video.videoUrl || video.defaultFilePath;
    return {
      ...video,
      videoUrl: activeUrl,
      posterUrl: video.posterUrl,
      isAvailable: !!activeUrl
    };
  });
  saveLocalVideoSlots(mergedVideos);

  return {
    apartment: mergedApartment,
    portfolio: mergedPortfolio,
    videos: mergedVideos
  };
}

// Local storage helpers
export function getSavedApartmentStages(): ApartmentStageSlot[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APARTMENT);
    if (!raw) {
      return APARTMENT_STAGES_MANIFEST.map((s) => ({
        ...s,
        imageUrl: s.imageUrl || s.defaultFilePath,
        isPlaceholder: !(s.imageUrl || s.defaultFilePath)
      }));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 5) {
      return APARTMENT_STAGES_MANIFEST.map((manifestSlot, index) => {
        const stored = parsed[index];
        let activeUrl = stored?.imageUrl;
        // If stored was ephemeral /uploads/ that got cleared, fallback to repository asset path
        if (activeUrl && activeUrl.startsWith('/uploads/')) {
          activeUrl = manifestSlot.defaultFilePath;
        } else if (!activeUrl) {
          activeUrl = manifestSlot.imageUrl || manifestSlot.defaultFilePath;
        }
        return {
          ...manifestSlot,
          imageUrl: activeUrl,
          isPlaceholder: !activeUrl
        };
      });
    }
    return APARTMENT_STAGES_MANIFEST;
  } catch {
    return APARTMENT_STAGES_MANIFEST;
  }
}

export function saveLocalApartmentStages(stages: ApartmentStageSlot[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_APARTMENT, JSON.stringify(stages));
  } catch {
    // ignore
  }
}

export function getSavedPortfolioSlots(): PortfolioSlot[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PORTFOLIO);
    if (!raw) {
      return PORTFOLIO_SLOTS_MANIFEST.map((s) => ({
        ...s,
        imageUrl: s.imageUrl || s.defaultFilePath,
        isPlaceholder: !(s.imageUrl || s.defaultFilePath)
      }));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 40) {
      return PORTFOLIO_SLOTS_MANIFEST.map((manifestSlot, index) => {
        const stored = parsed[index];
        let activeUrl = stored?.imageUrl;
        if (activeUrl && activeUrl.startsWith('/uploads/')) {
          activeUrl = manifestSlot.defaultFilePath;
        } else if (!activeUrl) {
          activeUrl = manifestSlot.imageUrl || manifestSlot.defaultFilePath;
        }
        return {
          ...manifestSlot,
          imageUrl: activeUrl,
          isPlaceholder: !activeUrl
        };
      });
    }
    return PORTFOLIO_SLOTS_MANIFEST;
  } catch {
    return PORTFOLIO_SLOTS_MANIFEST;
  }
}

export function saveLocalPortfolioSlots(slots: PortfolioSlot[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PORTFOLIO, JSON.stringify(slots));
  } catch {
    // ignore
  }
}

export function getSavedVideoSlots(): VideoSlot[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VIDEOS);
    if (!raw) {
      return VIDEO_SLOTS_MANIFEST.map((v) => ({
        ...v,
        videoUrl: v.videoUrl || v.defaultFilePath,
        isAvailable: !!(v.videoUrl || v.defaultFilePath)
      }));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 5) {
      return VIDEO_SLOTS_MANIFEST.map((manifestSlot, index) => {
        const stored = parsed[index];
        let activeUrl = stored?.videoUrl;
        if (activeUrl && activeUrl.startsWith('/uploads/')) {
          activeUrl = manifestSlot.defaultFilePath;
        } else if (!activeUrl) {
          activeUrl = manifestSlot.videoUrl || manifestSlot.defaultFilePath;
        }
        return {
          ...manifestSlot,
          videoUrl: activeUrl,
          posterUrl: stored?.posterUrl || manifestSlot.posterUrl,
          isAvailable: !!activeUrl
        };
      });
    }
    return VIDEO_SLOTS_MANIFEST;
  } catch {
    return VIDEO_SLOTS_MANIFEST;
  }
}

export function saveLocalVideoSlots(slots: VideoSlot[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_VIDEOS, JSON.stringify(slots));
  } catch {
    // ignore
  }
}
