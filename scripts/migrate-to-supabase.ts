/**
 * MOHAMED HOSNY — Non-Destructive Supabase Migration Script
 * 
 * Safely migrates all existing images and videos from /public/uploads/
 * to the Supabase Storage bucket 'project-media'.
 * 
 * SAFETY RULES:
 * - Does NOT delete, rename, or move any original local files.
 * - Verifies each uploaded file via HTTP HEAD / GET before recording as verified.
 * - Uploads and commits the central media-manifest.json to the Supabase bucket.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const uploadsDir = path.resolve(rootDir, 'public', 'uploads');
const dataDir = path.resolve(rootDir, 'data');
const manifestFilePath = path.resolve(dataDir, 'media-manifest.json');
const cloudConfigFilePath = path.resolve(dataDir, 'cloud-config.json');

// Get configuration
let fileConfig: { supabaseUrl?: string; supabaseKey?: string; bucketName?: string } = {};
if (fs.existsSync(cloudConfigFilePath)) {
  try {
    fileConfig = JSON.parse(fs.readFileSync(cloudConfigFilePath, 'utf-8'));
  } catch {
    // ignore
  }
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://dvddnoawgghiwlmwepzx.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

const bucketName =
  process.env.SUPABASE_BUCKET_NAME ||
  'project-media';

console.log('====================================================');
console.log('MOHAMED HOSNY — SUPABASE STORAGE MIGRATION');
console.log('====================================================');
console.log(`Supabase Project URL : ${supabaseUrl}`);
console.log(`Target Bucket        : ${bucketName}`);
console.log(`API Key Status       : ${supabaseKey ? 'CONFIGURED (Active)' : 'NOT CONFIGURED (Missing)'}`);
console.log('====================================================\n');

if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
  console.error('❌ MIGRATION HALTED: Supabase API Key is missing or unconfigured.');
  console.error('Please configure SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in .env or via Media Manager Cloud Settings.');
  process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Helper for MIME type
function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
}

// Map filename to slotKey
function getSlotKeyFromFileName(fileName: string): string {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  return nameWithoutExt;
}

async function runMigration() {
  // 1. Verify bucket access
  console.log('Step 1: Verifying Supabase Storage bucket access...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error(`❌ Supabase error listing buckets: ${bucketError.message}`);
    process.exit(1);
  }

  const bucketExists = buckets?.some((b) => b.name === bucketName);
  if (!bucketExists) {
    console.warn(`⚠️ Bucket '${bucketName}' not found in bucket list. Attempting to create or use it...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    if (createError) {
      console.warn(`Note on bucket creation: ${createError.message} (bucket may already exist or require dashboard creation)`);
    } else {
      console.log(`✅ Created public bucket '${bucketName}'.`);
    }
  } else {
    console.log(`✅ Bucket '${bucketName}' is verified and ready.`);
  }

  // 2. Read local files
  console.log('\nStep 2: Scanning local media files in /public/uploads/ ...');
  if (!fs.existsSync(uploadsDir)) {
    console.error(`❌ Uploads directory not found: ${uploadsDir}`);
    process.exit(1);
  }

  const allFiles = fs.readdirSync(uploadsDir).filter((f) => {
    if (f === '.gitkeep') return false;
    // Skip empty dummy stubs (e.g. plumbing-01.png 70 bytes when plumbing-01.jpg 61KB is the real one)
    if (f === 'plumbing-01.png') return false;
    return true;
  });

  console.log(`Found ${allFiles.length} media files to migrate.\n`);

  // 3. Migrate each file
  const migrationResults: Array<{
    fileName: string;
    slotKey: string;
    sizeBytes: number;
    publicUrl: string;
    verified: boolean;
    error?: string;
  }> = [];

  const manifestSlots: Record<string, { url: string; fileName: string; updatedAt: string }> = {};

  for (let i = 0; i < allFiles.length; i++) {
    const fileName = allFiles[i];
    const filePath = path.join(uploadsDir, fileName);
    const stat = fs.statSync(filePath);
    const mimeType = getMimeType(fileName);
    const slotKey = getSlotKeyFromFileName(fileName);
    const targetStoragePath = `uploads/${fileName}`;

    process.stdout.write(`[${i + 1}/${allFiles.length}] Migrating ${fileName} (${(stat.size / 1024).toFixed(1)} KB)... `);

    try {
      const buffer = fs.readFileSync(filePath);

      // Upload without deleting original
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(targetStoragePath, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      // Get public CDN URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(targetStoragePath);

      const publicUrl = urlData.publicUrl;

      // Verify retrieval
      const testRes = await fetch(publicUrl, { method: 'HEAD' });
      const verified = testRes.ok;

      if (!verified) {
        console.log(`⚠️ Uploaded, but HTTP verification returned ${testRes.status}`);
      } else {
        console.log(`✅ VERIFIED`);
      }

      migrationResults.push({
        fileName,
        slotKey,
        sizeBytes: stat.size,
        publicUrl,
        verified
      });

      manifestSlots[slotKey] = {
        url: publicUrl,
        fileName,
        updatedAt: new Date().toISOString()
      };
    } catch (err: any) {
      console.log(`❌ FAILED: ${err.message}`);
      migrationResults.push({
        fileName,
        slotKey,
        sizeBytes: stat.size,
        publicUrl: '',
        verified: false,
        error: err.message
      });
    }
  }

  // 4. Update manifest in Supabase Storage and locally
  console.log('\nStep 3: Committing central media manifest...');
  const manifestData = {
    slots: manifestSlots,
    updatedAt: new Date().toISOString(),
    bucket: bucketName,
    migratedCount: Object.keys(manifestSlots).length
  };

  // Write local manifest
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifestData, null, 2), 'utf-8');
  console.log(`✅ Saved local manifest: ${manifestFilePath}`);

  // Upload manifest to Supabase bucket
  try {
    const { error: manifestUploadErr } = await supabase.storage
      .from(bucketName)
      .upload('manifest/media-manifest.json', Buffer.from(JSON.stringify(manifestData, null, 2)), {
        contentType: 'application/json',
        upsert: true
      });

    if (manifestUploadErr) {
      console.warn(`⚠️ Warning uploading cloud manifest: ${manifestUploadErr.message}`);
    } else {
      console.log(`✅ Uploaded manifest/media-manifest.json to bucket '${bucketName}'.`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Cloud manifest sync exception: ${err.message}`);
  }

  // 5. Final Report
  const verifiedCount = migrationResults.filter((r) => r.verified).length;
  console.log('\n====================================================');
  console.log('MIGRATION SUMMARY');
  console.log('====================================================');
  console.log(`Total Files Processed : ${allFiles.length}`);
  console.log(`Successfully Verified : ${verifiedCount}`);
  console.log(`Failed / Pending      : ${allFiles.length - verifiedCount}`);
  console.log('====================================================');
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
});
