import { ApartmentStageSlot, PortfolioSlot, VideoSlot } from '../types';
import {
  APARTMENT_STAGES_MANIFEST,
  PORTFOLIO_SLOTS_MANIFEST,
  VIDEO_SLOTS_MANIFEST
} from '../config/assetsManifest';

export const INITIAL_APARTMENT_STAGES: ApartmentStageSlot[] = APARTMENT_STAGES_MANIFEST;
export const INITIAL_PORTFOLIO_SLOTS: PortfolioSlot[] = PORTFOLIO_SLOTS_MANIFEST;
export const INITIAL_VIDEO_SLOTS: VideoSlot[] = VIDEO_SLOTS_MANIFEST;

export const CORE_SERVICES = [
  {
    id: 1,
    titleAr: 'تشطيب شقق متكامل من البداية للنهاية',
    titleEn: 'Full Apartment Fit-Out & Handover',
    summaryAr: 'إدارة هندسية شاملة لكافة مراحل التشطيب من مرحلة الطوب الأحمر حتى تسليم المفتاح بمواصفات قياسية.',
    summaryEn: 'Turnkey architectural delivery from bare brick structure to final key handover with rigorous quality control.',
    icon: 'home',
    featured: true
  },
  {
    id: 2,
    titleAr: 'ديكور وتصميم داخلي متناسق',
    titleEn: 'Interior Design & Decoration',
    summaryAr: 'دراسة توزيع الفراغات واختيار الخامات والإضاءة والألوان لتكوين هوية معمارية فريدة ومتناغمة.',
    summaryEn: 'Spatial planning, material selection, lighting design, and personalized aesthetics tailored to your lifestyle.',
    icon: 'palette',
    featured: true
  },
  {
    id: 3,
    titleAr: 'تشطيب محلات تجارية ومكاتب',
    titleEn: 'Commercial Shops & Office Fit-Out',
    summaryAr: 'تنفيذ المشروعات التجارية بمعايير تلائم طبيعة النشاط والضغط التشغيلي وبجودة تعكس فخامة علامتك.',
    summaryEn: 'High-durability retail and workplace execution engineered for customer flow and brand impact.',
    icon: 'store',
    featured: true
  },
  {
    id: 4,
    titleAr: 'ترميم وتجديد وتطوير المساحات',
    titleEn: 'Renovation & Space Upgrading',
    summaryAr: 'إعادة إحياء وتحديث العقارات القديمة وتعديل التقسيمات المعمارية ودعم البنية التحتية المتضررة.',
    summaryEn: 'Modernizing dated properties, structural reconfigurations, and upgrading aging electrical and plumbing networks.',
    icon: 'hammer',
    featured: false
  },
  {
    id: 5,
    titleAr: 'تأسيس وتعديل أعمال السباكة',
    titleEn: 'Plumbing Installation & Modification',
    summaryAr: 'شبكات تغذية وصرف معتمدة مع عزل كيميائي دقيق واختبارات ضغط تحت إشراف هندسي.',
    summaryEn: 'Certified water supply, drainage networks, chemical waterproofing, and hydrostatic testing.',
    icon: 'droplet',
    featured: false
  },
  {
    id: 6,
    titleAr: 'تأسيس وتعديل الشبكات الكهربائية',
    titleEn: 'Electrical Networks & Smart Power',
    summaryAr: 'توزيع أحمال احترافي، كابلات معتمدة، وتأسيس شبكات التيار الخفيف والإنترنت والمراقبة.',
    summaryEn: 'Balanced load panels, high-grade copper conduits, data networks, and modern lighting distribution.',
    icon: 'zap',
    featured: false
  },
  {
    id: 7,
    titleAr: 'أعمال المحارة وتجهيز ومعالجة الأسطح',
    titleEn: 'Plastering & Surface Leveling',
    summaryAr: 'بؤج وأوتار بميزان الليزر وشبك فواصل لمنع الترييح وضمان استواء الجدران والزوايا 90 درجة.',
    summaryEn: 'Laser-guided plumb screeding, reinforced joint mesh, and true 90-degree square corners.',
    icon: 'layers',
    featured: false
  },
  {
    id: 8,
    titleAr: 'تركيب السيراميك والبورسلين والرخام',
    titleEn: 'Ceramic, Porcelain & Marble Installation',
    summaryAr: 'تركيب بميزان ليزر وكلبسات تسوية متطورة مع شطف 45 درجة وسقاية إيبوكسية مضادة للبكتيريا.',
    summaryEn: 'Laser leveling, zero-lippage clips, 45-degree mitered corners, and antibacterial epoxy grouting.',
    icon: 'grid',
    featured: false
  },
  {
    id: 9,
    titleAr: 'أسقف معلقة وتفاصيل جبس بورد',
    titleEn: 'Gypsum Board & Suspended Ceilings',
    summaryAr: 'شاسيهات مجلفنة متينة، بيوت نور مخفية، وتجاويف ستائر غاطسة بألواح مقاومة للرطوبة.',
    summaryEn: 'Heavy galvanized suspension, indirect lighting troughs, recessed curtain pockets, and moisture-resistant boards.',
    icon: 'layout',
    featured: false
  },
  {
    id: 10,
    titleAr: 'دهانات حديثة وتشطيبات جدارية ديكورية',
    titleEn: 'Painting & Architectural Coatings',
    summaryAr: 'سحب 4 سكاكين معجون ناعم، دهانات حريرية ومطفية قابلة للغسيل، وميكروسيمنت وبانوهات كلاسيكية.',
    summaryEn: 'Multi-layer skim puttying, premium washable finishes, microcement textures, and classic boiserie trims.',
    icon: 'brush',
    featured: false
  },
  {
    id: 11,
    titleAr: 'تنسيق التركيبات النهائية وتسليم المفتاح',
    titleEn: 'Final Fitments & Turnkey Handover',
    summaryAr: 'تركيب الأبواب والأدوات الصحية ووحدات الإضاءة والتنظيف المعماري الشامل وتسليم المشروع خالياً من أي ملاحظات.',
    summaryEn: 'Final hardware mounting, luminaire testing, deep site cleaning, and zero-defect handover protocol.',
    icon: 'check-circle',
    featured: false
  }
];

