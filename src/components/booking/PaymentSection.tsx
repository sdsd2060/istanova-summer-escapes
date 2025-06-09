
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

  // Set PayPal as default payment method
  useEffect(() => {
    if (!paymentMethod && availablePaymentMethods.includes('paypal')) {
      onPaymentMethodChange('paypal');
    }
  }, [paymentMethod, availablePaymentMethods, onPaymentMethodChange]);

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
      case 'paypal':
        return (
          <div className="mt-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💳</span>
                <h4 className="font-bold text-blue-800">الطريقة المفضلة للدفع</h4>
              </div>
              <p className="text-blue-700">آمن وسريع - ادفع بالبطاقة الائتمانية أو حساب PayPal</p>
            </div>
            <div id="paypal-container-W3G4VFWKPBTUY"></div>
          </div>
        );
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
      default:
        return null;
    }
  };

  // Reorder payment methods to put PayPal first
  const orderedPaymentMethods = availablePaymentMethods.sort((a, b) => {
    if (a === 'paypal') return -1;
    if (b === 'paypal') return 1;
    return 0;
  });

  return (
    <>
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          {t.paymentTitle}
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          {orderedPaymentMethods.map(method => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentMethodChange(method)}
              className={`p-4 rounded-lg border-2 text-lg font-medium transition-all relative ${
                paymentMethod === method 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:border-blue-300'
              } ${method === 'paypal' ? 'ring-2 ring-orange-200' : ''}`}
            >
              {method === 'paypal' && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  مُوصى به
                </span>
              )}
              <div className="flex items-center justify-center space-x-2">
                {method === 'paypal' && <span className="text-2xl">💳</span>}
                <span>{t.paymentMethods[method]}</span>
              </div>
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
