import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Settings, 
  Folder, 
  Globe, 
  Wifi, 
  Volume2, 
  Battery, 
  MessageSquare, 
  Compass, 
  Monitor,
  Download
} from 'lucide-react';

interface TaskbarProps {
  onStartClick: () => void;
  onAppClick: () => void;
  onSettingsClick: () => void;
  activeAppOpen: boolean;
  darkMode: boolean;
  isKhmer: boolean;
  onLanguageToggle: () => void;
}

export default function Taskbar({ 
  onStartClick, 
  onAppClick, 
  onSettingsClick,
  activeAppOpen, 
  darkMode,
  isKhmer,
  onLanguageToggle
}: TaskbarProps) {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isKhmer ? 'km-KH' : 'en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      id="win11-taskbar"
      className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-3 select-none z-50 backdrop-blur-xl border-t transition-colors duration-300 ${
        darkMode 
          ? 'bg-[#000000]/95 border-white/5 text-white/90' 
          : 'bg-white/75 border-slate-200/40 text-slate-800'
      }`}
    >
      {/* Left side: Invisible spacer to balance layout or show custom widget */}
      <div className="flex items-center gap-2 w-1/4">
        <button 
          id="taskbar-widget"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs hover:bg-white/10 transition-colors ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
        >
          <Compass className="w-4 h-4 text-sky-500 animate-pulse" />
          <span className="hidden md:inline font-medium text-[11px]">
            {isKhmer ? 'ភ្នំពេញ៖ ២៨°C' : 'Phnom Penh: 28°C'}
          </span>
        </button>
      </div>

      {/* Center: Pinned & Running Applications */}
      <div className="flex items-center gap-1">
        {/* Windows Start Button */}
        <button 
          id="btn-win-start"
          onClick={onStartClick}
          className={`p-2 rounded-md transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
          title={isKhmer ? "ម៉ឺនុយចាប់ផ្តើម" : "Start Menu"}
        >
          {/* Custom Windows 11 Fluent 4-tile logo */}
          <div className="grid grid-cols-2 gap-0.5 w-4.5 h-4.5">
            <div className="bg-sky-500 rounded-[1px] w-[8px] h-[8px]"></div>
            <div className="bg-sky-500 rounded-[1px] w-[8px] h-[8px]"></div>
            <div className="bg-sky-500 rounded-[1px] w-[8px] h-[8px]"></div>
            <div className="bg-sky-500 rounded-[1px] w-[8px] h-[8px]"></div>
          </div>
        </button>

        {/* Windows Search Bar / Button */}
        <button 
          id="btn-win-search"
          className={`p-2 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
          title={isKhmer ? "ស្វែងរក" : "Search"}
        >
          <Search className="w-5 h-5 text-sky-400" />
        </button>

        {/* Separator */}
        <div className={`h-6 w-[1px] mx-1 ${darkMode ? 'bg-slate-700/60' : 'bg-slate-300/60'}`}></div>

        {/* Running App: Khmer Media Downloader */}
        <button 
          id="taskbar-app-downloader"
          onClick={onAppClick}
          className={`p-2 rounded-md transition-all duration-200 relative flex items-center justify-center ${
            activeAppOpen 
              ? darkMode ? 'bg-slate-800/80 hover:bg-slate-700/80' : 'bg-white/80 hover:bg-slate-100/80'
              : darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
          title="Khmer Media Downloader"
        >
          <div className="relative p-0.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg text-white">
            <Download className="w-4.5 h-4.5" />
          </div>
          {/* Active app lightbar dot */}
          <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-sky-500 transition-all ${
            activeAppOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`} />
        </button>

        {/* Pinned App: File Explorer */}
        <button 
          id="taskbar-app-explorer"
          className={`p-2 rounded-md transition-all hover:scale-105 active:scale-95 hidden sm:flex items-center justify-center ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
        >
          <Folder className="w-5 h-5 text-amber-500" />
        </button>

        {/* Pinned App: Edge / Browser */}
        <button 
          id="taskbar-app-edge"
          className={`p-2 rounded-md transition-all hover:scale-105 active:scale-95 hidden sm:flex items-center justify-center ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
        >
          <Globe className="w-5 h-5 text-sky-500" />
        </button>

        {/* Pinned App: Settings */}
        <button 
          id="taskbar-app-settings"
          onClick={onSettingsClick}
          className={`p-2 rounded-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
          title={isKhmer ? "ការកំណត់" : "Settings"}
        >
          <Settings className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>
      </div>

      {/* Right: System Tray & Quick Settings */}
      <div className="flex items-center gap-1.5 w-1/4 justify-end">
        {/* Language selector */}
        <button 
          id="btn-lang-switcher"
          onClick={onLanguageToggle}
          className={`px-1.5 py-1 rounded text-[11px] font-semibold tracking-wider hover:bg-white/10 ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
          title={isKhmer ? "ប្តូរភាសា" : "Switch Language"}
        >
          {isKhmer ? 'ខ្មែរ' : 'ENG'}
        </button>

        {/* Status indicators grouped */}
        <div 
          id="system-status-group"
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-white/10 ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          <Volume2 className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5 text-sky-400" />
        </div>

        {/* Time and Date Display */}
        <div 
          id="system-clock-display"
          className={`flex flex-col items-end px-2 py-0.5 rounded-md hover:bg-white/10 text-[11px] cursor-pointer ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
        >
          <span className="font-semibold">{formatTime(time)}</span>
          <span className="opacity-85 text-[10px]">{formatDate(time)}</span>
        </div>

        {/* Notification Bell / Messenger */}
        <button 
          id="btn-notifications"
          className={`p-2 rounded-md relative flex items-center justify-center ${
            darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
        </button>
      </div>
    </div>
  );
}
