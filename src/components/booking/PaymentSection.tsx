
import React, { useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../utils/translations';

interface PaymentSectionProps {
  paymentMethod: string;
  availablePaymentMethods: string[];
  onPaymentMethodChange: (method: string) => void;
  errors: any;
}

// Extend Window interface for PayPal
declare global {
  interface Window {
    paypal?: any;
  }
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentMethod,
  availablePaymentMethods,
  onPaymentMethodChange,
  errors
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  // Initialize PayPal when payment method changes
  useEffect(() => {
    if (paymentMethod === 'paypal' && window.paypal) {
      const container = document.getElementById('paypal-container-W3G4VFWKPBTUY');
      if (container) {
        container.innerHTML = '';
        
        window.paypal.HostedButtons({
          hostedButtonId: "W3G4VFWKPBTUY",
        }).render("#paypal-container-W3G4VFWKPBTUY");
      }
    }
  }, [paymentMethod]);

  const getPaymentInfo = () => {
    switch (paymentMethod) {
      case 'bankTransfer':
        return (
          <div>
            <p><strong>رقم الحساب:</strong> TR520020300008722885000001</p>
            <p><strong>اسم صاحب الحساب:</strong> JEHAD O. A. ABUSABRA</p>
            <p><strong>السويفت كود:</strong> ISBKTRIS</p>
          </div>
        );
      case 'vodafoneCash':
        return (
          <div>
            <p><strong>رقم فودافون كاش:</strong> 0104723155</p>
          </div>
        );
      case 'cashOffice':
        return (
          <div>
            <p><strong>العنوان:</strong> إسطنبول - الفاتح - مقابل ترام واي يوسف باشا رقم 42 مكتب 8</p>
          </div>
        );
      case 'paypal':
        return (
          <div className="mt-4">
            <div id="paypal-container-W3G4VFWKPBTUY"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          {t.paymentTitle}
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          {availablePaymentMethods.map(method => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentMethodChange(method)}
              className={`p-4 rounded-lg border-2 text-lg font-medium transition-all ${
                paymentMethod === method 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:border-blue-300'
              }`}
            >
              {t.paymentMethods[method]}
            </button>
          ))}
        </div>
        {errors.payment && (
          <p className="text-red-500 text-sm mt-2">{errors.payment}</p>
        )}
      </div>

      {paymentMethod && (
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-3">معلومات الدفع:</h4>
          {getPaymentInfo()}
        </div>
      )}
    </>
  );
};

export default PaymentSection;
