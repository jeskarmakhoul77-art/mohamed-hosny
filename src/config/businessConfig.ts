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
  siteVisitFeeEgp: 0,
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
  feeEgp: 0,
  deductible: true,
  summaryAr: 'معاينة هندسية ميدانية شاملة للموقع يترأسها المهندس وفريقه الفني لرفع المقاسات وتقديم الاستشارة الإنشائية والمعمارية.',
  summaryEn: 'Comprehensive on-site engineering survey led by the engineer and technical team to verify dimensions and provide structural consultation.',
  paymentNoticeAr: 'يتم التنسيق وتحديد الموعد المناسب لزيارة الموقع وتأكيد التفاصيل مباشرة عبر محادثة واتساب الرسمية.',
  paymentNoticeEn: 'Appointment scheduling and preliminary scope coordination occur directly through the official WhatsApp conversation.',
  detailsAr: [
    'المعاينة تشمل الفحص الإنشائي والمعماري الميداني للموقع ورفع المقاسات الدقيقة ومناقشة متطلبات العميل بدقة.',
    'وضع التقرير الهندسي الأولي للشيرب والمناسيب وتوزيع المساحات واحتياجات التأسيس.',
    'تقديم استشارة فنية شاملة حول أفضل الخامات والمواصفات القياسية الملائمة للموقع.',
    'يتم تأكيد الموعد النهائي للمعاينة بالتنسيق المباشر عبر تطبيق واتساب.'
  ],
  detailsEn: [
    'The inspection covers physical architectural assessment, structural check, dimensions recording, and in-depth scope consultation.',
    'Formulating engineering observations, preliminary space allocation, and rough-in requirements.',
    'Providing comprehensive technical consultation on approved materials and construction standards.',
    'The final appointment schedule is confirmed directly through mutual coordination on WhatsApp.'
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

  return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}
