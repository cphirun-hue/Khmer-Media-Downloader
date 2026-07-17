import React from 'react';
import { 
  Youtube, 
  Facebook, 
  Video, 
  LogOut, 
  Settings, 
  FileText, 
  HelpCircle,
  Search,
  ExternalLink,
  Github
} from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickLinkClick: (url: string) => void;
  darkMode: boolean;
  isKhmer: boolean;
  userEmail: string;
}

export default function StartMenu({ 
  isOpen, 
  onClose, 
  onQuickLinkClick, 
  darkMode,
  isKhmer,
  userEmail 
}: StartMenuProps) {
  if (!isOpen) return null;

  const handlePinnedClick = (url: string) => {
    onQuickLinkClick(url);
    onClose();
  };

  const sampleLinks = {
    youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    facebook: "https://www.facebook.com/watch/?v=1234567890",
    tiktok: "https://www.tiktok.com/@creator/video/1122334455"
  };

  return (
    <div 
      id="win11-start-menu"
      className={`absolute bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg rounded-xl shadow-2xl backdrop-blur-2xl border p-6 z-50 transition-all duration-300 transform origin-bottom ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0 pointer-events-none'
      } ${
        darkMode 
          ? 'bg-[#121212]/95 border-white/5 text-white' 
          : 'bg-slate-50/95 border-slate-200/50 text-slate-800'
      }`}
    >
      {/* Search Input inside Start menu */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder={isKhmer ? "ស្វែងរកកម្មវិធី និងឯកសារ..." : "Search apps, settings, and documents..."}
          className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
            darkMode 
              ? 'bg-white/5 border-white/10 text-white placeholder-white/30' 
              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Pinned Applications Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-semibold tracking-wider uppercase opacity-80">
            {isKhmer ? 'កម្មវិធីដែលបានខ្ទាស់' : 'Pinned Apps'}
          </h3>
          <button className="text-xs text-sky-500 hover:underline">
            {isKhmer ? 'កម្មវិធីទាំងអស់' : 'All Apps'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* YouTube Downloader */}
          <button 
            onClick={() => handlePinnedClick(sampleLinks.youtube)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105 ${
              darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
            }`}
          >
            <div className="p-2.5 bg-red-600 rounded-lg text-white mb-2 shadow-md">
              <Youtube className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-center">YouTube DL</span>
          </button>

          {/* Facebook Downloader */}
          <button 
            onClick={() => handlePinnedClick(sampleLinks.facebook)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105 ${
              darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
            }`}
          >
            <div className="p-2.5 bg-blue-600 rounded-lg text-white mb-2 shadow-md">
              <Facebook className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-center">Facebook DL</span>
          </button>

          {/* TikTok Downloader */}
          <button 
            onClick={() => handlePinnedClick(sampleLinks.tiktok)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105 ${
              darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
            }`}
          >
            <div className="p-2.5 bg-slate-950 border border-slate-750 rounded-lg text-white mb-2 shadow-md flex items-center justify-center">
              <Video className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <span className="text-[11px] font-medium text-center">TikTok DL</span>
          </button>

          {/* Official Settings */}
          <button 
            className={`flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105 ${
              darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
            }`}
          >
            <div className={`p-2.5 rounded-lg mb-2 shadow-md ${darkMode ? 'bg-slate-750 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-center">{isKhmer ? 'ការកំណត់' : 'Settings'}</span>
          </button>
        </div>
      </div>

      {/* Recommended Files / Quick Utilities Section */}
      <div className="mb-6 border-t pt-4 border-slate-700/20">
        <h3 className="text-xs font-semibold tracking-wider uppercase opacity-80 mb-3">
          {isKhmer ? 'ឯកសារណែនាំ' : 'Recommended'}
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div 
            onClick={() => handlePinnedClick(sampleLinks.youtube)}
            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
              darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-200/40'
            }`}
          >
            <FileText className="w-5 h-5 text-indigo-400" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate">yt-dlp_guide.pdf</span>
              <span className="text-[10px] opacity-60">2m ago</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/5">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate">{isKhmer ? 'ជំនួយបច្ចេកទេស' : 'Windows 11 Setup help'}</span>
              <span className="text-[10px] opacity-60">1h ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Menu Footer with User account info */}
      <div className={`flex justify-between items-center -mx-6 -mb-6 px-6 py-3.5 rounded-b-xl border-t ${
        darkMode ? 'bg-[#0a0a0a]/90 border-white/5' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          {/* Simulated beautiful Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {userEmail ? userEmail.substring(0, 2).toUpperCase() : "KH"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">cphirun@gmail.com</span>
            <span className="text-[10px] opacity-75">{isKhmer ? 'គណនីមូលដ្ឋាន' : 'Local Administrator'}</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <a 
            href="https://github.com/yt-dlp/yt-dlp" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`p-2 rounded-md hover:bg-white/10 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
            title="yt-dlp GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
          <button 
            onClick={onClose}
            className={`p-2 rounded-md hover:bg-white/10 transition-colors text-red-400`}
            title={isKhmer ? "ចាកចេញ" : "Log out"}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
