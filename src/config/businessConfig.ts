import { BusinessConfig } from '../types';

// Default business configuration
// Mohamed Hosny — Construction & Interior Design
export const DEFAULT_WHATSAPP_NUMBER = '201000000000'; // Default Egyptian placeholder format: +20 1X XXXX XXXX

export function getStoredWhatsAppNumber(): string {
  try {
    const saved = localStorage.getItem('mh_whatsapp_number');
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // ignore
  }
  return '';
}

export function setStoredWhatsAppNumber(num: string): void {
  try {
    localStorage.setItem('mh_whatsapp_number', num.trim());
  } catch {
    // ignore
  }
}

export const BUSINESS_CONFIG: BusinessConfig = {
  brandName: 'MOHAMED HOSNY',
  descriptorEn: 'CONSTRUCTION & INTERIOR DESIGN',
  descriptorAr: 'للتشطيبات المعمارية والتصميم الداخلي',
  brandLineEn: 'From Vision to Reality.',
  brandLineAr: 'من الفكرة إلى التنفيذ.',
  siteVisitFeeEgp: 600,
  // Central WhatsApp number configuration:
  // Dynamically retrieved or updated
  whatsappNumber: getStoredWhatsAppNumber(),
  instapayAddress: '',
  bankAccountName: 'المهندس محمد حسني — حساب التشطيبات المعمارية',
  bankAccountNumber: '',
  bankIban: '',
  bankName: 'البنك التجاري الدولي (CIB)',
  serviceAreaAr: 'القاهرة الكبرى، الجيزة، وجميع محافظات جمهورية مصر العربية',
  serviceAreaEn: 'Greater Cairo, Giza, and all Governorates across Egypt',
  email: '',
};

export const FEE_POLICY = {
  feeEgp: 600,
  deductible: true,
  summaryAr: 'رسوم المعاينة الهندسية الميدانية 600 جنيه مصري، وتُخصم بالكامل من إجمالي تكلفة المقاولة عند الاتفاق على تنفيذ المشروع.',
  summaryEn: 'Site visit engineering fee is 600 EGP, 100% credited towards the project execution contract upon agreement.',
  paymentNoticeAr: 'يتم إرسال بيانات التحويل (InstaPay أو Vodafone Cash) يدوياً عبر محادثة واتساب بعد الاتفاق المبدئي، ولا يتم أي دفع إلكتروني داخل الموقع.',
  paymentNoticeEn: 'Payment instructions (InstaPay or Vodafone Cash) are shared directly via WhatsApp conversation upon initial agreement. No online payment occurs on this website.',
  detailsAr: [
    'المعاينة تشمل الفحص الإنشائي والمعماري الميداني للموقع ورفع المقاسات المبدئية ومناقشة متطلبات العميل بدقة.',
    'في حال الاتفاق على تنفيذ الأعمال مع المؤسسة، يُخصم مبلغ الـ 600 ج.م بالكامل من دفعة التعاقد الأولى.',
    'في حال عدم الاتفاق على التنفيذ، يظل المبلغ مستحقاً مقابل خدمة الفحص الفني والاستشارة الهندسية الميدانية.',
    'يتم تأكيد الموعد النهائي للمعاينة بعد التحقق المتبادل عبر واتساب من استلام الرسوم.'
  ],
  detailsEn: [
    'The inspection covers physical architectural assessment, structural check, dimensions recording, and in-depth scope consultation.',
    'If you agree to execute the project with us, the 600 EGP fee is credited 100% towards the execution contract.',
    'If no execution agreement is finalized, the fee remains earned for the professional on-site engineering assessment.',
    'The final appointment time is confirmed directly via WhatsApp once transfer receipt is reconciled.'
  ]
};

