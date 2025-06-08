
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../utils/translations';
import LanguageSwitcher from '../components/LanguageSwitcher';
import WhatsAppButton from '../components/WhatsAppButton';

const Index = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);

  // تغيير الشعارات تلقائياً
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSloganIndex((prev) => (prev + 1) % t.slogans.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [t.slogans.length]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <img 
            src="/images/logo.png" 
            alt="Istanova Logo" 
            className="h-16 w-auto"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzMzNzNkYyIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SVNUQU5PVkE8L3RleHQ+Cjwvc3ZnPg==";
            }}
          />
          <div className="text-white">
            <h1 className="text-xl font-bold">ISTANOVA</h1>
            <p className="text-sm opacity-80">{t.heroSubtitle}</p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/images/hero_background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {t.heroTitle}
          </h1>
          
          {/* الشعارات المتحركة */}
          <div className="h-20 flex items-center justify-center mb-8">
            <p className="text-2xl md:text-3xl font-light animate-fade-in" key={currentSloganIndex}>
              {t.slogans[currentSloganIndex]}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {t.bookNow}
            </Link>
            <a
              href={`https://wa.me/905457307235?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن مخيم إسطنبول الصيفي الترفيهي')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {t.whatsappContact}
            </a>
          </div>
        </div>
      </div>

      {/* Trip Information */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            {t.tripInfoTitle}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{t.date}</h3>
              <p className="text-gray-600">{t.duration}</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{t.price}</h3>
              <p className="text-gray-600">{t.includes}</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-lg md:col-span-2 lg:col-span-1">
              <div className="text-4xl mb-4">🏖️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{t.location}</h3>
              <p className="text-gray-600">شيلا - إسطنبول</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">
            {t.activitiesTitle}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(t.activities).map(([key, activity], index) => (
              <div key={key} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-4">
                  {key === 'rafting' && '🚣'}
                  {key === 'zipline' && '🪁'}
                  {key === 'safari' && '🏍️'}
                  {key === 'volleyball' && '🏐'}
                  {key === 'football' && '⚽'}
                  {key === 'fireworks' && '🎆'}
                  {key === 'barbecue' && '🍖'}
                  {key === 'photography' && '📸'}
                  {key === 'drone' && '🛸'}
                </div>
                <h3 className="text-lg font-semibold mb-2">{activity}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            {t.includedTitle}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {t.includedServices.map((service, index) => (
              <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
                <div className="text-green-500 text-xl">✓</div>
                <p className="text-gray-700">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Bring */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            {t.bringTitle}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.bringItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
                <div className="text-orange-500 text-xl">📦</div>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 p-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl text-white">
            <h3 className="text-2xl font-bold mb-4">لا تنسى أن تحضر ضحكاتك وتترك همومك خلفك!</h3>
            <p className="text-lg">🎊 جلسات تصوير احترافية وتصوير بالدرون للذكريات 📷</p>
            <p className="text-lg mt-2">⚡ متوفر كهرباء وإنترنت في المخيم 📶</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">{t.contactTitle}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">📍 عنواننا</h3>
              <p className="text-gray-300">{t.address}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">📞 اتصل بنا</h3>
              <p className="text-gray-300">{t.phone}</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link
              to="/booking"
              className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white px-12 py-4 rounded-full text-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              احجز مغامرتك الآن! 🚀
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default Index;
