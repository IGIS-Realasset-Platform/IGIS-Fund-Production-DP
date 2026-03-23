import React from 'react';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import { useAnimations } from './hooks/useAnimations';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const [currentPage, setCurrentPage] = React.useState('home');

  useAnimations(currentPage);

  React.useEffect(() => {
    window.isNewsPage = false;
    window.isLeasePage = false;
  }, [currentPage]);

  const { lang } = useLanguage();

  React.useEffect(() => {
    const applyLanguage = () => {
      const krTargetTexts = document.querySelectorAll(".kr-target-text");
      const enOnlyTexts = document.querySelectorAll(".en-only-text");
      const dualTexts = document.querySelectorAll("[data-en][data-kr]");

      dualTexts.forEach(el => {
        el.innerHTML = el.getAttribute(`data-${lang}`);
      });

      if (lang === 'kr') {
        krTargetTexts.forEach(el => {
          el.classList.add('font-normal');
          el.classList.remove('font-light');
        });
        enOnlyTexts.forEach(el => {
          el.style.display = 'none';
        });
      } else {
        krTargetTexts.forEach(el => {
          el.classList.add('font-light');
          el.classList.remove('font-normal');
        });
        enOnlyTexts.forEach(el => {
          el.style.display = 'block';
        });
      }
    };
    setTimeout(applyLanguage, 50);
  }, [currentPage, lang]);

  return (
    <div className="scroll-container font-sans" id="scroll-container">
      <Header
        onNavigateToHome={() => setCurrentPage('home')}
        currentPage={currentPage}
      />

      {currentPage === 'home' && <MainLayout />}
    </div>
  );
}