export const WORK_PROCESS_STEPS = [
  {
    step: '01',
    titleAr: 'طلب المعاينة والاستفسار المبدئي',
    titleEn: 'Initial Inquiry & Booking',
    descAr: 'يقوم العميل بتقديم بيانات المشروع وحجز موعد المعاينة الهندسية وسداد رسوم المعاينة الميدانية (600 ج.م).',
    descEn: 'Submit project details, select preferred date, and submit the 600 EGP site visit inspection fee.'
  },
  {
    step: '02',
    titleAr: 'المعاينة الهندسية الميدانية',
    titleEn: 'On-Site Technical Inspection',
    descAr: 'زيارة الموقع الفعلي لفحص الحالة الإنشائية، رفع المقاسات الدقيقة، والاستماع لرؤية العميل ومتطلباته.',
    descEn: 'On-site engineering assessment, accurate laser dimensioning, and in-depth consultation on client priorities.'
  },
  {
    step: '03',
    titleAr: 'تحديد نطاق الأعمال والمواصفات',
    titleEn: 'Scope of Work & Specifications',
    descAr: 'صياغة جدول تفصيلي بالأعمال المطلوبة، أنواع الخامات المعتمدة، وبنود التشطيب لكل غرفة وفراغ.',
    descEn: 'Formulation of room-by-room specifications, approved materials schedule, and detailed scope outline.'
  },
  {
    step: '04',
    titleAr: 'المقايسة والتعاقد وخصم رسوم المعاينة',
    titleEn: 'Quotation, Contract & Fee Deduction',
    descAr: 'تقديم مقايسة أسعار شفافة ومفصلة. عند توقيع العقد يُخصم مبلغ الـ 600 ج.م بالكامل من دفعة التعاقد.',
    descEn: 'Transparent itemized quotation. Upon contract agreement, the 600 EGP inspection fee is 100% deducted.'
  },
  {
    step: '05',
    titleAr: 'الجدول الزمني والتحضير والتجهيز',
    titleEn: 'Scheduling & Site Preparation',
    descAr: 'وضع جدول زمني للمراحل، توريد الخامات الأساسية، وتعيين مشرف الموقع لبدء الأعمال طبقاً للمخطط.',
    descEn: 'Milestone project timeline, procurement of approved baseline materials, and site supervisor assignment.'
  },
  {
    step: '06',
    titleAr: 'التنفيذ وتنسيق المراحل الإنشائية',
    titleEn: 'Coordinated Stage Execution',
    descAr: 'تنفيذ أعمال التأسيس والمحارة والجبس بورد والتشطيبات بتنسيق دقيق واختبارات فنية قبل كل مرحلة.',
    descEn: 'Sequential execution across MEP, masonry, plaster, gypsum, and decor with stage-by-stage quality signoffs.'
  },
  {
    step: '07',
    titleAr: 'المراجعة الفنية وتسليم المفتاح',
    titleEn: 'Final Quality Review & Handover',
    descAr: 'فحص نهائي شامل لجميع النقاط التشغيلية، تنظيف الموقع معمارياً، وتسليم المفتاح للعميل بضمان الأعمال.',
    descEn: 'Rigorous punch-list inspection, deep architectural cleaning, and turnkey handover to client delight.'
  }
];
