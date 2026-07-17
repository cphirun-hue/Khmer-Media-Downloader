import React, { useState } from 'react';
import DesktopBackground from './components/DesktopBackground';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import WindowFrame from './components/WindowFrame';
import DownloaderApp from './components/DownloaderApp';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isKhmer, setIsKhmer] = useState<boolean>(true);
  const [isStartOpen, setIsStartOpen] = useState<boolean>(false);
  const [isAppOpen, setIsAppOpen] = useState<boolean>(true);
  const [preloadedUrl, setPreloadedUrl] = useState<string>('');

  const toggleLanguage = () => {
    setIsKhmer(!isKhmer);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleStartMenuClick = () => {
    setIsStartOpen(!isStartOpen);
  };

  const handleAppLaunch = () => {
    setIsAppOpen(true);
    setIsStartOpen(false);
  };

  const handleQuickLinkClick = (url: string) => {
    setPreloadedUrl(url);
    setIsAppOpen(true);
    setIsStartOpen(false);
  };

  const clearPreloadedUrl = () => {
    setPreloadedUrl('');
  };

  return (
    <div 
      id="windows11-root-container" 
      className={`relative w-screen h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}
    >
      {/* 1. Immersive Vector Desktop Wallpaper */}
      <DesktopBackground darkMode={darkMode} />

      {/* 2. Desktop shortcuts */}
      <div 
        id="desktop-shortcuts"
        className="absolute top-6 left-6 flex flex-col gap-5 z-20"
      >
        <div 
          onClick={handleAppLaunch}
          className={`group flex flex-col items-center justify-center p-2.5 rounded-xl cursor-pointer w-20 text-center transition-all ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-900/10'
          }`}
        >
          <div className="relative p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl text-white shadow-lg group-hover:scale-105 transition-transform">
            <svg 
              className="w-7 h-7" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold mt-1.5 leading-tight text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.85)] select-none truncate w-full">
            {isKhmer ? 'កម្មវិធីទាញយក' : 'Downloader'}
          </span>
        </div>
      </div>

      {/* 3. Draggable OS Application Window */}
      <WindowFrame
        title={isKhmer ? "ខ្មែរ មេឌា ដោនឡូដ័រ v1.0.4 (Windows 11 Edition)" : "Khmer Media Downloader v1.0.4"}
        isOpen={isAppOpen}
        onClose={() => setIsAppOpen(false)}
        onMinimize={() => setIsAppOpen(false)}
        darkMode={darkMode}
      >
        <DownloaderApp 
          darkMode={darkMode}
          isKhmer={isKhmer}
          onLanguageToggle={toggleLanguage}
          onThemeToggle={toggleTheme}
          preloadedUrl={preloadedUrl}
          clearPreloadedUrl={clearPreloadedUrl}
        />
      </WindowFrame>

      {/* 4. Windows 11 Start Menu Flyout */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onQuickLinkClick={handleQuickLinkClick}
        darkMode={darkMode}
        isKhmer={isKhmer}
        userEmail="cphirun@gmail.com"
      />

      {/* 5. Windows 11 Bottom Taskbar */}
      <Taskbar
        onStartClick={handleStartMenuClick}
        onAppClick={handleAppLaunch}
        onSettingsClick={() => {
          setIsAppOpen(true);
          setIsStartOpen(false);
          // Directly target settings tab, we can handle inside DownloaderApp
        }}
        activeAppOpen={isAppOpen}
        darkMode={darkMode}
        isKhmer={isKhmer}
        onLanguageToggle={toggleLanguage}
      />
    </div>
  );
}
