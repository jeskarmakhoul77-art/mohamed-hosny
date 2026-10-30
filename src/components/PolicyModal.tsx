import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { FEE_POLICY } from '../config/businessConfig';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  policyType: 'site_visit' | 'refund' | 'privacy';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  policyType
}) => {
  const t = translations[currentLang];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-[#FAF8F5] text-[#242424] border border-[#D1B995]/40 rounded-sm shadow-2xl my-auto overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1F4A3B] text-[#F7F5F0] px-6 py-4 flex items-center justify-between border-b border-[#D1B995]/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D1B995]" />
            <h3 className="text-base font-bold">
              {policyType === 'site_visit'
                ? t.policySiteVisit
                : policyType === 'refund'
                ? t.policyRefund
                : t.policyPrivacy}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#F7F5F0]/70 hover:text-white rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-[#5C5C5C] leading-relaxed max-h-[75vh] overflow-y-auto">
          {policyType === 'site_visit' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1F4A3B] text-[#F7F5F0] rounded-sm border border-[#D1B995]/30">
                <span className="text-[#D1B995] font-bold text-sm block mb-1">
                  {currentLang === 'ar' ? 'ضوابط المعاينة الهندسية الميدانية' : 'Site Visit Inspection Policy'}
                </span>
                <p className="text-xs text-[#F7F5F0]/90">
                  {currentLang === 'ar' ? FEE_POLICY.summaryAr : FEE_POLICY.summaryEn}
                </p>
              </div>

              <h4 className="font-bold text-[#1F4A3B] text-sm pt-2">
                {currentLang === 'ar' ? 'بنود وضوابط المعاينة الميدانية:' : 'Site Visit Terms & Provisions:'}
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                {(currentLang === 'ar' ? FEE_POLICY.detailsAr : FEE_POLICY.detailsEn).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {policyType === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#1F4A3B] text-sm">
                {currentLang === 'ar' ? 'سياسة المواعيد والإلغاء:' : 'Appointment Scheduling & Cancellation Terms:'}
              </h4>
              <p>
                {currentLang === 'ar'
                  ? 'يمكن للعميل طلب تعديل أو إلغاء موعد المعاينة بالتنسيق المسبق قبل موعد الزيارة المحدد بوقت كافٍ.'
                  : 'Clients may request rescheduling or cancellation with advance notice prior to the scheduled site visit.'}
              </p>
              <p>
                {currentLang === 'ar'
                  ? 'نحرص على الالتزام التام بالمواعيد المحددة لضمان أعلى مستوى من الجودة والمهنية الهندسية.'
                  : 'We adhere strictly to confirmed appointment schedules ensuring utmost professional engineering standards.'}
              </p>
              <p>
                {currentLang === 'ar'
                  ? 'عند التعاقد على تنفيذ الأعمال، يتم اعتماد كافة الترتيبات الفنية المتفق عليها واعتماد جدول التنفيذ المعتمد.'
                  : 'Upon final execution contract signing, all agreed technical arrangements and project milestones are officially scheduled.'}
              </p>
            </div>
          )}

          {policyType === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#1F4A3B] text-sm">
                {currentLang === 'ar' ? 'حماية البيانات وسرية المستندات:' : 'Data Protection & Privacy Policy:'}
              </h4>
              <p>
                {currentLang === 'ar'
                  ? 'نلتزم في مؤسسة المهندس محمد حسني بحماية خصوصية جميع عملائنا. بيانات الاتصال، عناوين العقارات، وإيصالات التحويل البنكية تُعامل بسرية تامة ولا تُشارك مع أي طرف خارجي.'
                  : 'At Eng. Mohamed Hosny Construction, we uphold strict confidentiality regarding all client data, site locations, floor plans, and financial payment slips.'}
              </p>
              <p>
                {currentLang === 'ar'
                  ? 'إيصالات السداد المرفوعة عبر الموقع تُحفظ في بيئة آمنة وتُستخدم حصرياً لأغراض المطابقة والتحقق المالي من قبل إدارة الحسابات.'
                  : 'Payment receipts uploaded to the system are retained securely solely for payment reconciliation by verified management personnel.'}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-[#D1B995]/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] rounded-sm"
            >
              {t.closeModal}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
