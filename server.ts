import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(): number {
  // 1. Check command line flags (--port <number> or -p <number>)
  const portIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const p = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(p) && p > 0) return p;
  }
  // 2. Check DEFAULT_APP_PORT (set to 3000 by AI Studio container)
  if (process.env.DEFAULT_APP_PORT) {
    const p = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(p) && p > 0) return p;
  }
  // 3. If PORT is provided and is NOT 8080 (which is reserved for NGINX proxy), use it
  if (process.env.PORT && process.env.PORT !== '8080') {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p) && p > 0) return p;
  }
  // 4. Default to port 3000 as required by AI Studio runtime
  return 3000;
}

const PORT = getPort();
const HOST = '0.0.0.0';
const IS_PROD = process.env.NODE_ENV === 'production';

// Admin Secret PIN — configured via server environment variable, never exposed in client bundle
const ADMIN_PIN = process.env.ADMIN_PIN || 'hosny2026';

// Server-side active session store (token -> { createdAt, expiresAt })
const activeSessions = new Map<string, { createdAt: number; expiresAt: number }>();

// Strict whitelist of the 50 designated slots (45 images + 5 videos)
const VALID_SLOT_KEYS = new Set<string>([
  // 5 Apartment Stages
  'apartment-stage-01',
  'apartment-stage-02',
  'apartment-stage-03',
  'apartment-stage-04',
  'apartment-stage-05',
  // 40 Portfolio Categories (5 slots each)
  'plumbing-01', 'plumbing-02', 'plumbing-03', 'plumbing-04', 'plumbing-05',
  'electrical-01', 'electrical-02', 'electrical-03', 'electrical-04', 'electrical-05',
  'plastering-01', 'plastering-02', 'plastering-03', 'plastering-04', 'plastering-05',
  'tiling-01', 'tiling-02', 'tiling-03', 'tiling-04', 'tiling-05',
  'gypsum-01', 'gypsum-02', 'gypsum-03', 'gypsum-04', 'gypsum-05',
  'painting-01', 'painting-02', 'painting-03', 'painting-04', 'painting-05',
  'interior-01', 'interior-02', 'interior-03', 'interior-04', 'interior-05',
  'commercial-01', 'commercial-02', 'commercial-03', 'commercial-04', 'commercial-05',
  // 12 Video Slots (5 original + 7 Supabase cloud)
  'video-01-owner-intro',
  'video-02-client-interview',
  'video-03-finishing-process',
  'video-04-completed-apartment',
  'video-05-commercial-project',
  'video-06-apartment-reception-tour',
  'video-07-interior-joinery-dressing',
  'video-08-site-prep-materials',
  'video-09-commercial-ductwork-mep',
  'video-10-floor-surface-grinding',
  'video-11-wall-putty-prep',
  'video-12-structural-masonry-site',
  // Official Engineering Certificate
  'eng-certificate'
]);

// Extensible slot key validator supporting new videos, before/after photos, and new project works
function isValidSlotKey(key: string): boolean {
  if (VALID_SLOT_KEYS.has(key)) return true;
  if (/^video-[a-zA-Z0-9_-]+$/i.test(key)) return true;
  if (/^before-after-[a-zA-Z0-9_-]+$/i.test(key)) return true;
  if (/^(project|custom|work|site|photo|stage)-[a-zA-Z0-9_-]+$/i.test(key)) return true;
  const local = readLocalManifest();
  if (local.slots && local.slots[key]) return true;
  return false;
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm'
]);

const app = express();

