
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../utils/translations';
import { COUNTRIES, PAYMENT_METHODS_BY_COUNTRY, CURRENCY_BY_COUNTRY, EXCHANGE_RATES, BASE_PRICE } from '../utils/constants';
import LanguageSwitcher from '../components/LanguageSwitcher';
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
  
  // حساب السعر والخصم
  const calculatePrice = () => {
    let totalPrice = BASE_PRICE * participantsCount;
    let discount = 0;
    
    if (participantsCount === 2) {
      if (relationship === 'couple') {
        discount = 0.10; // خصم 10% للأزواج
      } else if (relationship === 'friends') {
        discount = 0.05; // خصم 5% للأصدقاء
      }
    } else if (participantsCount >= 3) {
      discount = 0.10; // خصم 10% للمجموعات
    }
    
    const discountAmount = totalPrice * discount;
    const finalPrice = totalPrice - discountAmount;
    
    // تحويل العملة
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

  // تحديث عدد المشاركين
  useEffect(() => {
    const newParticipants = Array.from({ length: participantsCount }, (_, index) => 
      participants[index] || { name: '', birthDate: '', gender: 'male', nationality: '' }
    );
    setParticipants(newParticipants);
  }, [participantsCount]);

  // تحديد طرق الدفع حسب الدولة
  const availablePaymentMethods = PAYMENT_METHODS_BY_COUNTRY[phoneCountry] || PAYMENT_METHODS_BY_COUNTRY.default;

  // التحقق من العمر
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

  // إرسال البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    
    // التحقق من البيانات
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
      // إرسال البيانات إلى formspree
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
          // إعادة تعيين النموذج
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
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <Link to="/" className="flex items-center space-x-4">
          <img 
            src="/images/logo.png" 
            alt="Istanova Logo" 
            className="h-12 w-auto"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzMzNzNkYyIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SVNUQU5PVkE8L3RleHQ+Cjwvc3ZnPg==";
            }}
          />
          <div className="text-white">
            <h1 className="text-lg font-bold">ISTANOVA</h1>
          </div>
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">{t.bookingTitle}</h1>
            <p className="text-lg opacity-90">مخيم إسطنبول الصيفي الترفيهي - 15 يوليو 2025</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* عدد المشاركين */}
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

            {/* العلاقة (للشخصين فقط) */}
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

            {/* بيانات المشاركين */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.personalInfo}</h2>
              
              {participants.map((participant, index) => (
                <div key={index} className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {participantsCount === 1 ? t.participant :
                     participantsCount === 2 && relationship === 'couple' ? 
                       (index === 0 ? t.husband : t.wife) :
                     `${t.participant} ${index + 1}`}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.name}
                      </label>
                      <input
                        type="text"
                        value={participant.name}
                        onChange={(e) => {
                          const newParticipants = [...participants];
                          newParticipants[index].name = e.target.value;
                          setParticipants(newParticipants);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {errors[`participant_${index}_name`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.birthDate}
                      </label>
                      <input
                        type="date"
                        value={participant.birthDate}
                        onChange={(e) => {
                          const newParticipants = [...participants];
                          newParticipants[index].birthDate = e.target.value;
                          setParticipants(newParticipants);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {errors[`participant_${index}_birthDate`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_birthDate`]}</p>
                      )}
                      {errors[`participant_${index}_age`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_age`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.gender}
                      </label>
                      <select
                        value={participant.gender}
                        onChange={(e) => {
                          const newParticipants = [...participants];
                          newParticipants[index].gender = e.target.value as 'male' | 'female';
                          setParticipants(newParticipants);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={participantsCount === 2 && relationship === 'couple'}
                      >
                        <option value="male">{t.male}</option>
                        <option value="female">{t.female}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.nationality}
                      </label>
                      <select
                        value={participant.nationality}
                        onChange={(e) => {
                          const newParticipants = [...participants];
                          newParticipants[index].nationality = e.target.value;
                          setParticipants(newParticipants);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">{t.nationality}</option>
                        {COUNTRIES.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name[language]}
                          </option>
                        ))}
                      </select>
                      {errors[`participant_${index}_nationality`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_nationality`]}</p>
                      )}
                    </div>
                  </div>
                  
                  {index < participants.length - 1 && (
                    <div className="mt-6 border-b border-gray-200"></div>
                  )}
                </div>
              ))}
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                {t.phone}
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

            {/* معلومات السعر */}
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

            {/* طرق الدفع */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                {t.paymentTitle}
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {availablePaymentMethods.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
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

            {/* معلومات الدفع */}
            {paymentMethod && (
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">معلومات الدفع:</h4>
                {paymentMethod === 'bankTransfer' && (
                  <div>
                    <p><strong>رقم الحساب:</strong> TR520020300008722885000001</p>
                    <p><strong>اسم صاحب الحساب:</strong> JEHAD O. A. ABUSABRA</p>
                    <p><strong>السويفت كود:</strong> ISBKTRIS</p>
                  </div>
                )}
                {paymentMethod === 'vodafoneCash' && (
                  <div>
                    <p><strong>رقم فودافون كاش:</strong> 0104723155</p>
                  </div>
                )}
                {paymentMethod === 'cashOffice' && (
                  <div>
                    <p><strong>العنوان:</strong> إسطنبول - الفاتح - مقابل ترام واي يوسف باشا رقم 42 مكتب 8</p>
                  </div>
                )}
                {paymentMethod === 'paypal' && (
                  <div className="mt-4">
                    <div id="paypal-container-W3G4VFWKPBTUY"></div>
                    <script
                      src="https://www.paypal.com/sdk/js?client-id=BAAR53-Q3Fo3xAE9DRfKqIWPI7ErlaSOHo4sjvAERL0oFoF435VaOUEdf4PYXd3O1vGSLmxjK05v7FJViw&components=hosted-buttons&disable-funding=venmo&currency=USD"
                      onLoad={() => {
                        if (window.paypal) {
                          window.paypal.HostedButtons({
                            hostedButtonId: "W3G4VFWKPBTUY",
                          }).render("#paypal-container-W3G4VFWKPBTUY");
                        }
                      }}
                    ></script>
                  </div>
                )}
              </div>
            )}

            {/* الشروط والأحكام */}
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

            {/* زر الإرسال */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 px-8 rounded-lg text-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {t.bookingSubmit} 🚀
            </button>
          </form>
        </div>
      </div>

      {/* نافذة منبثقة للشروط والأحكام */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{t.termsTitle}</h3>
                <button
                  onClick={() => setShowTerms(false)}
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
                  onClick={() => {
                    setAgreeTerms(true);
                    setShowTerms(false);
                  }}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600"
                >
                  أوافق على الشروط
                </button>
                <button
                  onClick={() => setShowTerms(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
};

export default Booking;
