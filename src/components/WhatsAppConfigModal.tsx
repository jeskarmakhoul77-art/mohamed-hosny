import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { getStoredWhatsAppNumber, setStoredWhatsAppNumber, DISPLAY_WHATSAPP_NUMBER } from '../config/businessConfig';
import { getAdminAuthToken, loginAdmin, checkAdminAuth } from '../services/mediaStorage';
import { X, MessageCircle, Phone, CheckCircle2, ShieldAlert, Lock, KeyRound, RefreshCw, AlertCircle } from 'lucide-react';

interface WhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onNumberSaved?: (newNum: string) => void;
}

export const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onNumberSaved
}) => {
  const t = translations[currentLang];
  const [isAdmin, setIsAdmin] = useState<boolean>(() => !!getAdminAuthToken());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [phoneInput, setPhoneInput] = useState(() => getStoredWhatsAppNumber() || DISPLAY_WHATSAPP_NUMBER);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      checkAdminAuth().then((authed) => setIsAdmin(authed));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setIsVerifyingPin(true);
    setPinError('');
    const res = await loginAdmin(pinInput.trim());
    setIsVerifyingPin(false);
    if (res.success) {
      setIsAdmin(true);
      setPinInput('');
    } else {
      setPinError(res.message || (currentLang === 'ar' ? 'رمز الدخول الإداري غير صحيح' : 'Invalid admin PIN'));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneInput.replace(/[^0-9]/g, '');
    if (!clean) {
      setError(currentLang === 'ar' ? 'يرجى إدخال رقم واتساب صحيح' : 'Please enter a valid phone number');
      return;
    }

    setStoredWhatsAppNumber(clean);
    setSuccess(true);
    setError('');
    if (onNumberSaved) {
      onNumberSaved(clean);
    }
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-[#FAF8F5] text-[#242424] border border-[#D1B995]/50 rounded-sm shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D1B995]/30">
          <div className="flex items-center gap-2 text-[#1F4A3B]">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm sm:text-base">
              {t.whatsappNotSetTitle}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 text-xs text-[#5C5C5C] leading-relaxed">
          {!isAdmin ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-sm flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  {currentLang === 'ar'
                    ? 'تعديل رقم التواصل الرسمي محمي ويتطلب صلاحيات إدارية. يرجى إدخال الرمز الإداري:'
                    : 'Modifying the official business contact number requires administrative privileges. Enter admin PIN:'}
                </span>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-3">
                <div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    autoFocus
                    autoComplete="current-password"
                    className="w-full text-xs sm:text-sm p-2.5 text-center bg-white border border-[#D1B995]/50 rounded-sm focus:border-[#1F4A3B] focus:outline-none font-mono tracking-widest"
                  />
                  {pinError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xs flex items-center gap-1.5 justify-center">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingPin || !pinInput.trim()}
                  className="w-full py-2.5 bg-[#1F4A3B] hover:bg-[#152B24] disabled:opacity-50 text-[#D1B995] text-xs font-bold uppercase rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifyingPin ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{currentLang === 'ar' ? 'جارٍ التحقق...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{currentLang === 'ar' ? 'تأكيد الدخول الإداري' : 'Verify Admin PIN'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <>
              <p>{t.whatsappNotSetDesc}</p>

              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-sm flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  {currentLang === 'ar'
                    ? 'وفقاً لتعليمات الخصوصية والشفافية، يتم تخزين الرقم في إعدادات الموقع المركزية وربط كافة أزرار الحجز به تلقائياً.'
                    : 'In accordance with privacy and transparency guidelines, the number is configured centrally and immediately powers all booking buttons.'}
                </span>
              </div>

              <form onSubmit={handleSave} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#1F4A3B] mb-1">
                    {t.setWhatsAppNumberLabel}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#B89B6A] absolute top-3 left-3 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="01228744400"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2.5 pl-9 bg-white border border-[#D1B995]/40 rounded-sm focus:border-[#1F4A3B] focus:outline-none font-mono"
                    />
                  </div>
                  {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
                </div>

                {success ? (
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentLang === 'ar' ? 'تم حفظ رقم الواتساب بنجاح!' : 'WhatsApp number saved successfully!'}</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-xs font-bold uppercase rounded-sm transition-colors cursor-pointer"
                  >
                    {t.saveWhatsAppBtn}
                  </button>
                )}
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
