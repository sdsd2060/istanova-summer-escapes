
import { useState, useEffect } from 'react';

type Language = 'ar' | 'en' | 'tr';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // تحديد اللغة تلقائياً حسب إعدادات الجهاز/الموقع
    const browserLang = navigator.language.toLowerCase();
    
    if (browserLang.includes('ar')) {
      setLanguage('ar');
    } else if (browserLang.includes('tr')) {
      setLanguage('tr');
    } else {
      setLanguage('en');
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return { language, changeLanguage };
};
