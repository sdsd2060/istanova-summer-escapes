
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../utils/translations';

interface TermsModalProps {
  showTerms: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ showTerms, onClose, onAgree }) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!showTerms) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">{t.termsTitle}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="prose prose-sm text-gray-700">
            <pre className="whitespace-pre-wrap font-sans">{t.termsContent}</pre>
          </div>
          <div className="mt-6 flex gap-4">
            <button
              onClick={onAgree}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600"
            >
              أوافق على الشروط
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
