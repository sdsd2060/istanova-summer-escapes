
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../utils/translations';

interface PriceInfo {
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  finalPriceInCurrency: number;
}

interface PriceSummaryProps {
  priceInfo: PriceInfo;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ priceInfo }) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-blue-50 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">ملخص الحجز</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>{t.totalAmount}:</span>
          <span>{priceInfo.totalPrice} USD</span>
        </div>
        {priceInfo.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>{t.discount}:</span>
            <span>-{priceInfo.discountAmount.toFixed(2)} USD</span>
          </div>
        )}
        <div className="border-t pt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>{t.finalAmount}:</span>
            <span>{priceInfo.finalPriceInCurrency.toFixed(2)} {priceInfo.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
