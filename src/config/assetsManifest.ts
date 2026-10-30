import { ApartmentStageSlot, PortfolioSlot, VideoSlot } from '../types';

/**
 * =====================================================================
 * MOHAMED HOSNY — CENTRAL ASSETS MANIFEST (ملف إعدادات الوسائط المركزي)
 * =====================================================================
 * This file is the single source of truth for all 45 designated image slots
 * and 5 designated video slots.
 *
 * HOW TO ADD / REPLACE ANY IMAGE OR VIDEO:
 * ---------------------------------------------------------------------
 * Option A (Local File in Public Folder):
 *   Simply place your file into the designated folder with the designated filename.
 *   Example: put your image in `/public/assets/projects/plumbing/plumbing-01.jpg`
 *   and set `imageUrl: '/assets/projects/plumbing/plumbing-01.jpg'` below.
 *
 * Option B (Direct URL or Cloud CDN):
 *   Paste the image or video URL directly into the `imageUrl` or `videoUrl` field below.
 *
 * All slots will automatically render without any code modification.
 */

export const APARTMENT_STAGES_MANIFEST: ApartmentStageSlot[] = [
  {
    stageNumber: 1,
    slotKey: 'apartment-stage-01',
    defaultFilePath: '/assets/projects/apartment/stage-01.jpg',
    phaseLabelAr: 'المرحلة 01',
    phaseLabelEn: 'Stage 01',
    titleAr: 'الحالة الأولية والتجهيز والتكسير',
    titleEn: 'Initial Condition & Site Preparation',
    descriptionAr: 'معاينة الموقع ورفع المقاسات وإزالة المخلفات وتجهيز الحوائط والمسارات الإنشائية لبدء أعمال التأسيس.',
    descriptionEn: 'Initial site inspection, architectural dimensioning, debris clearance, and masonry preparation before MEP rough-in.',
    imageUrl: undefined, // Replace with '/assets/projects/apartment/stage-01.jpg' or external URL
    isPlaceholder: true,
    notes: 'مخصص للصورة الأصلية الأولى للشقة عند الاستلام'
  },
  {
    stageNumber: 2,
    slotKey: 'apartment-stage-02',
    defaultFilePath: '/assets/projects/apartment/stage-02.jpg',
    phaseLabelAr: 'المرحلة 02',
    phaseLabelEn: 'Stage 02',
    titleAr: 'تأسيس السباكة والكهرباء (الشيرب والمسارات)',
    titleEn: 'Plumbing & Electrical First-Fix',
    descriptionAr: 'تمديد مواسير الصرف والتغذية بالضغط المعتمد ودفن خراطيم ولوحات الكهرباء وتحديد نقاط الإنارة والتكييف.',
    descriptionEn: 'Pressure-tested PPR plumbing lines, conduit embedment, distribution boards, and precise electrical boxes layout.',
    imageUrl: undefined, // Replace with '/assets/projects/apartment/stage-02.jpg' or external URL
    isPlaceholder: true,
    notes: 'مخصص للصورة الأصلية لأعمال السباكة والكهرباء للشقة ذاتها'
  },
  {
    stageNumber: 3,
    slotKey: 'apartment-stage-03',
    defaultFilePath: '/assets/projects/apartment/stage-03.jpg',
    phaseLabelAr: 'المرحلة 03',
    phaseLabelEn: 'Stage 03',
    titleAr: 'المحارة وتجهيز الأسطح وتركيب الأرضيات',
    titleEn: 'Plastering, Surface Leveling & Tiling',
    descriptionAr: 'ضبط البؤج والأوتار وعمل الطرطشة والمحارة المستوية، تليها أعمال تركيب السيراميك والبورسلين بميزان ليزر.',
    descriptionEn: 'Laser-guided screeding and wall plastering followed by precision porcelain and ceramic tile installation.',
    imageUrl: undefined, // Replace with '/assets/projects/apartment/stage-03.jpg' or external URL
    isPlaceholder: true,
    notes: 'مخصص للصورة الأصلية لأعمال المحارة والتبليط للشقة ذاتها'
  },
  {
    stageNumber: 4,
    slotKey: 'apartment-stage-04',
    defaultFilePath: '/assets/projects/apartment/stage-04.jpg',
    phaseLabelAr: 'المرحلة 04',
    phaseLabelEn: 'Stage 04',
    titleAr: 'أسقف الجبس بورد وتأسيس المعجون والدهان',
    titleEn: 'Gypsum Ceilings & Paint Base Coats',
    descriptionAr: 'تثبيت شاسيهات الصاج وألواح الجبس بورد المقاومة للرطوبة وتجهيز بيوت النور وبدء مراحل سحب المعجون.',
    descriptionEn: 'Galvanized steel framing, moisture-resistant gypsum boards, recessed lighting coves, and skim-coat putty layers.',
    imageUrl: undefined, // Replace with '/assets/projects/apartment/stage-04.jpg' or external URL
    isPlaceholder: true,
    notes: 'مخصص للصورة الأصلية للجبس بورد وبطانات الدهان للشقة ذاتها'
  },
  {
    stageNumber: 5,
    slotKey: 'apartment-stage-05',
    defaultFilePath: '/assets/projects/apartment/stage-05.jpg',
    phaseLabelAr: 'المرحلة 05',
    phaseLabelEn: 'Stage 05',
    titleAr: 'التسليم النهائي والفرش والديكور المتكامل',
    titleEn: 'Final Handover & Completed Interior',
    descriptionAr: 'إنهاء أوجه الدهان النهائية وتركيب المفاتيح ووحدات الإضاءة والأبواب والتنظيف المعماري الشامل وتسليم المفتاح.',
    descriptionEn: 'Top-coat architectural paints, designer luminaires, sanitary fittings, final architectural detailing and client handover.',
    imageUrl: undefined, // Replace with '/assets/projects/apartment/stage-05.jpg' or external URL
    isPlaceholder: true,
    notes: 'مخصص للصورة الأصلية للنتيجة النهائية للشقة ذاتها بعد اكتمال التشطيب'
  }
];

