import React from 'react';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import { useAnimations } from './hooks/useAnimations';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import Notes from './components/Notes';
import SystemFullChat from './components/system/SystemFullChat';
import SystemCore from './components/system/SystemCore';
import SystemPlan from './components/system/SystemPlan';
import SystemLogin from './components/system/SystemLogin';
import AuthSetup from './components/system/AuthSetup';
import PlatformCore from './components/system/PlatformCore';
import WorkspaceArchive from './components/system/workspace/WorkspaceArchive';
import SystemAdmin from './components/system/admin/SystemAdmin';
import MobileIotaApp from './components/mobile/MobileIotaApp';

export default function App() {
  // BASE_URL: '/' in dev, '/IGIS-Fund-Production-DP/' in GitHub Pages production
  const BASE = import.meta.env.BASE_URL;
  const getPage = () => {
      const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
      let path = window.location.pathname.replace(base, '').replace(/^\//, '');
      if (path.endsWith('/')) path = path.slice(0, -1);
      // 'home' 대신 'platform/iotaseoul/workflow'를 기본 경로로 설정하여 커스텀 도메인 접속 시 바로 플랫폼으로 이동
      return path || 'platform/iotaseoul/workflow';
  };
  const toUrl = (page) => page === 'home' ? BASE : `${BASE}${page}`;

  const [currentPage, setCurrentPage] = React.useState(() => getPage());

  // Handle URL syncing and global left/right key navigation sequences
  React.useEffect(() => {
      const handlePopState = () => {
          setCurrentPage(getPage());
      };

      const handleGlobalKeyDown = (e) => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

          const flow = ['home', 'system-plan', 'system-bridge', 'system-chat', 'system-detail', 'action-plan', 'system-core'];
          const currentIndex = flow.indexOf(currentPage);
          
          if (e.key === 'ArrowLeft' && currentIndex > 0) {
              // system-plan(로그인 화면)에서는 왼쪽 버튼으로 메인 홈으로 튕기지 않도록 방어
              if (currentPage === 'system-plan') return;
              const prev = flow[currentIndex - 1];
              window.history.pushState(null, '', toUrl(prev));
              setCurrentPage(prev);
          }
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
          window.removeEventListener('popstate', handlePopState);
          window.removeEventListener('keydown', handleGlobalKeyDown);
      };
  }, [currentPage]);

  const navigateTo = (page) => {
      window.history.pushState(null, '', toUrl(page));
      setCurrentPage(page);
  };

  useAnimations(currentPage);

  React.useEffect(() => {
    window.isNewsPage = false;
    window.isLeasePage = false;
  }, [currentPage]);

  const { lang } = useLanguage();
  const { user, loading, recoveryMode } = useAuth();

  // Protect platform routes & Auto-redirect mobile devices
  React.useEffect(() => {
      if (recoveryMode && currentPage !== 'auth-setup') {
          navigateTo('auth-setup');
          return;
      }

      if (!loading && !user && (currentPage.startsWith('platform/iotaseoul') || currentPage.startsWith('mobile')) && !recoveryMode) {
          navigateTo('auth-setup');
          return;
      }

      // Mobile auto-redirection logic
      if (!loading && user && !recoveryMode) {
          const userAgent = navigator.userAgent || navigator.vendor || window.opera;
          const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
          const isSmallScreen = window.innerWidth < 768;
          const isMobile = isMobileUA || isSmallScreen;
          
          const forcePC = localStorage.getItem('force_pc_mode') === 'true';

          if (isMobile && !forcePC && currentPage.startsWith('platform/iotaseoul')) {
              navigateTo('mobile');
          } else if (forcePC && currentPage.startsWith('mobile')) {
              navigateTo('platform/iotaseoul/workflow');
          }
      }
  }, [user, loading, currentPage, recoveryMode]);

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

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  const isSmallScreen = window.innerWidth < 768;
  const isMobile = isMobileUA || isSmallScreen;
  const forcePC = localStorage.getItem('force_pc_mode') === 'true';

  return (
    <>
      <div className={
        (currentPage.startsWith('mobile') || currentPage === 'home')
          ? "w-full h-[100dvh] overflow-hidden relative"
          : (['system-plan', 'system-bridge', 'system-chat', 'system-detail', 'system-core', 'platform', 'auth-setup', 'workspace/archive', 'system-admin'].includes(currentPage) || currentPage.startsWith('platform/iotaseoul'))
            ? "w-full h-screen overflow-hidden"
            : "hidden lg:block scroll-container font-sans"
      } id="scroll-container">
        {!(['system-plan', 'system-bridge', 'system-chat', 'system-detail', 'system-core', 'platform', 'auth-setup', 'workspace/archive', 'system-admin'].includes(currentPage) || currentPage.startsWith('platform/iotaseoul') || currentPage.startsWith('mobile')) && (
            <Header
              onNavigateToHome={() => setCurrentPage('home')}
              currentPage={currentPage}
            />
        )}

        {currentPage === 'home' && <MainLayout />}
        {currentPage === 'action-plan' && <Notes />}
        
        {/* Navigation Handlers overriding the inline SystemPlan internal stage logic */}
        {currentPage === 'auth-setup' && (
            <AuthSetup 
                onLogin={() => {
                    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
                    const isSmallScreen = window.innerWidth < 768;
                    const isMobile = isMobileUA || isSmallScreen;
                    const forcePC = localStorage.getItem('force_pc_mode') === 'true';
                    
                    if (isMobile && !forcePC) {
                        navigateTo('mobile');
                    } else {
                        navigateTo('platform/iotaseoul/workflow');
                    }
                }} 
            />
        )}
        {currentPage === 'system-plan' && <SystemLogin onLogin={() => navigateTo('system-bridge')} />}
        {['system-bridge', 'system-chat', 'system-detail'].includes(currentPage) && (
            <SystemPlan 
                externalStage={
                    currentPage === 'system-bridge' ? 0 : 
                    currentPage === 'system-chat' ? 1 : 2
                } 
                onNext={() => {
                    if (currentPage === 'system-bridge') navigateTo('system-chat');
                    if (currentPage === 'system-chat') navigateTo('system-detail');
                }} 
            />
        )}
        {currentPage === 'system-core' && <SystemCore isPlatform={false} />}
        {currentPage === 'platform' && <PlatformCore isPlatform={true} />}
        {currentPage.startsWith('platform/iotaseoul') && !currentPage.includes('/archive') && <PlatformCore isPlatform={true} isIotaWorkspaceOverride={true} currentPath={currentPage} />}
        {(currentPage.includes('workspace/archive') || currentPage.endsWith('/archive')) && <WorkspaceArchive />}
        {currentPage === 'system-admin' && <SystemAdmin />}
        {currentPage.startsWith('mobile') && <MobileIotaApp navigateTo={navigateTo} />}
      </div>

      {/* Floating back to mobile view button (Only visible on mobile devices browsing forced PC page) */}
      {isMobile && forcePC && !currentPage.startsWith('mobile') && (
          <button 
              onClick={() => {
                  localStorage.removeItem('force_pc_mode');
                  navigateTo('mobile');
              }}
              className="fixed right-4 bottom-4 z-50 bg-[#3b82f6] text-white text-[12px] font-bold px-3 py-2 rounded-full shadow-lg border border-[#3b82f6]/30 active:scale-95 transition-all opacity-90 hover:opacity-100 flex items-center gap-1"
          >
              <span>📱 모바일 최적화 화면 보기</span>
          </button>
      )}
    </>
  );
}
