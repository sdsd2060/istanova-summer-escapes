
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../utils/translations';
import { COUNTRIES, PAYMENT_METHODS_BY_COUNTRY, CURRENCY_BY_COUNTRY, EXCHANGE_RATES, BASE_PRICE } from '../utils/constants';
import BookingHeader from '../components/booking/BookingHeader';
import ParticipantForm from '../components/booking/ParticipantForm';
import PriceSummary from '../components/booking/PriceSummary';
import PaymentSection from '../components/booking/PaymentSection';
import TermsModal from '../components/booking/TermsModal';
import WhatsAppButton from '../components/WhatsAppButton';

interface Participant {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  nationality: string;
}

const Booking = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [participantsCount, setParticipantsCount] = useState(1);
  const [relationship, setRelationship] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', birthDate: '', gender: 'male', nationality: '' }
  ]);
  const [phoneCountry, setPhoneCountry] = useState('TR');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Calculate price and discount
  const calculatePrice = () => {
    let totalPrice = BASE_PRICE * participantsCount;
    let discount = 0;
    
    if (participantsCount === 2) {
      if (relationship === 'couple') {
        discount = 0.10; // 10% discount for couples
      } else if (relationship === 'friends') {
        discount = 0.05; // 5% discount for friends
      }
    } else if (participantsCount >= 3) {
      discount = 0.10; // 10% discount for groups
    }
    
    const discountAmount = totalPrice * discount;
    const finalPrice = totalPrice - discountAmount;
    
    // Currency conversion
    const currency = CURRENCY_BY_COUNTRY[phoneCountry] || 'USD';
    const exchangeRate = EXCHANGE_RATES[currency] || 1;
    
    return {
      totalPrice,
      discountAmount,
      finalPrice,
      currency,
      finalPriceInCurrency: finalPrice * exchangeRate
    };
  };

  // Update participants count
  useEffect(() => {
    const newParticipants = Array.from({ length: participantsCount }, (_, index) => {
      const existing = participants[index];
      if (existing) {
        return existing;
      }
      
      // For couples, set gender automatically
      if (participantsCount === 2 && relationship === 'couple') {
        return { 
          name: '', 
          birthDate: '', 
          gender: (index === 0 ? 'male' : 'female') as 'male' | 'female', 
          nationality: '' 
        };
      }
      
      return { name: '', birthDate: '', gender: 'male' as 'male' | 'female', nationality: '' };
    });
    setParticipants(newParticipants);
  }, [participantsCount, relationship]);

  // Determine payment methods by country
  const availablePaymentMethods = PAYMENT_METHODS_BY_COUNTRY[phoneCountry] || PAYMENT_METHODS_BY_COUNTRY.default;

  // Age validation
  const validateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    
    return age;
  };

  // Update participant data
  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    
    // Validation
    if (!agreeTerms) {
      newErrors.terms = t.mustReadTerms;
    }
    
    participants.forEach((participant, index) => {
      if (!participant.name.trim()) {
        newErrors[`participant_${index}_name`] = t.requiredField;
      }
      
      if (!participant.birthDate) {
        newErrors[`participant_${index}_birthDate`] = t.requiredField;
      } else {
        const age = validateAge(participant.birthDate);
        if (age < 18 || age > 45) {
          newErrors[`participant_${index}_age`] = t.ageError;
        }
      }
      
      if (!participant.nationality) {
        newErrors[`participant_${index}_nationality`] = t.requiredField;
      }
    });
    
    if (!phoneNumber.trim()) {
      newErrors.phone = t.requiredField;
    }
    
    if (!paymentMethod) {
      newErrors.payment = t.requiredField;
    }
    
    if (participantsCount === 2 && !relationship) {
      newErrors.relationship = t.requiredField;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Send data to formspree
      const formData = new FormData();
      formData.append('participantsCount', participantsCount.toString());
      formData.append('relationship', relationship);
      formData.append('phoneCountry', phoneCountry);
      formData.append('phoneNumber', phoneNumber);
      formData.append('paymentMethod', paymentMethod);
      
      const priceInfo = calculatePrice();
      formData.append('totalPrice', priceInfo.totalPrice.toString());
      formData.append('finalPrice', priceInfo.finalPriceInCurrency.toString());
      formData.append('currency', priceInfo.currency);
      
      participants.forEach((participant, index) => {
        formData.append(`participant_${index + 1}_name`, participant.name);
        formData.append(`participant_${index + 1}_birthDate`, participant.birthDate);
        formData.append(`participant_${index + 1}_gender`, participant.gender);
        formData.append(`participant_${index + 1}_nationality`, participant.nationality);
      });
      
      try {
        const response = await fetch('https://formspree.io/f/mnnvjeaq', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          alert(t.bookingSuccess);
          // Reset form
          setParticipantsCount(1);
          setParticipants([{ name: '', birthDate: '', gender: 'male', nationality: '' }]);
          setPhoneNumber('');
          setPaymentMethod('');
          setAgreeTerms(false);
          setRelationship('');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  const priceInfo = calculatePrice();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <BookingHeader />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">{t.bookingTitle}</h1>
            <p className="text-lg opacity-90">مخيم إسطنبول الصيفي الترفيهي - 15 يوليو 2025</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Participants count */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                {t.participantsCount}
              </label>
              <select
                value={participantsCount}
                onChange={(e) => setParticipantsCount(parseInt(e.target.value))}
                className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Relationship (for 2 people only) */}
            {participantsCount === 2 && (
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  {t.relationship}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRelationship('couple')}
                    className={`p-4 rounded-lg border-2 text-lg font-medium transition-all ${
                      relationship === 'couple' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {t.couple} 💑
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelationship('friends')}
                    className={`p-4 rounded-lg border-2 text-lg font-medium transition-all ${
                      relationship === 'friends' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {t.friends} 👫
                  </button>
                </div>
                {errors.relationship && (
                  <p className="text-red-500 text-sm mt-2">{errors.relationship}</p>
                )}
              </div>
            )}

            {/* Participants data */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.personalInfo}</h2>
              
              {participants.map((participant, index) => (
                <div key={index}>
                  <ParticipantForm
                    participant={participant}
                    index={index}
                    participantsCount={participantsCount}
                    relationship={relationship}
                    onUpdate={updateParticipant}
                    errors={errors}
                  />
                  {index < participants.length - 1 && (
                    <div className="border-b border-gray-200 mb-6"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Phone number */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                {t.phoneNumber}
              </label>
              <div className="flex gap-2">
                <select
                  value={phoneCountry}
                  onChange={(e) => setPhoneCountry(e.target.value)}
                  className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.phoneCode}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="رقم الهاتف"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Price summary */}
            <PriceSummary priceInfo={priceInfo} />

            {/* Payment methods */}
            <PaymentSection
              paymentMethod={paymentMethod}
              availablePaymentMethods={availablePaymentMethods}
              onPaymentMethodChange={setPaymentMethod}
              errors={errors}
            />

            {/* Terms and conditions */}
            <div>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <label className="text-gray-700">
                    {t.agreeTerms}{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      (اقرأ الشروط والأحكام)
                    </button>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">{t.mustReadTerms}</p>
                </div>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-2">{errors.terms}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 px-8 rounded-lg text-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {t.bookingSubmit} 🚀
            </button>
          </form>
        </div>
      </div>

      {/* Terms modal */}
      <TermsModal
        showTerms={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={() => {
          setAgreeTerms(true);
          setShowTerms(false);
        }}
      />

      <WhatsAppButton />
    </div>
  );
};

export default Booking;