export const PORTFOLIO_SLOTS_MANIFEST: PortfolioSlot[] = [
  // 1. Plumbing (5 slots: plumbing-01 to plumbing-05)
  {
    id: 1,
    slotKey: 'plumbing-01',
    defaultFilePath: '/assets/projects/plumbing/plumbing-01.jpg',
    category: 'plumbing',
    categoryLabelAr: 'أعمال السباكة والصرف',
    categoryLabelEn: 'Plumbing Systems',
    titleAr: 'شبكة تغذية حمامات ومطابخ معتمدة',
    titleEn: 'Certified Bathroom & Kitchen Supply Lines',
    descriptionAr: 'تمديد مواسير البولي بروبلين المعتمدة واختبارها بالضغط العالي قبل أعمال العزل.',
    descriptionEn: 'PPR supply piping network pressure tested before waterproofing application.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 2,
    slotKey: 'plumbing-02',
    defaultFilePath: '/assets/projects/plumbing/plumbing-02.jpg',
    category: 'plumbing',
    categoryLabelAr: 'أعمال السباكة والصرف',
    categoryLabelEn: 'Plumbing Systems',
    titleAr: 'عزل كيميائي لأرضيات الحمامات',
    titleEn: 'Chemical Bathroom Floor Waterproofing',
    descriptionAr: 'تطبيق طبقات العزل الكيميائي المزدوج واختبار الغمر بالمياه لمدة 48 ساعة.',
    descriptionEn: 'Dual-coat polymer waterproofing tested by 48-hour static water pooling.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 3,
    slotKey: 'plumbing-03',
    defaultFilePath: '/assets/projects/plumbing/plumbing-03.jpg',
    category: 'plumbing',
    categoryLabelAr: 'أعمال السباكة والصرف',
    categoryLabelEn: 'Plumbing Systems',
    titleAr: 'تأسيس صرف التكييفات وشبكات الصرف الصامت',
    titleEn: 'Condensate Drainage & Low-Noise Stacks',
    descriptionAr: 'تجميع وصرف تكثيف المكيفات داخل جدران مخصصة مع شيك بلف مانع للروائح.',
    descriptionEn: 'Concealed AC drain channels equipped with non-return smell-trap valves.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 4,
    slotKey: 'plumbing-04',
    defaultFilePath: '/assets/projects/plumbing/plumbing-04.jpg',
    category: 'plumbing',
    categoryLabelAr: 'أعمال السباكة والصرف',
    categoryLabelEn: 'Plumbing Systems',
    titleAr: 'تثبيت الشاسيهات المدفونة للشيت والسيفون',
    titleEn: 'Concealed Cistern Installation',
    descriptionAr: 'تثبيت قواعد الشيت المعلق المدفونة بميزان ليزر وضبط الارتفاع الهندسي.',
    descriptionEn: 'Wall-hung toilet carrier frames anchored and laser leveled.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 5,
    slotKey: 'plumbing-05',
    defaultFilePath: '/assets/projects/plumbing/plumbing-05.jpg',
    category: 'plumbing',
    categoryLabelAr: 'أعمال السباكة والصرف',
    categoryLabelEn: 'Plumbing Systems',
    titleAr: 'تشطيب وتركيب الأدوات الصحية والخلاطات',
    titleEn: 'Sanitary Fixtures & Designer Faucets',
    descriptionAr: 'تركيب الخلاطات الدفونة والأحواض والشاور جلاس بعد اكتمال التبليط.',
    descriptionEn: 'Precision installation of concealed mixers, vanities, and shower glass.',
    imageUrl: undefined,
    isPlaceholder: true
  },

  // 2. Electrical (5 slots: electrical-01 to electrical-05)
  {
    id: 6,
    slotKey: 'electrical-01',
    defaultFilePath: '/assets/projects/electrical/electrical-01.jpg',
    category: 'electrical',
    categoryLabelAr: 'التأسيسات الكهربائية',
    categoryLabelEn: 'Electrical Installations',
    titleAr: 'تجميع وتوزيع لوحة القواطع الرئيسية',
    titleEn: 'Main Distribution Panel Wiring',
    descriptionAr: 'توزيع الأحمال الكهربائية بالتساوي مع قواطع حماية تفاضلية معتمدة.',
    descriptionEn: 'Balanced load distribution across certified RCBO residual circuit breakers.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 7,
    slotKey: 'electrical-02',
    defaultFilePath: '/assets/projects/electrical/electrical-02.jpg',
    category: 'electrical',
    categoryLabelAr: 'التأسيسات الكهربائية',
    categoryLabelEn: 'Electrical Installations',
    titleAr: 'تمديد مسارات خراطيم وأسلاك السويدي المعتمدة',
    titleEn: 'Conduit Routing & Certified Cable Pulling',
    descriptionAr: 'تأمين مسارات الكهرباء بأقطار مناسبة واستخدام كابلات معتمدة خالية من الهالوجين.',
    descriptionEn: 'Code-compliant conduit runs with certified high-spec copper cabling.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 8,
    slotKey: 'electrical-03',
    defaultFilePath: '/assets/projects/electrical/electrical-03.jpg',
    category: 'electrical',
    categoryLabelAr: 'التأسيسات الكهربائية',
    categoryLabelEn: 'Electrical Installations',
    titleAr: 'توزيع نقاط الإنارة والسبوت لايت الهندسية',
    titleEn: 'Recessed Architectural Lighting Layout',
    descriptionAr: 'تحديد إحداثيات ومراكز الإضاءة طبقاً للمخطط المعماري وتجنب الظلال.',
    descriptionEn: 'Architectural luminaire layout aligned with furniture and circulation axes.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 9,
    slotKey: 'electrical-04',
    defaultFilePath: '/assets/projects/electrical/electrical-04.jpg',
    category: 'electrical',
    categoryLabelAr: 'التأسيسات الكهربائية',
    categoryLabelEn: 'Electrical Installations',
    titleAr: 'تأسيس شبكة التيار الخفيف والإنترنت والساوند',
    titleEn: 'Low Voltage, Data & Sound Systems',
    descriptionAr: 'مسارات منفصلة لشبكات البيانات والسنترال والصوتيات لمنع التداخل الكهرومغناطيسي.',
    descriptionEn: 'Isolated conduit pathways for Cat6 data cables and multi-zone audio lines.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 10,
    slotKey: 'electrical-05',
    defaultFilePath: '/assets/projects/electrical/electrical-05.jpg',
    category: 'electrical',
    categoryLabelAr: 'التأسيسات الكهربائية',
    categoryLabelEn: 'Electrical Installations',
    titleAr: 'إنهاء وتركيب مفاتيح وشاسيهات الإضاءة الديكورية',
    titleEn: 'Switchplate Fitting & Smart Accessories',
    descriptionAr: 'تركيب الشاسيهات والوجوه الديكورية بأفقية تامة ومطابقة لمسار الديكور.',
    descriptionEn: 'Flush-mounted designer switchgear leveled flush with wall finishes.',
    imageUrl: undefined,
    isPlaceholder: true
  },

  // 3. Plastering & Surface Prep (5 slots: plastering-01 to plastering-05)
  {
    id: 11,
    slotKey: 'plastering-01',
    defaultFilePath: '/assets/projects/plastering/plastering-01.jpg',
    category: 'plastering',
    categoryLabelAr: 'المحارة ومعالجة الأسطح',
    categoryLabelEn: 'Plastering & Surface Prep',
    titleAr: 'تثبيت شبك الفواصل والزوايا المعدنية المقواة',
    titleEn: 'Corner Beads & Fiber Joint Mesh',
    descriptionAr: 'تثبيت شبك الفيبر عند فواصل الخرسانة والمباني لمنع ظهور الترييحات والشروخ.',
    descriptionEn: 'Reinforced mesh applied to blockwork-concrete joints to eliminate cracks.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 12,
    slotKey: 'plastering-02',
    defaultFilePath: '/assets/projects/plastering/plastering-02.jpg',
    category: 'plastering',
    categoryLabelAr: 'المحارة ومعالجة الأسطح',
    categoryLabelEn: 'Plastering & Surface Prep',
    titleAr: 'ضبط البؤج والأوتار بميزان القامة والليزر',
    titleEn: 'Leveling Screed Guides & Laser Plumb',
    descriptionAr: 'إنشاء نقاط استرشادية لضمان تعامد وتوازي واستواء الحوائط والأسقف بنسبة 100%.',
    descriptionEn: 'Precision benchmark pads ensuring true vertical plumb and 90-degree square corners.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 13,
    slotKey: 'plastering-03',
    defaultFilePath: '/assets/projects/plastering/plastering-03.jpg',
    category: 'plastering',
    categoryLabelAr: 'المحارة ومعالجة الأسطح',
    categoryLabelEn: 'Plastering & Surface Prep',
    titleAr: 'الطرطشة الأسمنتية المسمارية الكثيفة',
    titleEn: 'Heavy Cementitious Key Coat Spatter',
    descriptionAr: 'رش الطرطشة المعالجة بالبوليمر لتحقيق أقصى قوة تماسك مع الطوب والخرسانة.',
    descriptionEn: 'Rough polymer-admixed splatter coat for maximum mechanical bond.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 14,
    slotKey: 'plastering-04',
    defaultFilePath: '/assets/projects/plastering/plastering-04.jpg',
    category: 'plastering',
    categoryLabelAr: 'المحارة ومعالجة الأسطح',
    categoryLabelEn: 'Plastering & Surface Prep',
    titleAr: 'فرد دراع المحارة والمس الناعم للأسطح',
    titleEn: 'Straightedge Floating & Fine Finishing',
    descriptionAr: 'توزيع المونة ودرع الحوائط بقدة ألومنيوم طويلة للوصول لسطح متجانس ومستوٍ تماماً.',
    descriptionEn: 'Aluminum straightedge screeding delivering smooth, planar wall surfaces.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 15,
    slotKey: 'plastering-05',
    defaultFilePath: '/assets/projects/plastering/plastering-05.jpg',
    category: 'plastering',
    categoryLabelAr: 'المحارة ومعالجة الأسطح',
    categoryLabelEn: 'Plastering & Surface Prep',
    titleAr: 'معالجة رطوبة الجدران وتجهيز دهانات الأساس',
    titleEn: 'Damp Proofing & Substrate Priming',
    descriptionAr: 'تطبيق السيلر المائي المانع للرطوبة وتجهيز المسام لاستقبال طبقات المعجون.',
    descriptionEn: 'Deep-penetrating acrylic primer preventing moisture migration.',
    imageUrl: undefined,
    isPlaceholder: true
  },

  // 4. Ceramic, Tile & Marble (5 slots: tiling-01 to tiling-05)
  {
    id: 16,
    slotKey: 'tiling-01',
    defaultFilePath: '/assets/projects/ceramics/tiling-01.jpg',
    category: 'ceramics',
    categoryLabelAr: 'السيراميك والبورسلين والرخام',
    categoryLabelEn: 'Ceramic, Tile & Finishes',
    titleAr: 'تركيب أرضيات بورسلين ليزر بمادة لاصقة',
    titleEn: 'Laser-Cut Porcelain Tile Installation',
    descriptionAr: 'استخدام أحدث الكلبسات ونظام التسوية التلقائي لضمان عدم وجود أي رفرفة بين البلاطات.',
    descriptionEn: 'Leveling clip spacer system ensuring zero lippage across large slabs.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 17,
    slotKey: 'tiling-02',
    defaultFilePath: '/assets/projects/ceramics/tiling-02.jpg',
    category: 'ceramics',
    categoryLabelAr: 'السيراميك والبورسلين والرخام',
    categoryLabelEn: 'Ceramic, Tile & Finishes',
    titleAr: 'تجاليد سيراميك الحوائط للحمامات الفاخرة',
    titleEn: 'Luxury Full-Height Bathroom Wall Tiles',
    descriptionAr: 'قص زوايا البلاط 45 درجة (شطف ليزر) لإنتاج زوايا خارجية هندسية فائقة النقاء.',
    descriptionEn: '45-degree mitered corner joints for seamless monolithic tiled edges.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 18,
    slotKey: 'tiling-03',
    defaultFilePath: '/assets/projects/ceramics/tiling-03.jpg',
    category: 'ceramics',
    categoryLabelAr: 'السيراميك والبورسلين والرخام',
    categoryLabelEn: 'Ceramic, Tile & Finishes',
    titleAr: 'سقاية الفواصل بمواد إيبوكسية مضادة للبكتيريا',
    titleEn: 'Antibacterial Epoxy Grouting',
    descriptionAr: 'تعبئة فواصل البورسلين بالإيبوكسي غير القابل للتشرب والمقاوم للرطوبة والبقع.',
    descriptionEn: 'Non-porous stain-resistant epoxy grout between precision joints.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 19,
    slotKey: 'tiling-04',
    defaultFilePath: '/assets/projects/ceramics/tiling-04.jpg',
    category: 'ceramics',
    categoryLabelAr: 'السيراميك والبورسلين والرخام',
    categoryLabelEn: 'Ceramic, Tile & Finishes',
    titleAr: 'أرضيات سيراميك باركيه بنمط هيرنج بون',
    titleEn: 'Herringbone Pattern Wood-Look Tile',
    descriptionAr: 'رصف قطع السيراميك الخشبي بزوايا هندسية متناسقة مع خطوط الغرف.',
    descriptionEn: 'Accurate herringbone layout creating warm architectural floor texture.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 20,
    slotKey: 'tiling-05',
    defaultFilePath: '/assets/projects/ceramics/tiling-05.jpg',
    category: 'ceramics',
    categoryLabelAr: 'السيراميك والبورسلين والرخام',
    categoryLabelEn: 'Ceramic, Tile & Finishes',
    titleAr: 'تركيب وزرات رخامية وتفاصيل المداخل',
    titleEn: 'Marble Skirting & Entrance Thresholds',
    descriptionAr: 'قص وتركيب وزرات الحوائط الغاطسة لتقليل تراكم الأتربة مع عتب المداخل الرخامي.',
    descriptionEn: 'Recessed baseboard trims and solid marble transition thresholds.',
    imageUrl: undefined,
    isPlaceholder: true
  },

  // 5. Gypsum Board & Ceilings (5 slots: gypsum-01 to gypsum-05)
  {
    id: 21,
    slotKey: 'gypsum-01',
    defaultFilePath: '/assets/projects/gypsum/gypsum-01.jpg',
    category: 'gypsum',
    categoryLabelAr: 'الجبس بورد والأسقف المعلقة',
    categoryLabelEn: 'Gypsum Board & Ceilings',
    titleAr: 'شاسيهات حديد مجلفن متينة للأسقف المستوية',
    titleEn: 'Galvanized Framing for Flat Ceilings',
    descriptionAr: 'تثبيت الأوميجا والسي واليو بمقاسات هندسية تمنع أي هبوط مستقبلي في السقف.',
    descriptionEn: 'Heavy gauge steel suspension grid preventing ceiling deflection.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 22,
    slotKey: 'gypsum-02',
    defaultFilePath: '/assets/projects/gypsum/gypsum-02.jpg',
    category: 'gypsum',
    categoryLabelAr: 'الجبس بورد والأسقف المعلقة',
    categoryLabelEn: 'Gypsum Board & Ceilings',
    titleAr: 'بيوت نور مخفية وتفاصيل ليد بروفايل مدمجة',
    titleEn: 'Recessed Light Coves & LED Profiles',
    descriptionAr: 'تصميم تجاويف إضاءة غير مباشرة توزع الضوء بنعومة على الحوائط والأسقف.',
    descriptionEn: 'Continuous indirect cove lighting troughs delivering soft ambient glow.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 23,
    slotKey: 'gypsum-03',
    defaultFilePath: '/assets/projects/gypsum/gypsum-03.jpg',
    category: 'gypsum',
    categoryLabelAr: 'الجبس بورد والأسقف المعلقة',
    categoryLabelEn: 'Gypsum Board & Ceilings',
    titleAr: 'ألواح جبس بورد خضراء مقاومة للرطوبة',
    titleEn: 'Moisture-Resistant Green Board Fitment',
    descriptionAr: 'تركيب ألواح مخصصة للمطابخ والحمامات تقاوم الأبخرة والرطوبة وتمنع العفن.',
    descriptionEn: 'Water-repellent gypsum panels tailored for kitchen and bath zones.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 24,
    slotKey: 'gypsum-04',
    defaultFilePath: '/assets/projects/gypsum/gypsum-04.jpg',
    category: 'gypsum',
    categoryLabelAr: 'الجبس بورد والأسقف المعلقة',
    categoryLabelEn: 'Gypsum Board & Ceilings',
    titleAr: 'شريط الفواصل ومعجون الجبس المقاوم للتشققات',
    titleEn: 'Joint Tape & Micro-Crack Puttying',
    descriptionAr: 'معالجة فواصل الألواح بشريط ورقي مستورد ومعجون مخصص لضمان استمرارية السطح.',
    descriptionEn: 'Fiber tape bedding and elastic joint compound preventing seam cracks.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 25,
    slotKey: 'gypsum-05',
    defaultFilePath: '/assets/projects/gypsum/gypsum-05.jpg',
    category: 'gypsum',
    categoryLabelAr: 'الجبس بورد والأسقف المعلقة',
    categoryLabelEn: 'Gypsum Board & Ceilings',
    titleAr: 'فتحات صيانة غاطسة لمخارج التكييف والستائر',
    titleEn: 'Concealed Curtain Tracks & AC Access',
    descriptionAr: 'تجهيز بيوت ستائر غاطسة ومصائد صيانة غير مرئية للتكييفات المركزية.',
    descriptionEn: 'Flush magnetic inspection panels and recessed ceiling curtain pockets.',
    imageUrl: undefined,
    isPlaceholder: true
  },

  // 6. Painting & Decor (5 slots: painting-01 to painting-05)
  {
    id: 26,
    slotKey: 'painting-01',
    defaultFilePath: '/assets/projects/painting/painting-01.jpg',
    category: 'painting',
    categoryLabelAr: 'الدهانات والتشطيبات الديكورية',
    categoryLabelEn: 'Painting & Decorative Work',
    titleAr: 'سحب 4 سكاكين معجون جاهز ناعم مع الصنفرة',
    titleEn: '4-Coat Skim Putty & Dustless Sanding',
    descriptionAr: 'استخدام إضاءة كاشفة أثناء الصنفرة للتأكد من خلو الحوائط تماماً من أي تعرجات.',
    descriptionEn: 'Raking spotlight inspection ensuring glass-flat sanded wall surfaces.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 27,
    slotKey: 'painting-02',
    defaultFilePath: '/assets/projects/painting/painting-02.jpg',
    category: 'painting',
    categoryLabelAr: 'الدهانات والتشطيبات الديكورية',
    categoryLabelEn: 'Painting & Decorative Work',
    titleAr: 'دهانات مائية قابلة للغسيل ومقاومة للاحتكاك',
    titleEn: 'Washable Silk & Matt Acrylic Paints',
    descriptionAr: 'تطبيق خامات عالية الجودة مقاومة للأتربة والبهتان تدوم لسنوات طويلة.',
    descriptionEn: 'High-scrub luxury emulsion paints formulated for longevity and cleanability.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 28,
    slotKey: 'painting-03',
    defaultFilePath: '/assets/projects/painting/painting-03.jpg',
    category: 'painting',
    categoryLabelAr: 'الدهانات والتشطيبات الديكورية',
    categoryLabelEn: 'Painting & Decorative Work',
    titleAr: 'تشطيب حوائط ميكروسيمنت بتأثير أسمنتي معاصر',
    titleEn: 'Contemporary Microcement Feature Wall',
    descriptionAr: 'طبقات ميكروسيمنت ناعمة بتدرجات رمادية وترابية للمساحات الحديثة.',
    descriptionEn: 'Seamless troweled microcement layer offering minimalist architectural texture.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 29,
    slotKey: 'painting-04',
    defaultFilePath: '/assets/projects/painting/painting-04.jpg',
    category: 'painting',
    categoryLabelAr: 'الدهانات والتشطيبات الديكورية',
    categoryLabelEn: 'Painting & Decorative Work',
    titleAr: 'دهانات ستوكو رخامية إيطالية للحوائط المميزة',
    titleEn: 'Italian Polished Venetian Stucco',
    descriptionAr: 'تلميع يدوي احترافي بمالج صلب يعكس الإضاءة بملمس الرخام الطبيعي.',
    descriptionEn: 'Hand-burnished marble plaster finish with deep natural specular gloss.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 30,
    slotKey: 'painting-05',
    defaultFilePath: '/assets/projects/painting/painting-05.jpg',
    category: 'painting',
    categoryLabelAr: 'الدهانات والتشطيبات الديكورية',
    categoryLabelEn: 'Painting & Decorative Work',
    titleAr: 'تركيب ورق حائط نسيجي وبانوهات كلاسيكية',
    titleEn: 'Fabric Wallcoverings & Wall Moldings',
    descriptionAr: 'تثبيت بانوهات خشبية أو فوم مضغوط بمحاذاة هندسية دقيقة مع الدهان المتناسق.',
    descriptionEn: 'Precision architectural wall boiserie moldings and seamless luxury paper.',
    imageUrl: undefined,
    isPlaceholder: true
  },

  // 7. Interior Design & Joinery (5 slots: interior-01 to interior-05)
  {
    id: 31,
    slotKey: 'interior-01',
    defaultFilePath: '/assets/projects/interior/interior-01.jpg',
    category: 'interior',
    categoryLabelAr: 'التصميم الداخلي والفرش النهائي',
    categoryLabelEn: 'Interior Design & Detailing',
    titleAr: 'تناغم ألوان وخامات الريسبشن والصالون',
    titleEn: 'Harmonized Reception Living Palette',
    descriptionAr: 'دمج درجات الأخضر الداكن والرملي والبيج الدافئ مع الرخام والإضاءة الدافئة.',
    descriptionEn: 'Curated blend of forest greens, sand tones, warm creams, and natural stone.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 32,
    slotKey: 'interior-02',
    defaultFilePath: '/assets/projects/interior/interior-02.jpg',
    category: 'interior',
    categoryLabelAr: 'التصميم الداخلي والفرش النهائي',
    categoryLabelEn: 'Interior Design & Detailing',
    titleAr: 'تصميم وتنفيذ المطابخ المودرن المدمجة',
    titleEn: 'Integrated Modern Kitchen Joinery',
    descriptionAr: 'مطابخ بولي لاك أو إتش بي إل مع أسطح كوارتز وأجهزة مدمجة مسبقة التأسيس.',
    descriptionEn: 'Precision cabinetry with quartz countertops and flush built-in appliances.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 33,
    slotKey: 'interior-03',
    defaultFilePath: '/assets/projects/interior/interior-03.jpg',
    category: 'interior',
    categoryLabelAr: 'التصميم الداخلي والفرش النهائي',
    categoryLabelEn: 'Interior Design & Detailing',
    titleAr: 'دريسينج روم وغرف نوم ماستر مخصصة',
    titleEn: 'Custom Master Walk-In Dressing Room',
    descriptionAr: 'تقسيم وحدات التخزين بإضاءات ليد داخلية وأبواب زجاجية سموكي وإكسسوارات إيطالية.',
    descriptionEn: 'Smoked glass wardrobes with sensor-activated internal illumination.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 34,
    slotKey: 'interior-04',
    defaultFilePath: '/assets/projects/interior/interior-04.jpg',
    category: 'interior',
    categoryLabelAr: 'التصميم الداخلي والفرش النهائي',
    categoryLabelEn: 'Interior Design & Detailing',
    titleAr: 'تجاليد أخشاب طبيعية وشرائح بديل الخشب',
    titleEn: 'Natural Timber Cladding & Wood Slats',
    descriptionAr: 'فواصل بصرية دافئة تمنح الفراغات عمقاً معمارياً مع تكامل الإنارة الخلفية.',
    descriptionEn: 'Vertical fluted wood acoustic slats backlit with warm architectural LEDs.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 35,
    slotKey: 'interior-05',
    defaultFilePath: '/assets/projects/interior/interior-05.jpg',
    category: 'interior',
    categoryLabelAr: 'التصميم الداخلي والفرش النهائي',
    categoryLabelEn: 'Interior Design & Detailing',
    titleAr: 'تنسيق وحدات الإضاءة الديكورية والتحف',
    titleEn: 'Statement Luminaire & Object Styling',
    descriptionAr: 'اختيار النجف المتدلي واللمبات الخافتة لتعزيز الهدوء والفخامة في المساء.',
    descriptionEn: 'Handpicked sculptural pendants complementing room scale and seating zones.',
    imageUrl: undefined,
    isPlaceholder: true
  },

  // 8. Commercial Projects (5 slots: commercial-01 to commercial-05)
  {
    id: 36,
    slotKey: 'commercial-01',
    defaultFilePath: '/assets/projects/commercial/commercial-01.jpg',
    category: 'commercial',
    categoryLabelAr: 'المشاريع التجارية والمحلات والمكاتب',
    categoryLabelEn: 'Commercial Fit-Outs',
    titleAr: 'تشطيب صالون الحلاقة الفاخر (محمد وخالد)',
    titleEn: 'Mohamed & Khaled Luxury Barbershop',
    descriptionAr: 'مشروع تجاري منفذ بالكامل يجمع بين الطابع الرجالي الكلاسيكي والإضاءة المتخصصة والتجهيزات الهيدروليكية.',
    descriptionEn: 'Complete commercial fit-out combining bespoke joinery, task lighting, and robust commercial plumbing.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 37,
    slotKey: 'commercial-02',
    defaultFilePath: '/assets/projects/commercial/commercial-02.jpg',
    category: 'commercial',
    categoryLabelAr: 'المشاريع التجارية والمحلات والمكاتب',
    categoryLabelEn: 'Commercial Fit-Outs',
    titleAr: 'واجهات تجارية ومداخل زجاجية مقاومة',
    titleEn: 'Commercial Glazed Shopfront & Signage',
    descriptionAr: 'تركيب واجهات السيكوريت وقطاعات الألومنيوم المقواة مع الإضاءة الخارجية للعلامة.',
    descriptionEn: 'Toughened frameless structural glazing and architectural signage integration.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 38,
    slotKey: 'commercial-03',
    defaultFilePath: '/assets/projects/commercial/commercial-03.jpg',
    category: 'commercial',
    categoryLabelAr: 'المشاريع التجارية والمحلات والمكاتب',
    categoryLabelEn: 'Commercial Fit-Outs',
    titleAr: 'مكاتب إدارية وقاعات اجتماعات معزولة صوتياً',
    titleEn: 'Corporate Offices & Acoustic Meeting Rooms',
    descriptionAr: 'قواطع زجاجية مزدوجة مع عوازل صوتية لضمان الخصوصية والتركيز في بيئة العمل.',
    descriptionEn: 'Double-glazed acoustic partitions and functional ergonomic workspace routing.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 39,
    slotKey: 'commercial-04',
    defaultFilePath: '/assets/projects/commercial/commercial-04.jpg',
    category: 'commercial',
    categoryLabelAr: 'المشاريع التجارية والمحلات والمكاتب',
    categoryLabelEn: 'Commercial Fit-Outs',
    titleAr: 'أرضيات إيبوكسي وفينيل عالية التحمل للمحلات',
    titleEn: 'Heavy-Duty Commercial Epoxy & LVT Floors',
    descriptionAr: 'أرضيات مقاومة للحركة الكثيفة ومضادة للانزلاق وسهلة التنظيف للمنشآت التجارية.',
    descriptionEn: 'High-traffic commercial floor finishes engineered for retail resilience.',
    imageUrl: undefined,
    isPlaceholder: true
  },
  {
    id: 40,
    slotKey: 'commercial-05',
    defaultFilePath: '/assets/projects/commercial/commercial-05.jpg',
    category: 'commercial',
    categoryLabelAr: 'المشاريع التجارية والمحلات والمكاتب',
    categoryLabelEn: 'Commercial Fit-Outs',
    titleAr: 'شبكات إنذار حريق وتكييف مركزي تجاري',
    titleEn: 'Commercial HVAC & Fire Safety Routing',
    descriptionAr: 'تمديد دكتات التكييف وشبكات الإطفاء طبقاً لاشتراطات السلامة والترخيص للمحلات.',
    descriptionEn: 'Exposed spiral ductwork and code-compliant fire safety distribution.',
    imageUrl: undefined,
    isPlaceholder: true
  }
];

