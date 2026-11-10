import { BusinessConfig } from '../types';

// Official business configuration
// Mohamed Hosny — Construction & Interior Design
export const OFFICIAL_WHATSAPP_NUMBER = '201228744400'; // International format for wa.me
export const DISPLAY_WHATSAPP_NUMBER = '01228744400';   // Local format displayed to users
export const DEFAULT_WHATSAPP_NUMBER = OFFICIAL_WHATSAPP_NUMBER;
export const OFFICIAL_WHATSAPP_LINK = 'https://wa.me/201228744400';

export function getStoredWhatsAppNumber(): string {
  try {
    const saved = localStorage.getItem('mh_whatsapp_number');
    if (saved && saved.trim() && saved.trim() !== '201000000000' && saved.trim() !== '201055865637') {
      let clean = saved.trim().replace(/[^0-9]/g, '');
      if (clean.startsWith('01') && clean.length === 11) {
        clean = '2' + clean;
      }
      if (clean && clean !== '201055865637') return clean;
    }
  } catch {
    // ignore
  }
  return OFFICIAL_WHATSAPP_NUMBER;
}

export function setStoredWhatsAppNumber(num: string): void {
  try {
    let clean = num.trim().replace(/[^0-9]/g, '');
    if (clean.startsWith('01') && clean.length === 11) {
      clean = '2' + clean;
    }
    localStorage.setItem('mh_whatsapp_number', clean || OFFICIAL_WHATSAPP_NUMBER);
  } catch {
    // ignore
  }
}

export const BUSINESS_CONFIG: BusinessConfig = {
  brandName: 'MOHAMED HOSNY',
  descriptorEn: 'CONSTRUCTION & INTERIOR DESIGN',
  descriptorAr: 'للتشطيبات المعمارية والتصميم الداخلي',
  brandLineEn: 'From Concept to Completion.',
  brandLineAr: 'من الفكرة إلى التنفيذ.',
  siteVisitFeeEgp: 600,
  // Central WhatsApp number configuration:
  whatsappNumber: OFFICIAL_WHATSAPP_NUMBER,
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
  summaryAr: 'معاينة هندسية ميدانية شاملة للموقع يترأسها المهندس وفريقه الفني لرفع المقاسات وتقديم الاستشارة الإنشائية والمعمارية (رسوم المعاينة: 600 ج.م تُخصم بالكامل من قيمة التعاقد النهائي).',
  summaryEn: 'Comprehensive on-site engineering survey led by the engineer and technical team (600 EGP fee, fully deductible from the final execution contract).',
  paymentNoticeAr: 'رسوم المعاينة (600 ج.م) تُسدد عبر إنستاباي (InstaPay) أو التحويل البنكي، ولا يُعتمد الموعد نهائياً إلا بعد مراجعة وقبول الطلب وتأكيده عبر واتساب.',
  paymentNoticeEn: 'Inspection fee (600 EGP) is payable via InstaPay or bank transfer. Appointments are confirmed only upon review, approval, and WhatsApp confirmation.',
  detailsAr: [
    'المعاينة تشمل الفحص الإنشائي والمعماري الميداني للموقع ورفع المقاسات الدقيقة ومناقشة متطلبات العميل بدقة.',
    'رسوم المعاينة الهندسية: 600 جنيه مصري، تُخصم بالكامل من إجمالي قيمة التعاقد عند بدء التنفيذ.',
    'طرق السداد المعتمدة: إنستاباي (InstaPay) أو التحويل البنكي مع إمكانية إرسال إيصال السداد.',
    'لا يُعتبر الموعد مؤكداً ونهائياً إلا بعد مراجعة الطلب والموافقة عليه والتنسيق المباشر عبر واتساب.',
    'وضع التقرير الهندسي الأولي للشيرب والمناسيب وتوزيع المساحات واحتياجات التأسيس.',
    'تقديم استشارة فنية شاملة حول أفضل الخامات والمواصفات القياسية الملائمة للموقع.'
  ],
  detailsEn: [
    'The inspection covers physical architectural assessment, structural check, dimensions recording, and in-depth scope consultation.',
    'Engineering survey fee: 600 EGP, fully deductible from the total execution contract value upon signing.',
    'Accepted payment methods: InstaPay or bank transfer, with client payment receipt submission.',
    'Appointments are officially confirmed only after company review, verification, and mutual WhatsApp coordination.',
    'Formulating engineering observations, preliminary space allocation, and rough-in requirements.',
    'Providing comprehensive technical consultation on approved materials and construction standards.'
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
 * or returns base https://wa.me/201228744400 if no options are passed
 */
export function buildWhatsAppLink(options?: {
  serviceName?: string;
  projectStage?: string;
  lang?: 'ar' | 'en';
}): string {
  let whatsappNumber = getStoredWhatsAppNumber() || BUSINESS_CONFIG.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER;
  let cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('01') && cleanNumber.length === 11) {
    cleanNumber = '2' + cleanNumber;
  }
  if (!cleanNumber || cleanNumber === '201000000000') {
    cleanNumber = OFFICIAL_WHATSAPP_NUMBER;
  }

  if (!options) {
    return `https://wa.me/${cleanNumber}`;
  }

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

برجاء تأكيد الموعد ومناقشة التفاصيل الهندسية.`;
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

Please reach out to confirm the appointment and discuss technical details.`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