// Large body limits for high-resolution photography & video
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Paths
const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
const dataDir = path.resolve(__dirname, 'data');
const manifestFilePath = path.resolve(dataDir, 'media-manifest.json');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial manifest if not present
if (!fs.existsSync(manifestFilePath)) {
  fs.writeFileSync(
    manifestFilePath,
    JSON.stringify({ slots: {}, updatedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

// Manifest file helpers
function readLocalManifest(): {
  slots: Record<string, { url: string; fileName: string; updatedAt: string }>;
  updatedAt?: string;
  bucket?: string;
} {
  try {
    const raw = fs.readFileSync(manifestFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { slots: {} };
  }
}

function writeLocalManifest(data: any) {
  try {
    fs.writeFileSync(manifestFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Manifest] Error writing local manifest:', err);
  }
}

// Supabase Cloud Storage helper
interface CloudConfig {
  supabaseUrl: string;
  supabaseKey: string;
  bucketName: string;
}

function getCloudConfig(): CloudConfig {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://dvddnoawgghiwlmwepzx.supabase.co';

  // Secret credentials read ONLY from server-side environment variables
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const bucketName =
    process.env.SUPABASE_BUCKET_NAME ||
    'project-media';

  return { supabaseUrl, supabaseKey, bucketName };
}

function getSupabaseInstance(): { client: SupabaseClient | null; bucket: string; isConfigured: boolean } {
  const { supabaseUrl, supabaseKey, bucketName } = getCloudConfig();
  
  if (
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-project.supabase.co') &&
    !supabaseKey.includes('your-anon-key')
  ) {
    try {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      return { client, bucket: bucketName || 'project-media', isConfigured: true };
    } catch (err) {
      console.warn('[Supabase] Failed to initialize client:', err);
      return { client: null, bucket: bucketName || 'project-media', isConfigured: false };
    }
  }

  return { client: null, bucket: bucketName || 'project-media', isConfigured: false };
}

// Rate limiting for admin login attempts (prevents brute force)
const loginAttempts = new Map<string, { attempts: number; blockedUntil: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && now < record.blockedUntil) {
    return false;
  }
  return true;
}

function recordLoginAttempt(ip: string, success: boolean) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, blockedUntil: 0 };
  if (success) {
    loginAttempts.delete(ip);
  } else {
    record.attempts += 1;
    if (record.attempts >= 5) {
      record.blockedUntil = now + 15 * 60 * 1000; // 15-minute temporary lockout after 5 consecutive failures
    }
    loginAttempts.set(ip, record);
  }
}

// Timing-safe PIN verification against server-side secret
function verifyAdminPin(inputPin: string): boolean {
  if (!inputPin || typeof inputPin !== 'string') return false;
  const hashInput = crypto.createHash('sha256').update(inputPin.trim()).digest();
  const hashTarget = crypto.createHash('sha256').update(ADMIN_PIN.trim()).digest();
  return crypto.timingSafeEqual(hashInput, hashTarget);
}

// Security Middleware: Strictly requires a valid active administrative session token
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Valid administrative session token required.'
    });
  }

  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Session expired or invalid token. Please authenticate.'
    });
  }

  // Extend session on activity (sliding window of 24 hours)
  session.expiresAt = Date.now() + 24 * 3600 * 1000;
  next();
}

// -------------------------------------------------------------
// Authentication Endpoints (Server-Authoritative)
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
    });
  }

  const { pin } = req.body || {};
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ success: false, message: 'PIN is required' });
  }

  if (verifyAdminPin(pin)) {
    recordLoginAttempt(ip, true);

    // Generate cryptographically secure random session token (256-bit entropy)
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 3600 * 1000 // 24-hour validity
    });

    return res.json({
      success: true,
      token,
      message: 'Administrative authentication successful'
    });
  }

  recordLoginAttempt(ip, false);
  return res.status(401).json({
    success: false,
    message: 'Invalid administrative PIN'
  });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }

  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);

  if (session && Date.now() <= session.expiresAt) {
    return res.json({ authenticated: true });
  }

  return res.json({ authenticated: false });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// Cloud Storage & Supabase Status & Setup
// -------------------------------------------------------------
app.get('/api/settings/supabase-status', requireAdminAuth, async (_req, res) => {
  const { client, bucket, isConfigured } = getSupabaseInstance();
  const config = getCloudConfig();

  if (!isConfigured || !client) {
    return res.json({
      connected: false,
      url: config.supabaseUrl || null,
      bucket: config.bucketName || 'project-media',
      usingFallback: true,
      message:
        'Supabase Storage is not connected. Uploads are currently saved to the local container and browser cache. For permanent cloud hosting across Vercel deployments, provide your Supabase project credentials.'
    });
  }

  // Test Supabase connection by checking bucket
  try {
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      return res.json({
        connected: false,
        url: config.supabaseUrl,
        bucket,
        usingFallback: true,
        error: error.message,
        message: `Supabase credentials provided, but bucket check returned an error: ${error.message}`
      });
    }

    const bucketExists = buckets?.some((b) => b.name === bucket);

    return res.json({
      connected: true,
      url: config.supabaseUrl,
      bucket,
      bucketExists,
      usingFallback: false,
      message: bucketExists
        ? `Connected to Supabase Storage bucket '${bucket}'. Global CDN active.`
        : `Connected to Supabase, but bucket '${bucket}' was not found. Please create public bucket '${bucket}' in Supabase dashboard.`
    });
  } catch (err: any) {
    return res.json({
      connected: false,
      url: config.supabaseUrl,
      bucket,
      usingFallback: true,
      error: err.message,
      message: `Failed to reach Supabase: ${err.message}`
    });
  }
});

app.post('/api/settings/supabase', requireAdminAuth, async (_req, res) => {
  return res.status(400).json({
    success: false,
    message:
      'For security and Vercel serverless compatibility, Supabase credentials must be configured strictly via server environment variables (SUPABASE_SERVICE_ROLE_KEY). Direct UI key transmission is disabled.'
  });
});