export const VIDEO_SLOTS_MANIFEST: VideoSlot[] = [
  {
    id: 1,
    slotKey: 'video-01-owner-intro',
    defaultFilePath: '/assets/videos/video-01-owner-intro.mp4',
    slotType: 'owner_intro',
    titleAr: 'تعرّف على المهندس محمد حسني — رؤية العمل وجودة التنفيذ',
    titleEn: 'Meet Eng. Mohamed Hosny — Our Execution Vision',
    subtitleAr: 'فيديو تعريفي من مؤسس العمل المهندس محمد حسني يوضح فلسفة التشطيب المعماري والمصداقية',
    subtitleEn: 'Company founder Eng. Mohamed Hosny introduction detailing our architectural finishing philosophy',
    descriptionAr: 'فيديو تعريفي مسجل مع المهندس محمد حسني يشرح منهجية استلام المواقع، ومراحل التنفيذ بدون مفاجآت، والالتزام الكامل بالمواصفات الهندسية.',
    descriptionEn: 'Introductory presentation by Eng. Mohamed Hosny outlining our transparent workflow, site management, and uncompromising quality standards.',
    posterUrl: '/assets/images/Luxury_Architectural_Gold_Monogram_Branding_9b169c0f.png',
    videoUrl: '/assets/videos/video-01-owner-intro.mp4',
    isAvailable: true,
    notesAr: 'هذا الفيديو هو نفسه المعروض أسفل الهيرو مباشرة (خانة الفيديو 1)',
    notesEn: 'This video slot is shared with the introduction section below the hero'
  },
  {
    id: 2,
    slotKey: 'video-02-client-interview',
    defaultFilePath: '/assets/videos/client-interview.mp4',
    slotType: 'client_interview',
    titleAr: 'لقاء مع صاحب صالون (محمد وخالد) — تجربة تنفيذ حقيقية',
    titleEn: 'Client Interview — Mohamed & Khaled Barbershop Project',
    subtitleAr: 'حوار مباشر مع العميل حول جودة التشطيب والتسليم في الموعد المحدد',
    subtitleEn: 'Live on-site discussion with the client reviewing the finished commercial space',
    descriptionAr: 'مقابلة حقيقية داخل صالون حلاقة محمد وخالد التجاري المنفذ بواسطة المؤسسة، توضح انطباع العميل عن الجودة والتفاصيل الدقيقة.',
    descriptionEn: 'Authentic project review inside the completed Mohamed & Khaled barbershop commercial project, highlighting craftsmanship and reliability.',
    posterUrl: '/assets/images/Luxury_Green_and_Gold_Brand_Identity_Board_6a9f8110.png',
    videoUrl: '/assets/videos/client-interview.mp4',
    isAvailable: true,
    isFeaturedInitial: true,
    notesAr: 'فيديو مقابلة العميل لمشروع صالون حلاقة محمد وخالد التجاري',
    notesEn: 'Client interview documentary video for Mohamed & Khaled commercial project'
  },
  {
    id: 3,
    slotKey: 'video-03-finishing-process',
    defaultFilePath: '/assets/videos/video-03-finishing-process.mp4',
    slotType: 'finishing_process',
    titleAr: 'مراحل التنفيذ خطوة بخطوة — من التأسيس حتى التشطيب',
    titleEn: 'Finishing Process — Ground-Level Execution Footage',
    subtitleAr: 'لقطات واقعية من داخل مواقع العمل توضح الفحص والتركيبات',
    subtitleEn: 'Real site footage demonstrating MEP rough-in, plastering, and tiling steps',
    descriptionAr: 'توثيق ميداني لمراحل العمل المختلفة، دقة ضبط المسافات بميزان الليزر، واختبارات ضغط السباكة والكهرباء قبل إغلاق الحوائط.',
    descriptionEn: 'Documentary footage showcasing laser-guided leveling, plumbing pressure tests, and meticulous site supervision.',
    posterUrl: '/assets/images/hero_architectural_finishing_details_1792893859892.jpg',
    videoUrl: '/assets/videos/video-03-finishing-process.mp4',
    isAvailable: true,
    isFeaturedInitial: true,
    notesAr: 'توثيق مراحل الشغل الميداني الحقيقي والتأسيسات',
    notesEn: 'Authentic construction process video footage'
  },
  {
    id: 4,
    slotKey: 'video-04-completed-apartment',
    defaultFilePath: '/assets/videos/video-04-completed-apartment.mp4',
    slotType: 'completed_apartment',
    titleAr: 'جولة كاملة في شقة سكنية بعد اكتمال التشطيب الفاخر',
    titleEn: 'Completed Apartment — Full Architectural Walkthrough',
    subtitleAr: 'استعراض النتيجة النهائية والتفاصيل الدقيقة عند تسليم المفتاح',
    subtitleEn: 'Detailed room-by-room walkthrough of a fully delivered residence',
    descriptionAr: 'جولة سينمائية متكاملة تستعرض توزيع الإنارة، تناسق الأرضيات مع الجدران، وتفاصيل الأبواب والأثاث المدمج بعد التسليم النهائي.',
    descriptionEn: 'Comprehensive interior walkthrough showing completed illumination, integrated joinery, and seamless finishing transitions.',
    posterUrl: '/assets/images/hero_luxury_apartment_living_1792893858819.jpg',
    videoUrl: '/assets/videos/video-04-completed-apartment.mp4',
    isAvailable: true,
    isFeaturedInitial: true,
    notesAr: 'جولة الشقة المكتملة الفعلية وتسليم المفتاح',
    notesEn: 'Completed apartment walkthrough video'
  },
  {
    id: 5,
    slotKey: 'video-05-commercial-project',
    defaultFilePath: '/assets/videos/video-05-commercial-project.mp4',
    slotType: 'commercial_project',
    titleAr: 'مشروع تجاري منفذ — استعراض المساحات والمرافق التجارية',
    titleEn: 'Commercial Project — Retail & Office Delivery Tour',
    subtitleAr: 'كيفية تحويل المساحة التجارية إلى بيئة عمل واستقبال راقية',
    subtitleEn: 'How commercial layouts are engineered for heavy use, ergonomics and style',
    descriptionAr: 'استعراض حلول التشطيب التجاري المتين للمحلات والواجهات والتمديدات المتخصصة التي تلبي متطلبات النشاط والتشغيل.',
    descriptionEn: 'Visual tour of robust commercial installations, custom shopfronts, and specialized operational infrastructure.',
    posterUrl: '/assets/images/hero_commercial_retail_space_1792893859170.jpg',
    videoUrl: '/assets/videos/video-05-commercial-project.mp4',
    isAvailable: true,
    notesAr: 'استعراض المشروع التجاري المكتمل',
    notesEn: 'Verified commercial project walkthrough'
  }
];
