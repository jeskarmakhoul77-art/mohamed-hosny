import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});
const inboxDir = path.resolve('public/assets/inbox');

const files = fs.readdirSync(inboxDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

console.log(`Found ${files.length} image files in ${inboxDir}`);

async function analyzeImage(filename) {
  const filePath = path.join(inboxDir, filename);
  const data = fs.readFileSync(filePath);
  const base64Data = data.toString('base64');
  
  const prompt = `You are a senior civil and architectural engineer in Egypt inspecting photos for an interior finishing and contracting firm (MOHAMED HOSNY).
Analyze this exact image and output a valid JSON object (no markdown code blocks, just raw JSON) with the following fields:
{
  "categoryKey": "plumbing" | "electrical" | "plastering" | "flooring" | "gypsum" | "painting" | "interior" | "commercial" | "unspecified",
  "categoryAr": string (اسم التخصص بالعربية: السباكة والصرف / التأسيسات الكهربائية / المحارة وتجهيز الحوائط / السيراميك والبورسلين / الجبس بورد والأسقف / الدهانات والديكور / التصميم الداخلي والفرش / واجهات ومحلات تجارية / غير محدد),
  "categoryEn": string,
  "contentType": "site_photo" | "blueprint" | "screenshot" | "3d_render" | "graphic",
  "descriptionAr": string (وصف دقيق ومختصر لما يظهر فعلياً في الصورة باللغة العربية),
  "descriptionEn": string (concise description in English),
  "stageAr": string (مرحلة التنفيذ: تأسيس / تشطيب أولي / تشطيب نهائي / تصميم ومخطط / توثيق),
  "isDuplicateOrSimilar": boolean (true if it appears to be a duplicate or copy),
  "needsReview": boolean (true if it is a screenshot, plan, low quality, or ambiguous),
  "reviewNotesAr": string (ملاحظات تدقيق: مثلاً لقطة شاشة إنستغرام، مخطط 2D، تصميم 3D، صورة واضحة لتأسيس كهرباء، إلخ),
  "reviewNotesEn": string
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ]
    });

    const text = response.text.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(text);
    return {
      fileName: filename,
      url: `/assets/inbox/${encodeURIComponent(filename)}`,
      sizeBytes: data.length,
      sizeKb: (data.length / 1024).toFixed(1),
      ...parsed
    };
  } catch (err) {
    console.error(`Error analyzing ${filename}:`, err.message);
    return {
      fileName: filename,
      url: `/assets/inbox/${encodeURIComponent(filename)}`,
      sizeBytes: data.length,
      sizeKb: (data.length / 1024).toFixed(1),
      categoryKey: "unspecified",
      categoryAr: "غير محدد",
      categoryEn: "Unspecified",
      contentType: "site_photo",
      descriptionAr: "تعذر التحليل الآلي، بانتظار المراجعة اليدوية",
      descriptionEn: "Awaiting manual review",
      stageAr: "غير محدد",
      isDuplicateOrSimilar: filename.includes('Copy'),
      needsReview: true,
      reviewNotesAr: "تحتاج إلى مراجعة يدوية",
      reviewNotesEn: "Needs manual review"
    };
  }
}

async function run() {
  const results = [];
  // Process in small batches of 5 to avoid rate limits
  for (let i = 0; i < files.length; i += 5) {
    const batch = files.slice(i, i + 5);
    console.log(`Processing batch ${i + 1} to ${Math.min(i + 5, files.length)} of ${files.length}...`);
    const batchResults = await Promise.all(batch.map(f => analyzeImage(f)));
    results.push(...batchResults);
  }

  const outputPath = path.resolve('src/config/inboxInventory.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Successfully analyzed ${results.length} images and saved to ${outputPath}`);
}

run();