// -------------------------------------------------------------
// Media Manifest (Public Read, Protected Write)
// -------------------------------------------------------------
app.get('/api/media/manifest', async (_req, res) => {
  const { client, bucket, isConfigured } = getSupabaseInstance();

  // If Supabase is connected, try to fetch cloud manifest first
  if (isConfigured && client) {
    try {
      const { data, error } = await client.storage
        .from(bucket)
        .download('manifest/media-manifest.json');

      if (!error && data) {
        const text = await data.text();
        const cloudManifest = JSON.parse(text);
        return res.json(cloudManifest);
      }
    } catch {
      // Fallback to local manifest below
    }
  }

  // Local fallback
  return res.json(readLocalManifest());
});

// -------------------------------------------------------------
// Inbox Original Media Discovery Endpoint
// -------------------------------------------------------------
app.get('/api/media/inbox', requireAdminAuth, (_req, res) => {
  try {
    const inboxPath = path.resolve(__dirname, 'public', 'assets', 'inbox');
    if (!fs.existsSync(inboxPath)) {
      return res.json({ success: true, total: 0, files: [] });
    }

    const fileNames = fs.readdirSync(inboxPath).filter((f) => f !== '.gitkeep' && !f.startsWith('.'));
    const files = fileNames.map((fileName, idx) => {
      const filePath = path.join(inboxPath, fileName);
      const stat = fs.statSync(filePath);
      let category = 'site';
      if (fileName.startsWith('Screenshot_')) {
        category = 'screenshot';
      } else if (fileName.startsWith('Gemini_')) {
        category = 'concept';
      }

      let dateFormatted = '2026-10';
      const match = fileName.match(/2026\d{4}/);
      if (match) {
        const raw = match[0];
        dateFormatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      }

      return {
        id: idx + 1,
        fileName,
        url: `/assets/inbox/${encodeURIComponent(fileName)}`,
        sizeBytes: stat.size,
        sizeKb: (stat.size / 1024).toFixed(1),
        category,
        dateFormatted
      };
    });

    return res.json({
      success: true,
      total: files.length,
      files
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Comprehensive Media Inventory & Separation Architecture Endpoint
// Separates physical files on disk from designated project slots
// Protected strictly by requireAdminAuth
// -------------------------------------------------------------
app.get('/api/media/inventory', requireAdminAuth, (_req, res) => {
  try {
    const manifest = readLocalManifest();
    const assignedSlots = manifest.slots || {};

    // 1. Inbox 62 images
    const inboxPath = path.resolve(__dirname, 'public', 'assets', 'inbox');
    const inboxFileNames = fs.existsSync(inboxPath)
      ? fs.readdirSync(inboxPath).filter((f) => f !== '.gitkeep' && !f.startsWith('.'))
      : [];

    const assignedUrlSet = new Set<string>();
    Object.values(assignedSlots).forEach((s: any) => {
      if (s && s.url) assignedUrlSet.add(s.url);
    });

    const inboxFiles = inboxFileNames.map((fileName, idx) => {
      const filePath = path.join(inboxPath, fileName);
      const stat = fs.statSync(filePath);
      const url = `/assets/inbox/${encodeURIComponent(fileName)}`;
      const isAssigned = assignedUrlSet.has(url);

      let category = 'site';
      let isAiConcept = false;
      let isDuplicate = false;

      if (fileName.startsWith('Gemini_')) {
        category = 'concept';
        isAiConcept = true;
      } else if (fileName.includes('WA0012') && fileName.includes('020423')) {
        isDuplicate = true;
      }

      return {
        id: idx + 1,
        fileName,
        url,
        sizeBytes: stat.size,
        sizeKb: (stat.size / 1024).toFixed(1),
        category,
        isAssigned,
        isAiConcept,
        isDuplicate,
        duplicateGroup: isDuplicate ? 'WA0012-pair' : undefined
      };
    });

    // 2. Videos: 7 in public/assets/videos + 1 in root
    const videosPath = path.resolve(__dirname, 'public', 'assets', 'videos');
    const videoFileNames = fs.existsSync(videosPath)
      ? fs.readdirSync(videosPath).filter((f) => f !== '.gitkeep' && !f.startsWith('.'))
      : [];

    const physicalVideos: Array<{
      id: number;
      fileName: string;
      url: string;
      location: string;
      sizeBytes: number;
      sizeMb: string;
      isAssigned: boolean;
      isDuplicate: boolean;
      duplicateGroup?: string;
    }> = [];

    videoFileNames.forEach((fileName, idx) => {
      const filePath = path.join(videosPath, fileName);
      const stat = fs.statSync(filePath);
      const url = `/assets/videos/${encodeURIComponent(fileName)}`;
      const isAssigned = assignedUrlSet.has(url);
      let isDup = false;
      let group: string | undefined = undefined;

      if (fileName === 'video-05-commercial-project.mp4' || fileName === 'client-interview.mp4') {
        isDup = true;
        group = 'client-interview-trio';
      } else if (fileName === '1026(4).mp41.mp4' || fileName === 'video-04-completed-apartment.mp4') {
        isDup = true;
        group = 'apartment-video-pair';
      }

      physicalVideos.push({
        id: idx + 1,
        fileName,
        url,
        location: 'public/assets/videos/',
        sizeBytes: stat.size,
        sizeMb: (stat.size / (1024 * 1024)).toFixed(2),
        isAssigned,
        isDuplicate: isDup,
        duplicateGroup: group
      });
    });

    // Root video
    const rootVideoName = '1026(1).mp41.mp4';
    const rootVideoPath = path.resolve(__dirname, rootVideoName);
    if (fs.existsSync(rootVideoPath)) {
      const stat = fs.statSync(rootVideoPath);
      physicalVideos.push({
        id: physicalVideos.length + 1,
        fileName: rootVideoName,
        url: `/${rootVideoName}`,
        location: 'project-root/',
        sizeBytes: stat.size,
        sizeMb: (stat.size / (1024 * 1024)).toFixed(2),
        isAssigned: false,
        isDuplicate: true,
        duplicateGroup: 'client-interview-trio'
      });
    }

    // 3. Other images across project
    const otherImageDirs = [
      { dir: path.resolve(__dirname, 'public', 'assets', 'images'), prefix: '/assets/images/' },
      { dir: path.resolve(__dirname, 'public', 'assets', 'aistudio'), prefix: '/assets/aistudio/' },
      { dir: path.resolve(__dirname, 'src', 'assets', 'images'), prefix: '/src/assets/images/' }
    ];

    let otherImagesCount = 0;
    const additionalImages: Array<{ fileName: string; url: string; location: string; sizeKb: string }> = [];

    otherImageDirs.forEach(({ dir, prefix }) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.') && f !== '.gitkeep');
        files.forEach((f) => {
          const stat = fs.statSync(path.join(dir, f));
          otherImagesCount++;
          additionalImages.push({
            fileName: f,
            url: `${prefix}${encodeURIComponent(f)}`,
            location: prefix,
            sizeKb: (stat.size / 1024).toFixed(1)
          });
        });
      }
    });

    const totalPhysicalImages = inboxFiles.length + otherImagesCount;
    const totalPhysicalVideos = physicalVideos.length;
    const totalPhysicalFiles = totalPhysicalImages + totalPhysicalVideos;

    // 4. Unassigned inbox items
    const unassignedFiles = inboxFiles.filter((f) => !f.isAssigned);

    // 5. Duplicate groups
    const duplicateGroups = [
      {
        groupId: 'WA0012-pair',
        hashType: 'MD5',
        hash: '541fcda80b9351b3a302297a04f412df',
        titleAr: 'صورتان متطابقتان لتركيب السيراميك والمصارف (WA0012)',
        titleEn: 'Identical Ceramic Tiling Photos (WA0012 Pair)',
        files: [
          'IMG-20261026-WA0012.jpg_20261026020407.jpg',
          'IMG-20261026-WA0012.jpg_20261026020423.jpg'
        ],
        actionNoteAr: 'محفوظتان معاً في الأرشيف دون حذف، وتم تعيين الأولى لخانة tiling-03.',
        actionNoteEn: 'Preserved in archive without deletion; first assigned to slot tiling-03.'
      },
      {
        groupId: 'client-interview-trio',
        hashType: 'SHA-256',
        hash: 'ef2151d574223eb46f6f9621ba57fc109a93ae0ee4b5e2a2202616f7347900b3',
        titleAr: 'ثلاث نسخ متطابقة لفيديو مقابلة العميل (صالون محمد وخالد)',
        titleEn: 'Identical Client Interview Video Trio (4.88 MB)',
        files: [
          'public/assets/videos/client-interview.mp4',
          'public/assets/videos/video-05-commercial-project.mp4',
          '1026(1).mp41.mp4'
        ],
        actionNoteAr: 'محفوظة في أماكنها الأصلية؛ خانة video-05 قيد المراجعة لحين توفير لقطات مستقلة.',
        actionNoteEn: 'Kept in place; slot video-05 flagged Pending Review awaiting unique footage.'
      },
      {
        groupId: 'apartment-video-pair',
        hashType: 'SHA-256',
        hash: 'f6350e37a2a71c56a84dfc2d1b092a9c37255be9d2ee374a382bfafbca3f6402',
        titleAr: 'نسختان متطابقتان لفيديو جولة الشقة المكتملة (7.32 MB)',
        titleEn: 'Identical Completed Apartment Tour Video Pair (7.32 MB)',
        files: [
          'public/assets/videos/video-04-completed-apartment.mp4',
          'public/assets/videos/1026(4).mp41.mp4'
        ],
        actionNoteAr: 'محفوظتان معاً؛ video-04 معين في مكتبة الفيديو، و1026(4) محفوظ في الأرشيف.',
        actionNoteEn: 'Both preserved; video-04 linked in library, 1026(4) preserved in archive.'
      }
    ];

    // 6. Supabase Cloud Videos (batch-02-2026)
    const supabaseCloudVideos = [
      {
        id: 1,
        fileName: '1107(1).mp4',
        url: 'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(1).mp4',
        storagePath: 'mohamed-hosny/videos/batch-02-2026/1107(1).mp4',
        sizeBytes: 20255390,
        sizeMb: '19.32',
        isAssigned: assignedUrlSet.has('https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(1).mp4'),
        assignedSlotKey: 'video-06-apartment-reception-tour',
        assignedSlotTitleAr: 'جولة الريسبشن والأسقف المعلقة بالصالون الفاخر',
        assignedSlotTitleEn: 'Luxury Living & Architectural Gypsum Ceiling Tour',
        source: 'supabase_cloud'
      },
      {
        id: 2,
        fileName: '1107(2).mp4',
        url: 'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(2).mp4',
        storagePath: 'mohamed-hosny/videos/batch-02-2026/1107(2).mp4',
        sizeBytes: 19532679,
        sizeMb: '18.63',
        isAssigned: assignedUrlSet.has('https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(2).mp4'),
        assignedSlotKey: 'video-07-interior-joinery-dressing',
        assignedSlotTitleAr: 'تفاصيل التجاليد الخشبية ودواليب الدريسينج المودرن',
        assignedSlotTitleEn: 'Interior Architectural Joinery & Walk-In Wardrobes',
        source: 'supabase_cloud'
      },
      {
        id: 3,
        fileName: '1107(3).mp4',
        url: 'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(3).mp4',
        storagePath: 'mohamed-hosny/videos/batch-02-2026/1107(3).mp4',
        sizeBytes: 24590063,
        sizeMb: '23.45',
        isAssigned: assignedUrlSet.has('https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(3).mp4'),
        assignedSlotKey: 'video-08-site-prep-materials',
        assignedSlotTitleAr: 'تجهيزات الموقع وتشوين خامات التأسيس المعتمدة',
        assignedSlotTitleEn: 'Site Staging & Certified Materials Logistics',
        source: 'supabase_cloud'
      },
      {
        id: 4,
        fileName: '1107(5).mp4',
        url: 'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(5).mp4',
        storagePath: 'mohamed-hosny/videos/batch-02-2026/1107(5).mp4',
        sizeBytes: 39554762,
        sizeMb: '37.72',
        isAssigned: assignedUrlSet.has('https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(5).mp4'),
        assignedSlotKey: 'video-09-commercial-ductwork-mep',
        assignedSlotTitleAr: 'تجهيزات دكتات الصاج والتهوية للمشاريع التجارية',
        assignedSlotTitleEn: 'Commercial Ducting & Industrial HVAC Infrastructure',
        source: 'supabase_cloud'
      },
      {
        id: 5,
        fileName: '1107(6).mp4',
        url: 'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(6).mp4',
        storagePath: 'mohamed-hosny/videos/batch-02-2026/1107(6).mp4',
        sizeBytes: 15881513,
        sizeMb: '15.15',
        isAssigned: assignedUrlSet.has('https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(6).mp4'),
        assignedSlotKey: 'video-10-floor-surface-grinding',
        assignedSlotTitleAr: 'أعمال جلي وتسوية الأرضيات بالماكينات الميدانية',
        assignedSlotTitleEn: 'Precision Floor Leveling & Surface Grinding',
        source: 'supabase_cloud'
      },
      {
        id: 6,
        fileName: '1107(7).mp4',
        url: 'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(7).mp4',
        storagePath: 'mohamed-hosny/videos/batch-02-2026/1107(7).mp4',
        sizeBytes: 15918572,
        sizeMb: '15.18',
        isAssigned: assignedUrlSet.has('https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(7).mp4'),
        assignedSlotKey: 'video-11-wall-putty-prep',
        assignedSlotTitleAr: 'تأسيس معجون الجدران والأسقف ومعالجة الزوايا',
        assignedSlotTitleEn: 'Wall Putty Surface Preparation & Corner Detailing',
        source: 'supabase_cloud'
      },
      {
        id: 7,
        fileName: '1107(9).mp4',
        url: 'https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(9).mp4',
        storagePath: 'mohamed-hosny/videos/batch-02-2026/1107(9).mp4',
        sizeBytes: 27902921,
        sizeMb: '26.61',
        isAssigned: assignedUrlSet.has('https://dvddnoawgghiwlmwepzx.supabase.co/storage/v1/object/public/project-media/mohamed-hosny/videos/batch-02-2026/1107(9).mp4'),
        assignedSlotKey: 'video-12-structural-masonry-site',
        assignedSlotTitleAr: 'مرحلة المباني الطوب الأحمر وإزالة التعديلات الإنشائية',
        assignedSlotTitleEn: 'Structural Red Brick Masonry & Demolition Cleanup',
        source: 'supabase_cloud'
      }
    ];

    const stats = {
      totalPhysicalFiles,
      totalPhysicalImages,
      totalPhysicalVideos,
      archiveImagesCount: inboxFiles.length,
      archiveVideosCount: physicalVideos.length,
      supabaseCloudVideosCount: supabaseCloudVideos.length,
      totalMediaAssetsCount: totalPhysicalFiles + supabaseCloudVideos.length,
      portfolioSlotsTotal: 40,
      apartmentStagesTotal: 5,
      videoSlotsTotal: 12,
      totalSlotsCount: 57,
      assignedSlotsCount: Object.keys(assignedSlots).length,
      emptyOrPendingSlotsCount: Math.max(0, 57 - Object.keys(assignedSlots).length),
      unassignedInboxCount: unassignedFiles.length,
      unassignedCloudVideosCount: supabaseCloudVideos.filter((v) => !v.isAssigned).length,
      verifiedDuplicateGroupsCount: duplicateGroups.length
    };

    return res.json({
      success: true,
      stats,
      inboxFiles,
      physicalVideos,
      supabaseCloudVideos,
      additionalImages,
      duplicateGroups,
      assignedSlots,
      updatedAt: manifest.updatedAt || new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


// -------------------------------------------------------------
// Direct Signed Upload URL (Bypasses Vercel 4.5MB request limit for large videos)
// -------------------------------------------------------------
// Direct Signed Upload URL (Bypasses Vercel 4.5MB request limit for large videos)
// -------------------------------------------------------------
app.post('/api/media/create-signed-upload-url', requireAdminAuth, async (req, res) => {
  try {
    const { slotKey, fileName, mimeType } = req.body;
    if (!slotKey) {
      return res.status(400).json({ success: false, message: 'Missing slotKey' });
    }

    const safeSlotKey = slotKey.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!isValidSlotKey(safeSlotKey)) {
      return res.status(400).json({
        success: false,
        message: `Unauthorized slotKey '${slotKey}'. Must match a valid media slot key pattern.`
      });
    }

    const cleanMime = (mimeType || '').toLowerCase().trim();
    if (cleanMime && !ALLOWED_MIME_TYPES.has(cleanMime)) {
      return res.status(400).json({
        success: false,
        message: `Unauthorized MIME type '${mimeType}'. Allowed formats: JPEG, PNG, WebP, MP4, WebM.`
      });
    }

    const { client, bucket, isConfigured } = getSupabaseInstance();
    if (!isConfigured || !client) {
      return res.status(400).json({
        success: false,
        message: 'Supabase Storage is not connected. Please configure your Supabase API credentials first.'
      });
    }

    let ext = 'jpg';
    if (cleanMime.includes('png')) ext = 'png';
    else if (cleanMime.includes('webp')) ext = 'webp';
    else if (cleanMime.includes('mp4')) ext = 'mp4';
    else if (cleanMime.includes('webm')) ext = 'webm';
    else if (fileName && fileName.includes('.')) {
      ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    }

    const safeFileName = `${safeSlotKey}.${ext}`;
    const storageFilePath = `uploads/${safeFileName}`;

    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUploadUrl(storageFilePath, { upsert: true });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create signed upload URL');
    }

    const { data: urlData } = client.storage.from(bucket).getPublicUrl(storageFilePath);

    return res.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      storageFilePath,
      publicUrl: urlData.publicUrl,
      fileName: safeFileName
    });
  } catch (err: any) {
    console.error('[Signed Upload URL Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Confirm Direct Upload (Update manifest with public URL & concurrency protection)
// -------------------------------------------------------------
app.post('/api/media/confirm-upload', requireAdminAuth, async (req, res) => {
  try {
    const { slotKey, fileName, publicUrl } = req.body;
    if (!slotKey || !publicUrl) {
      return res.status(400).json({ success: false, message: 'Missing slotKey or publicUrl' });
    }

    const safeSlotKey = slotKey.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!isValidSlotKey(safeSlotKey)) {
      return res.status(400).json({
        success: false,
        message: `Unauthorized slotKey '${slotKey}'. Must match a valid media slot key pattern.`
      });
    }

    const localManifest = readLocalManifest();
    let currentSlots = { ...localManifest.slots };

    const { client, bucket, isConfigured } = getSupabaseInstance();
    if (isConfigured && client) {
      try {
        // Concurrency protection: Fetch latest remote manifest first to prevent overwrite race conditions
        const { data: cloudManifestBlob } = await client.storage
          .from(bucket)
          .download('manifest/media-manifest.json');

        if (cloudManifestBlob) {
          const text = await cloudManifestBlob.text();
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed.slots === 'object') {
            currentSlots = { ...currentSlots, ...parsed.slots };
          }
        }
      } catch {
        // Fallback to local manifest if cloud read fails
      }
    }

    currentSlots[safeSlotKey] = {
      url: publicUrl,
      fileName: fileName || safeSlotKey,
      updatedAt: new Date().toISOString()
    };

    const updatedManifest = {
      slots: currentSlots,
      updatedAt: new Date().toISOString(),
      bucket: bucket || 'project-media'
    };

    writeLocalManifest(updatedManifest);

    if (isConfigured && client) {
      try {
        await client.storage
          .from(bucket)
          .upload(
            'manifest/media-manifest.json',
            Buffer.from(JSON.stringify(updatedManifest, null, 2)),
            { contentType: 'application/json', upsert: true }
          );
      } catch (cloudErr) {
        console.warn('[Supabase] Failed to sync manifest to bucket:', cloudErr);
      }
    }

    return res.json({ success: true, slotKey: safeSlotKey, publicUrl });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Non-Destructive Batch Migration to Supabase
// -------------------------------------------------------------
app.post('/api/media/migrate-existing-files', requireAdminAuth, async (_req, res) => {
  const { client, bucket, isConfigured } = getSupabaseInstance();
  if (!isConfigured || !client) {
    return res.status(400).json({
      success: false,
      error: 'CREDENTIALS_MISSING',
      message: 'Supabase Storage is not configured. Please supply SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.'
    });
  }

  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ success: false, message: 'Uploads directory not found' });
    }

    const allFiles = fs.readdirSync(uploadsDir).filter((f) => {
      if (f === '.gitkeep') return false;
      if (f === 'plumbing-01.png') return false; // skip 70B stub in favor of plumbing-01.jpg
      return true;
    });

    const manifest = readLocalManifest();
    const results: Array<{
      fileName: string;
      slotKey: string;
      sizeBytes: number;
      publicUrl: string;
      verified: boolean;
      error?: string;
    }> = [];

    for (const fileName of allFiles) {
      const filePath = path.join(uploadsDir, fileName);
      const stat = fs.statSync(filePath);
      const slotKey = fileName.replace(/\.[^/.]+$/, '');
      const storageFilePath = `uploads/${fileName}`;

      let mimeType = 'image/jpeg';
      if (fileName.endsWith('.png')) mimeType = 'image/png';
      else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
      else if (fileName.endsWith('.mp4')) mimeType = 'video/mp4';
      else if (fileName.endsWith('.webm')) mimeType = 'video/webm';

      try {
        const buffer = fs.readFileSync(filePath);
        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(storageFilePath, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: urlData } = client.storage.from(bucket).getPublicUrl(storageFilePath);
        const publicUrl = urlData.publicUrl;

        // Verify retrieval
        const testRes = await fetch(publicUrl, { method: 'HEAD' });
        const verified = testRes.ok;

        manifest.slots[slotKey] = {
          url: publicUrl,
          fileName,
          updatedAt: new Date().toISOString()
        };

        results.push({
          fileName,
          slotKey,
          sizeBytes: stat.size,
          publicUrl,
          verified
        });
      } catch (uploadErr: any) {
        results.push({
          fileName,
          slotKey,
          sizeBytes: stat.size,
          publicUrl: '',
          verified: false,
          error: uploadErr.message
        });
      }
    }

    // Save manifest locally and on cloud
    writeLocalManifest(manifest);

    try {
      await client.storage
        .from(bucket)
        .upload(
          'manifest/media-manifest.json',
          Buffer.from(JSON.stringify(manifest, null, 2)),
          { contentType: 'application/json', upsert: true }
        );
    } catch (manifestSyncErr) {
      console.warn('[Supabase] Failed to write cloud manifest:', manifestSyncErr);
    }

    const verifiedCount = results.filter((r) => r.verified).length;

    return res.json({
      success: true,
      totalFiles: allFiles.length,
      verifiedCount,
      results,
      manifest: manifest.slots
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Media Upload (Protected by requireAdminAuth)
// -------------------------------------------------------------
app.post('/api/upload', requireAdminAuth, async (req, res) => {
  try {
    const { slotKey, dataUrl, fileName } = req.body;

    if (!slotKey || !dataUrl) {
      return res.status(400).json({ success: false, message: 'Missing slotKey or dataUrl' });
    }

    // Match data URL pattern
    const matches = dataUrl.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid data URL format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Extension from mime or filename
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (fileName && fileName.includes('.')) {
      ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    }

    const safeSlotKey = slotKey.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeFileName = `${safeSlotKey}.${ext}`;

    const { client, bucket, isConfigured } = getSupabaseInstance();

    let finalPublicUrl = '';
    let storageType = 'git_repository';

    if (isConfigured && client) {
      // 1. Upload to Supabase Storage Bucket
      const storageFilePath = `uploads/${safeFileName}`;
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(storageFilePath, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        console.error('[Supabase Upload Error]:', uploadError);
        throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
      }

      // 2. Obtain permanent Supabase public CDN URL
      const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(storageFilePath);

      finalPublicUrl = urlData.publicUrl;
      storageType = 'supabase';

      // 3. Update both local manifest and cloud manifest in Supabase
      const manifest = readLocalManifest();
      manifest.slots[safeSlotKey] = {
        url: finalPublicUrl,
        fileName: fileName || safeFileName,
        updatedAt: new Date().toISOString()
      };
      writeLocalManifest(manifest);

      try {
        await client.storage
          .from(bucket)
          .upload(
            'manifest/media-manifest.json',
            Buffer.from(JSON.stringify(manifest, null, 2)),
            {
              contentType: 'application/json',
              upsert: true
            }
          );
      } catch (cloudManifestErr) {
        console.warn('[Supabase] Could not sync manifest file to bucket:', cloudManifestErr);
      }
    } else {
      // Git-tracked repository storage under public/assets/
      const isVideo = safeFileName.endsWith('.mp4') || safeFileName.endsWith('.webm');
      const targetSubdir = isVideo ? 'videos' : 'images';
      const targetDir = path.resolve(__dirname, 'public', 'assets', targetSubdir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const destinationPath = path.resolve(targetDir, safeFileName);
      fs.writeFileSync(destinationPath, buffer);
      finalPublicUrl = `/assets/${targetSubdir}/${safeFileName}`;
      storageType = 'git_repository';

      const manifest = readLocalManifest();
      manifest.slots[safeSlotKey] = {
        url: finalPublicUrl,
        fileName: fileName || safeFileName,
        updatedAt: new Date().toISOString()
      };
      writeLocalManifest(manifest);
    }

    return res.json({
      success: true,
      fileUrl: finalPublicUrl,
      slotKey: safeSlotKey,
      fileName: safeFileName,
      storageType,
      warning:
        storageType === 'local_fallback'
          ? 'File stored locally. On Vercel serverless deployments, configure Supabase Storage to ensure permanent persistence.'
          : undefined
    });
  } catch (error: any) {
    console.error('[Upload error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Save slot manually (e.g. video URL or external link)
app.post('/api/media/save-slot', requireAdminAuth, async (req, res) => {
  const { slotKey, url, fileName } = req.body;
  if (!slotKey) {
    return res.status(400).json({ success: false, message: 'Missing slotKey' });
  }

  const manifest = readLocalManifest();
  manifest.slots[slotKey] = {
    url,
    fileName: fileName || `${slotKey}`,
    updatedAt: new Date().toISOString()
  };
  writeLocalManifest(manifest);

  const { client, bucket, isConfigured } = getSupabaseInstance();
  if (isConfigured && client) {
    try {
      await client.storage
        .from(bucket)
        .upload(
          'manifest/media-manifest.json',
          Buffer.from(JSON.stringify(manifest, null, 2)),
          { contentType: 'application/json', upsert: true }
        );
    } catch {
      // ignore
    }
  }

  return res.json({ success: true, slotKey, manifest: manifest.slots });
});

// Delete slot override
app.post('/api/media/delete-slot', requireAdminAuth, async (req, res) => {
  const { slotKey } = req.body;
  if (!slotKey) {
    return res.status(400).json({ success: false, message: 'Missing slotKey' });
  }

  const manifest = readLocalManifest();
  if (manifest.slots[slotKey]) {
    delete manifest.slots[slotKey];
    writeLocalManifest(manifest);
  }

  const { client, bucket, isConfigured } = getSupabaseInstance();
  if (isConfigured && client) {
    try {
      await client.storage
        .from(bucket)
        .upload(
          'manifest/media-manifest.json',
          Buffer.from(JSON.stringify(manifest, null, 2)),
          { contentType: 'application/json', upsert: true }
        );
    } catch {
      // ignore
    }
  }

  return res.json({ success: true, slotKey });
});

// Reset all overrides (Protected with explicit confirmation guard)
app.post('/api/media/reset-all', requireAdminAuth, async (req, res) => {
  const { confirmResetAll } = req.body || {};
  if (!confirmResetAll) {
    return res.status(400).json({
      success: false,
      message: 'Confirmation required: provide confirmResetAll: true to reset all media slot assignments.'
    });
  }
  const empty = { slots: {}, updatedAt: new Date().toISOString() };
  writeLocalManifest(empty);

  const { client, bucket, isConfigured } = getSupabaseInstance();
  if (isConfigured && client) {
    try {
      await client.storage
        .from(bucket)
        .upload(
          'manifest/media-manifest.json',
          Buffer.from(JSON.stringify(empty, null, 2)),
          { contentType: 'application/json', upsert: true }
        );
    } catch {
      // ignore
    }
  }

  return res.json({ success: true });
});

// Serve public static assets
app.use(express.static(path.resolve(__dirname, 'public')));

// Explicit 404 for missing static media assets under /assets/* and /uploads/*
// This prevents Vite / SPA fallback from returning index.html (Content-Type: text/html)
// which corrupts <img> and <video> elements and causes confusing browser errors.
app.use(['/assets', '/uploads'], (_req, res) => {
  res.status(404).type('text/plain').send('Media asset not found');
});

// Integrate Vite
async function startServer() {
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Mohamed Hosny Server] Running on http://${HOST}:${PORT}`);
  });
}

startServer();
