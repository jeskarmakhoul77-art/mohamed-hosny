/**
 * Comprehensive Security, Media Separation & WhatsApp Verification Test Suite
 * MOHAMED HOSNY — Construction & Interior Design
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OFFICIAL_WHATSAPP_NUMBER, DISPLAY_WHATSAPP_NUMBER, OFFICIAL_WHATSAPP_LINK, buildWhatsAppLink } from '../src/config/businessConfig.js';
import { APARTMENT_STAGES_MANIFEST, PORTFOLIO_SLOTS_MANIFEST, VIDEO_SLOTS_MANIFEST } from '../src/config/assetsManifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('===============================================================');
  console.log('MOHAMED HOSNY — AUDIT, SECURITY & REGRESSION VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extraInfo = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${extraInfo}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${extraInfo}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. WhatsApp Configuration Verification
  // -----------------------------------------------------------------
  console.log('--- 1. WhatsApp Number & Links ---');
  assert(OFFICIAL_WHATSAPP_NUMBER === '201228744400', 'Official WhatsApp number is 201228744400');
  assert(DISPLAY_WHATSAPP_NUMBER === '01228744400', 'Display WhatsApp number is 01228744400');
  assert(OFFICIAL_WHATSAPP_LINK === 'https://wa.me/201228744400', 'Official WhatsApp link points to https://wa.me/201228744400');

  const generatedAr = buildWhatsAppLink({ serviceName: 'تشطيب شقق متكامل', lang: 'ar' });
  assert(generatedAr.startsWith('https://wa.me/201228744400?text='), 'Bilingual Arabic link starts with 201228744400');
  assert(generatedAr.includes(encodeURIComponent('تشطيب شقق متكامل')), 'Arabic link contains contextual service name');

  const generatedEn = buildWhatsAppLink({ serviceName: 'Full Apartment Fit-Out', lang: 'en' });
  assert(generatedEn.startsWith('https://wa.me/201228744400?text='), 'Bilingual English link starts with 201228744400');

  // -----------------------------------------------------------------
  // 2. Apartment Stage 5 Separation Verification
  // -----------------------------------------------------------------
  console.log('\n--- 2. Apartment Stage 5 Integrity ---');
  const stage5 = APARTMENT_STAGES_MANIFEST.find((s) => s.slotKey === 'apartment-stage-05');
  assert(Boolean(stage5), 'apartment-stage-05 exists in APARTMENT_STAGES_MANIFEST');
  assert(stage5?.imageUrl === undefined, 'apartment-stage-05 has NO image assigned (imageUrl === undefined)');
  assert(stage5?.isPlaceholder === true, 'apartment-stage-05 isPlaceholder is true');

  const manifestPath = path.resolve(rootDir, 'data', 'media-manifest.json');
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert(manifestData.slots['apartment-stage-05'] === undefined, 'data/media-manifest.json has NO assignment for apartment-stage-05');

  // -----------------------------------------------------------------
  // 3. AI-Generated Concept Safeguard Verification
  // -----------------------------------------------------------------
  console.log('\n--- 3. AI Concept Safeguard ---');
  const geminiAssignedInPortfolio = PORTFOLIO_SLOTS_MANIFEST.some((p) => p.imageUrl && p.imageUrl.includes('Gemini_'));
  assert(!geminiAssignedInPortfolio, 'No Gemini_ image is assigned in PORTFOLIO_SLOTS_MANIFEST');

  const geminiInManifestSlots = Object.values(manifestData.slots).some((s: any) => s && s.url && s.url.includes('Gemini_'));
  assert(!geminiInManifestSlots, 'No Gemini_ image is assigned in data/media-manifest.json slots');

  const geminiFilePath = path.resolve(rootDir, 'public', 'assets', 'inbox', 'Gemini_Generated_Image_32iexj32iexj32ie.jpg');
  assert(fs.existsSync(geminiFilePath), 'Physical Gemini file is preserved safely in disk archive without deletion');

  // -----------------------------------------------------------------
  // 4. Server Security & Read-Only Protection Verification
  // -----------------------------------------------------------------
  console.log('\n--- 4. Server-Side Security & 401 Enforcement ---');
  
  // Public route test
  const manifestRes = await fetch(`${BASE_URL}/api/media/manifest`);
  assert(manifestRes.status === 200, 'Public GET /api/media/manifest returns HTTP 200 OK');

  // Unauthorized write attempts must return 401
  const endpointsToTest: Array<{ method: string; path: string; body?: any }> = [
    { method: 'POST', path: '/api/upload', body: { slotKey: 'test', dataUrl: 'data:image/png;base64,...' } },
    { method: 'POST', path: '/api/media/save-slot', body: { slotKey: 'plumbing-01', url: '/test.jpg' } },
    { method: 'POST', path: '/api/media/delete-slot', body: { slotKey: 'plumbing-01' } },
    { method: 'POST', path: '/api/media/reset-all', body: { confirmResetAll: true } },
    { method: 'POST', path: '/api/media/create-signed-upload-url', body: { slotKey: 'test', fileName: 'test.jpg', mimeType: 'image/jpeg' } },
    { method: 'POST', path: '/api/media/confirm-upload', body: { slotKey: 'test', fileName: 'test.jpg', publicUrl: 'https://test' } },
    { method: 'POST', path: '/api/media/migrate-existing-files', body: {} },
    { method: 'POST', path: '/api/settings/supabase', body: { supabaseUrl: 'https://test', supabaseKey: 'test', bucketName: 'test' } },
    { method: 'GET', path: '/api/media/inventory' },
    { method: 'GET', path: '/api/media/inbox' },
    { method: 'GET', path: '/api/settings/supabase-status' }
  ];

  for (const ep of endpointsToTest) {
    const res = await fetch(`${BASE_URL}${ep.path}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.body ? JSON.stringify(ep.body) : undefined
    });
    assert(res.status === 401, `Unauthorized ${ep.method} ${ep.path} rejected with HTTP 401`);
  }

  // Admin authentication verification
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: 'hosny2026' })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && loginData.success === true, 'Admin login with valid PIN returns HTTP 200 and token');

  const authInventoryRes = await fetch(`${BASE_URL}/api/media/inventory`, {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  assert(authInventoryRes.status === 200, 'Authenticated GET /api/media/inventory returns HTTP 200 OK');

  // -----------------------------------------------------------------
  // 5. Video Library Completeness (12 Videos)
  // -----------------------------------------------------------------
  console.log('\n--- 5. Video Library Architecture (12 Videos) ---');
  assert(VIDEO_SLOTS_MANIFEST.length === 12, 'VIDEO_SLOTS_MANIFEST defines 12 videos (5 original + 7 cloud)');

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