// Centralized Cinematic Slideshow Images for Hero Section
export interface HeroSlide {
  id: number;
  imageUrl: string;
  titleAr: string;
  titleEn: string;
  captionAr: string;
  captionEn: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    imageUrl: '/src/assets/images/hero_luxury_apartment_living_1792893858819.jpg',
    titleAr: 'تشطيب سكني فاخر بإتقان هندسي',
    titleEn: 'Luxury Residential Fit-Out & Detailing',
    captionAr: 'تناغم الخامات الطبيعية مع الإضاءة المعمارية المدروسة',
    captionEn: 'Harmonious blend of natural timber, marble, and architectural illumination'
  },
  {
    id: 2,
    imageUrl: '/src/assets/images/hero_architectural_finishing_details_1792893859892.jpg',
    titleAr: 'دقة التأسيس وتفاصيل المحارة والجبس بورد',
    titleEn: 'Precision Plastering, MEP & Ceiling Details',
    captionAr: 'استواء هندسي للأسطح وبيوت نور مخفية بأعلى المعايير',
    captionEn: 'Laser-straight surface leveling, hidden light coves, and premium flooring'
  },
  {
    id: 3,
    imageUrl: '/src/assets/images/hero_commercial_retail_space_1792893859170.jpg',
    titleAr: 'تشطيب مساحات ومحلات تجارية راقية',
    titleEn: 'High-End Commercial & Retail Fit-Outs',
    captionAr: 'واجهات وتجهيزات معمارية متينة تلائم بيئات العمل والنشاط',
    captionEn: 'Durable commercial finishes, custom storefronts, and brand aesthetics'
  },
  {
    id: 4,
    imageUrl: '/src/assets/images/hero_luxury_dining_kitchen_1792893860066.jpg',
    titleAr: 'تصميم داخلي معاصر وتشطيب تسليم مفتاح',
    titleEn: 'Contemporary Turnkey Interior Architecture',
    captionAr: 'من أول فكرة ومخطط حتى أدق تفصيلة في التسليم النهائي',
    captionEn: 'From initial floor layout to the finest turnkey execution details'
  }
];

/**
 * Builds prefilled bilingual WhatsApp link with customer template fields
 */
export function buildWhatsAppLink(options: {
  serviceName?: string;
  projectStage?: string;
  lang?: 'ar' | 'en';
}): string {
  const whatsappNumber = getStoredWhatsAppNumber() || BUSINESS_CONFIG.whatsappNumber;
  const lang = options.lang || 'ar';
  const service = options.serviceName || (lang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out');

  let text = '';
  if (lang === 'ar') {
    text = `السلام عليكم مؤسسة المهندس محمد حسني للتشطيبات المعمارية،
أرغب في حجز معاينة هندسية لمشروعي (الخدمة: ${service}).

📋 بيانات المشروع المبدئية:
- الاسم الكريم: 
- المنطقة / العنوان: 
- نوع العقار (شقة / فيلا / محل / مقر إداري): 
- المساحة التقريبية (م²): 
- حالة العقار الحالية (طوب أحمر / نصف تشطيب / تجديد): 
- الموعد المقترح للمعاينة: 
- تفاصيل إضافية: 

(ملاحظة: أتفهم أن رسوم المعاينة 600 ج.م تُخصم بالكامل عند التعاقد على التنفيذ، وبرجاء تزويدي ببيانات التحويل عبر InstaPay أو Vodafone Cash).`;
  } else {
    text = `Hello Eng. Mohamed Hosny Construction & Interior Design,
I would like to request an on-site engineering inspection (Service: ${service}).

📋 Project Details:
- Full Name: 
- Location / District: 
- Property Type (Apartment / Villa / Shop / Office): 
- Approximate Area (sqm): 
- Current Property Stage (Red brick / Semi-finished / Renovation): 
- Preferred Inspection Date: 
- Additional Notes: 

(Note: I understand the 600 EGP site visit inspection fee is 100% credited towards the contract upon execution agreement. Please provide transfer instructions via InstaPay or Vodafone Cash).`;
  }

  return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}
