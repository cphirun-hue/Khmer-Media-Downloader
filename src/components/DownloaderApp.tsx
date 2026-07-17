import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Facebook, 
  Video, 
  Download, 
  Clipboard, 
  RefreshCw, 
  History, 
  BookOpen, 
  Settings, 
  Copy, 
  Check, 
  Play, 
  Trash2, 
  AlertCircle,
  FileText,
  Info,
  Laptop,
  CheckCircle2,
  ListRestart,
  Folder,
  FolderOpen
} from 'lucide-react';
import { VideoMetadata, WindowsDownloadScript, DownloadHistoryItem, AnalysisResponse } from '../types';

interface DownloaderAppProps {
  darkMode: boolean;
  isKhmer: boolean;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  preloadedUrl: string;
  clearPreloadedUrl: () => void;
}

export default function DownloaderApp({
  darkMode,
  isKhmer,
  onLanguageToggle,
  onThemeToggle,
  preloadedUrl,
  clearPreloadedUrl
}: DownloaderAppProps) {
  // Tabs: 'download', 'history', 'guide', 'settings'
  const [activeTab, setActiveTab] = useState<'download' | 'history' | 'guide' | 'settings'>('download');
  
  // Downloader Inputs & States
  const [urlInput, setUrlInput] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Results
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [scripts, setScripts] = useState<WindowsDownloadScript[]>([]);
  const [directDownloadUrl, setDirectDownloadUrl] = useState<string>('');
  const [selectedResolution, setSelectedResolution] = useState<string>('1080p (FHD)');

  // Download simulation
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 MB/s');
  const [timeLeft, setTimeLeft] = useState<string>('0s');

  // History & Storage
  const [historyItems, setHistoryItems] = useState<DownloadHistoryItem[]>([]);
  
  // Copy feedback tracking
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Download directory settings
  const [downloadFolder, setDownloadFolder] = useState<string>(() => {
    return localStorage.getItem('khmer_downloader_folder') || 'C:\\Users\\Admin\\Downloads\\';
  });
  const [isCustomFolder, setIsCustomFolder] = useState<boolean>(() => {
    const saved = localStorage.getItem('khmer_downloader_folder') || 'C:\\Users\\Admin\\Downloads\\';
    const presets = [
      'C:\\Users\\Admin\\Downloads\\',
      'C:\\Users\\Admin\\Desktop\\',
      'C:\\Users\\Admin\\Documents\\',
      'C:\\Users\\Admin\\Videos\\'
    ];
    return !presets.includes(saved);
  });

  const [showBrowserPathNotice, setShowBrowserPathNotice] = useState<boolean>(false);
  const [pickedFolderName, setPickedFolderName] = useState<string>('');

  const handleBrowseLocalFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker();
        if (handle && handle.name) {
          const folderName = handle.name;
          setPickedFolderName(folderName);
          
          // Construct a friendly, likely Windows path based on user selected folder
          let resolvedPath = `C:\\Users\\Admin\\Downloads\\${folderName}\\`;
          
          if (downloadFolder.includes('\\')) {
            const parts = downloadFolder.split('\\');
            if (parts.length > 1) {
              const lastNonEmptyIdx = parts.length - (parts[parts.length - 1] === '' ? 2 : 1);
              if (lastNonEmptyIdx >= 0) {
                const prefixParts = parts.slice(0, lastNonEmptyIdx);
                resolvedPath = prefixParts.join('\\') + '\\' + folderName + '\\';
              }
            }
          }
          
          setDownloadFolder(resolvedPath);
          setIsCustomFolder(true);
          localStorage.setItem('khmer_downloader_folder', resolvedPath);
          setShowBrowserPathNotice(true);
          playSystemChime();
        }
      } else {
        alert(isKhmer 
          ? "កម្មវិធីរុករកបណ្ដាញ (Browser) របស់អ្នកមិនគាំទ្រមុខងាររើស Folder ដោយផ្ទាល់ទេ។ សូមសាកល្បងប្រើ Google Chrome ឬ Microsoft Edge ឬគ្រាន់តែវាយបញ្ចូលទីតាំងថតដោយផ្ទាល់!" 
          : "Your browser does not support picking folders directly. Please try Google Chrome, Microsoft Edge, or type the directory path manually in the custom field!");
      }
    } catch (err: any) {
      console.warn("Folder picker error / cancelled:", err);
      if (err.name !== 'AbortError') {
        setShowBrowserPathNotice(true);
      }
    }
  };

  const handleSelectPresetFolder = (path: string) => {
    setDownloadFolder(path);
    setIsCustomFolder(false);
    localStorage.setItem('khmer_downloader_folder', path);
    playSystemChime();
  };

  const handleSelectCustomFolder = () => {
    setIsCustomFolder(true);
    const presets = [
      'C:\\Users\\Admin\\Downloads\\',
      'C:\\Users\\Admin\\Desktop\\',
      'C:\\Users\\Admin\\Documents\\',
      'C:\\Users\\Admin\\Videos\\'
    ];
    if (presets.includes(downloadFolder)) {
      const customDefault = 'D:\\MyDownloads\\';
      setDownloadFolder(customDefault);
      localStorage.setItem('khmer_downloader_folder', customDefault);
    }
    playSystemChime();
  };

  const handleCustomPathChange = (val: string) => {
    setDownloadFolder(val);
    localStorage.setItem('khmer_downloader_folder', val);
  };

  const getFolderAdjustedCommand = (command: string) => {
    let folder = downloadFolder;
    if (!folder.endsWith('\\') && !folder.endsWith('/')) {
      folder += '\\';
    }
    
    let res = command;
    // Replace $HOME\\Downloads\\\\ with double backslashes in folder
    res = res.replace(/\$HOME\\\\Downloads\\\\/g, folder.replace(/\\/g, '\\\\'));
    res = res.replace(/\$HOME\\\\Downloads\\/g, folder.replace(/\\/g, '\\\\'));
    res = res.replace(/\$HOME\\\\Downloads/g, folder.replace(/\\/g, '\\\\'));
    
    // Replace $HOME\Downloads with folder
    res = res.replace(/\$HOME\\Downloads\\/g, folder);
    res = res.replace(/\$HOME\\Downloads/g, folder);
    
    res = res.replace(/\$HOME\/Downloads\//g, folder.replace(/\\/g, '/'));
    res = res.replace(/\$HOME\/Downloads/g, folder.replace(/\\/g, '/'));
    return res;
  };

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('khmer_downloader_history');
    if (saved) {
      try {
        setHistoryItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync preloaded URLs from Start Menu clicks
  useEffect(() => {
    if (preloadedUrl) {
      setUrlInput(preloadedUrl);
      setActiveTab('download');
      clearPreloadedUrl();
      // Auto analyze!
      triggerAnalysis(preloadedUrl);
    }
  }, [preloadedUrl]);

  // Handle URL detection platform badge highlights
  const detectPlatform = (url: string): 'youtube' | 'facebook' | 'tiktok' | 'unknown' => {
    const norm = url.toLowerCase();
    if (norm.includes('youtube.com') || norm.includes('youtu.be')) return 'youtube';
    if (norm.includes('facebook.com') || norm.includes('fb.watch') || norm.includes('fb.com')) return 'facebook';
    if (norm.includes('tiktok.com')) return 'tiktok';
    return 'unknown';
  };

  const detectedPlatform = detectPlatform(urlInput);

  // Trigger server-side analysis
  const triggerAnalysis = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || urlInput;
    if (!targetUrl.trim()) {
      setErrorMsg(isKhmer ? "សូមបញ្ចូលតំណភ្ជាប់វីដេអូជាមុនសិន។" : "Please enter a video URL first.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    setMetadata(null);
    setScripts([]);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      
      const data: AnalysisResponse = await response.json();
      
      if (data.success && data.metadata && data.scripts) {
        setMetadata(data.metadata);
        setScripts(data.scripts);
        setDirectDownloadUrl(data.directDownloadUrl || '');
        if (data.metadata.resolutionOptions.length > 0) {
          setSelectedResolution(data.metadata.resolutionOptions[0]);
        }

        // Play Windows system sound effect (Subtle notification)
        playSystemChime();
      } else {
        setErrorMsg(data.error || (isKhmer ? "ការវិភាគបរាជ័យ។ សូមពិនិត្យមើលតំណភ្ជាប់ម្តងទៀត។" : "Analysis failed. Please check the URL and try again."));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(isKhmer ? "មានបញ្ហាតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ។" : "Error connecting to server.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Custom audio synthesizer to play immersive Win11 system chimes
  const playSystemChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sound node 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      
      // Sound node 2 (harmony)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.8);
      osc2.stop(audioCtx.currentTime + 0.8);
    } catch (err) {
      // Audio context might be blocked on first interactions
    }
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        setErrorMsg('');
      }
    } catch (e) {
      setErrorMsg(isKhmer ? "មិនអាចចូលប្រើប្រាស់ clipboard បានទេ។ សូមសរសេរលីងចូលផ្ទាល់។" : "Cannot access clipboard. Please paste manually.");
    }
  };

  // Trigger interactive browser download simulation
  const startDownloadSimulation = () => {
    if (!metadata) return;
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadSpeed('1.2 MB/s');
    setTimeLeft('15s');

    const totalDuration = 4000; // 4 seconds total download progress
    const steps = 40;
    const interval = totalDuration / steps;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const progress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setDownloadProgress(progress);

      // Randomize speed
      const speeds = ['8.5 MB/s', '12.3 MB/s', '14.1 MB/s', '10.5 MB/s', '15.2 MB/s'];
      setDownloadSpeed(speeds[Math.floor(Math.random() * speeds.length)]);
      
      // Remaining seconds
      const secLeft = Math.max(Math.ceil(((steps - currentStep) * interval) / 1000), 0);
      setTimeLeft(`${secLeft}s`);

      if (currentStep >= steps) {
        clearInterval(progressTimer);
        setDownloading(false);
        
        // Trigger actual direct download of file!
        const a = document.createElement('a');
        const downloadFilename = `${metadata.title.replace(/[^a-zA-Z0-9\u1780-\u17F9]/g, "_")}.mp4`;
        a.href = `/api/proxy-download?url=${encodeURIComponent(directDownloadUrl)}&filename=${encodeURIComponent(downloadFilename)}`;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Add to history
        const newHistoryItem: DownloadHistoryItem = {
          id: Date.now().toString(),
          title: metadata.title,
          author: metadata.author,
          platform: metadata.platform,
          url: metadata.originalUrl,
          downloadedAt: new Date().toLocaleString(),
          fileSize: metadata.fileSizeEstimate,
          status: 'completed'
        };

        const updatedHistory = [newHistoryItem, ...historyItems];
        setHistoryItems(updatedHistory);
        localStorage.setItem('khmer_downloader_history', JSON.stringify(updatedHistory));

        // Succesful notification beep
        playSystemChime();
      }
    }, interval);
  };

  // Copy powershell scripts
  const handleCopyScript = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedScriptIndex(index);
    setTimeout(() => setCopiedScriptIndex(null), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(urlInput);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Delete history item
  const handleDeleteHistory = (id: string) => {
    const updated = historyItems.filter(item => item.id !== id);
    setHistoryItems(updated);
    localStorage.setItem('khmer_downloader_history', JSON.stringify(updated));
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setHistoryItems([]);
    localStorage.removeItem('khmer_downloader_history');
  };

  return (
    <div id="downloader-core-panel" className="flex flex-1 overflow-hidden h-full flex-col">
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Fluent Left Sidebar */}
        <div 
          id="downloader-sidebar"
          className={`w-64 border-r flex flex-col justify-between p-6 select-none shrink-0 transition-colors ${
            darkMode ? 'bg-[#121212] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="space-y-6">
            {/* Sidebar Title */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-600/30">V</div>
              <span className="text-sm font-bold tracking-tight uppercase">
                {isKhmer ? 'ផ្ទាំងបញ្ជា' : 'V-Stream Pro'}
              </span>
            </div>

            {/* Navigation Buttons */}
            <nav className="space-y-1.5">
              <button 
                id="tab-btn-download"
                onClick={() => setActiveTab('download')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'download'
                    ? darkMode ? 'bg-white/10 text-white' : 'bg-blue-600 text-white shadow-md'
                    : darkMode ? 'text-white/50 hover:bg-white/5' : 'hover:bg-slate-200/60 text-slate-700'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{isKhmer ? 'ទាញយកមេឌា' : 'Downloads'}</span>
              </button>

              <button 
                id="tab-btn-history"
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? darkMode ? 'bg-white/10 text-white' : 'bg-blue-600 text-white shadow-md'
                    : darkMode ? 'text-white/50 hover:bg-white/5' : 'hover:bg-slate-200/60 text-slate-700'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="flex-1 text-left">{isKhmer ? 'ប្រវត្តិទាញយក' : 'History Log'}</span>
                {historyItems.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {historyItems.length}
                  </span>
                )}
              </button>

              <button 
                id="tab-btn-guide"
                onClick={() => setActiveTab('guide')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'guide'
                    ? darkMode ? 'bg-white/10 text-white' : 'bg-blue-600 text-white shadow-md'
                    : darkMode ? 'text-white/50 hover:bg-white/5' : 'hover:bg-slate-200/60 text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{isKhmer ? 'របៀបប្រើប្រាស់' : 'Setup Guide'}</span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar Settings & Storage Item */}
          <div className="space-y-4">
            <button 
              id="tab-btn-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? darkMode ? 'bg-white/10 text-white' : 'bg-blue-600 text-white'
                  : darkMode ? 'text-white/50 hover:bg-white/5' : 'hover:bg-slate-200/60 text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{isKhmer ? 'ការកំណត់ប្រព័ន្ធ' : 'Settings'}</span>
            </button>

            {/* Storage Usage indicator from design */}
            {darkMode && (
              <div className="bg-white/5 rounded-2xl p-4 text-left">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                  {isKhmer ? 'ទំហំផ្ទុក' : 'Storage'}
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full mb-2">
                  <div className="h-full bg-blue-500 rounded-full w-2/3"></div>
                </div>
                <div className="text-[10px] text-white/60">
                  {isKhmer ? 'ប្រើអស់ ១២៨.៤ GB នៃ ២៥៦ GB' : '128.4 GB of 256 GB used'}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Main Tab Content */}
      <div 
        id="downloader-content-pane"
        className={`flex-1 overflow-y-auto p-6 md:p-10 flex flex-col justify-start transition-colors ${
          darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-800'
        }`}
      >
        {/* Top Header Row with Language Selection Segmented Control */}
        <div className={`flex justify-between items-center pb-5 mb-8 border-b shrink-0 ${
          darkMode ? 'border-white/5' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <div className={`text-[10px] font-bold font-mono tracking-wider uppercase ${
              darkMode ? 'text-white/40' : 'text-slate-400'
            }`}>
              {activeTab === 'download' ? (isKhmer ? 'ផ្ទាំងបញ្ជាទាញយក' : 'DOWNLOADS PANEL') :
               activeTab === 'history' ? (isKhmer ? 'ប្រវត្តិទាញយក' : 'HISTORY LOGS') :
               activeTab === 'guide' ? (isKhmer ? 'របៀបតំឡើង និងប្រើប្រាស់' : 'SETUP INSTALLATION GUIDE') :
               (isKhmer ? 'ការកំណត់ប្រព័ន្ធ' : 'SYSTEM SETTINGS')}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Elegant Segmented Language Selector */}
            <div className={`p-1 rounded-xl flex items-center gap-1 border ${
              darkMode ? 'bg-black/30 border-white/5' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { if (!isKhmer) onLanguageToggle(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isKhmer
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : darkMode ? 'text-white/40 hover:text-white/85' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="text-sm select-none">🇰🇭</span>
                <span>ខ្មែរ</span>
              </button>
              <button
                type="button"
                onClick={() => { if (isKhmer) onLanguageToggle(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isKhmer
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : darkMode ? 'text-white/40 hover:text-white/85' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="text-sm select-none">🇺🇸</span>
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        {/* DOWNLOAD TAB */}
        {activeTab === 'download' && (
          <div className="space-y-8 max-w-5xl">
            {/* Intro Header */}
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">
                {isKhmer ? 'កម្មវិធីទាញយកវីដេអូគ្រប់ទម្រង់' : 'New Download'}
              </h1>
              <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
                {isKhmer 
                  ? 'ទាញយកវីដេអូពី YouTube, Facebook, TikTok បានយ៉ាងលឿន និងឥតគិតថ្លៃ។ គាំទ្រទាំងការទាញយកផ្ទាល់ និងការបង្កើតបញ្ជា PowerShell សម្រាប់ Windows 11។' 
                  : 'Paste video link from YouTube, Facebook or TikTok to instantly analyze and generate native full-resolution Windows 11 downloads.'}
              </p>
            </div>

            {/* Platform Badges Row */}
            <div className="flex gap-4 select-none">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                detectedPlatform === 'youtube' || !urlInput
                  ? 'bg-red-500/10 text-red-500 shadow-md scale-105' 
                  : darkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'
              }`}>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>YouTube</span>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                detectedPlatform === 'facebook' || !urlInput
                  ? 'bg-blue-500/10 text-blue-400 shadow-md scale-105' 
                  : darkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'
              }`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Facebook</span>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                detectedPlatform === 'tiktok' || !urlInput
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-md scale-105' 
                  : darkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'
              }`}>
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>TikTok</span>
              </div>
            </div>

            {/* URL Input Area */}
            <div className="space-y-3">
              <div className="relative flex items-center w-full">
                <input 
                  id="downloader-url-input"
                  type="text" 
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setErrorMsg('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && triggerAnalysis()}
                  placeholder={isKhmer ? "សូមបញ្ចូល ឬបិទភ្ជាប់តំណភ្ជាប់វីដេអូទីនេះ..." : "Paste video link from YouTube, Facebook or TikTok..."}
                  className={`w-full pl-6 pr-44 py-5 rounded-2xl text-lg border focus:outline-none focus:ring-2 transition-all font-sans ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-blue-500/50' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/30'
                  }`}
                />

                {/* Inside Input Actions */}
                <div className="absolute right-4 flex items-center gap-3">
                  {urlInput && (
                    <button 
                      onClick={handleCopyUrl}
                      className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${darkMode ? 'text-white/40' : 'text-slate-500'}`}
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button 
                    onClick={handlePasteClipboard}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      darkMode 
                        ? 'bg-[#121212] border-white/5 hover:bg-white/10 text-white/80' 
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>{isKhmer ? 'បិទភ្ជាប់' : 'Paste'}</span>
                  </button>
                </div>
              </div>

              {/* Download Directory Selector */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Folder className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      {isKhmer ? 'ទីតាំងរក្សាទុកឯកសារ' : 'Save Location'}
                    </h4>
                    <p className="font-mono text-xs text-white/80 select-all leading-none mt-1">
                      {downloadFolder}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={isCustomFolder ? 'custom' : downloadFolder}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        handleSelectCustomFolder();
                      } else {
                        handleSelectPresetFolder(val);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                      darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="C:\Users\Admin\Downloads\">{isKhmer ? '📁 ថតទាញយក (Downloads)' : '📁 Downloads'}</option>
                    <option value="C:\Users\Admin\Desktop\">{isKhmer ? '💻 លើផ្ទៃអេក្រង់ (Desktop)' : '💻 Desktop'}</option>
                    <option value="C:\Users\Admin\Documents\">{isKhmer ? '📄 ឯកសារ (Documents)' : '📄 Documents'}</option>
                    <option value="C:\Users\Admin\Videos\">{isKhmer ? '🎥 វីដេអូ (Videos)' : '🎥 Videos'}</option>
                    <option value="custom">{isKhmer ? '⚙️ កំណត់ខ្លួនឯង...' : '⚙️ Custom...'}</option>
                  </select>

                  {isCustomFolder && (
                    <input
                      type="text"
                      value={downloadFolder}
                      onChange={(e) => handleCustomPathChange(e.target.value)}
                      placeholder={isKhmer ? "ឧ. D:\\MyFolder\\" : "e.g. D:\\MyFolder\\"}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 ${
                        darkMode ? 'bg-[#0a0a0a] border-white/10 text-white placeholder:text-white/20' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  )}

                  <button
                    onClick={handleBrowseLocalFolder}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      darkMode
                        ? 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 text-blue-400'
                        : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                    }`}
                    title={isKhmer ? "ចុចរើស Folder ដោយផ្ទាល់ពីកុំព្យូទ័រ" : "Browse and pick folder directly from your computer"}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{isKhmer ? 'ជ្រើសរើសទីតាំង' : 'Browse...'}</span>
                  </button>
                </div>
              </div>

              {showBrowserPathNotice && (
                <div className={`p-4 rounded-xl border flex gap-3 items-start relative ${
                  darkMode ? 'bg-amber-500/5 border-amber-500/10 text-amber-200/80' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 pr-6 text-left">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider">
                      {isKhmer ? '🔒 បញ្ជាក់អំពីសិទ្ធិសុវត្ថិភាពរបស់ Browser' : '🔒 Browser Security Notice'}
                    </h5>
                    <p className="text-[10px] leading-relaxed opacity-90">
                      {isKhmer 
                        ? `ដោយសារច្បាប់សុវត្ថិភាពរបស់ Web Browser កម្មវិធីនៅលើអ៊ីនធឺណិតមិនអាចដឹងផ្លូវពេញលេញ (ដូចជា D:\\ ឬ C:\\...) នៃកុំព្យូទ័ររបស់អ្នកបានទេ។ យើងបានរកឃើញថាអ្នកបានរើសថតឈ្មោះ "${pickedFolderName || 'Folder'}" ហើយយើងបានស្នើផ្លូវលំនាំដើម៖ "${downloadFolder}"។ អ្នកអាចវាយកែសម្រួលវាឱ្យត្រូវនឹងផ្លូវពិតប្រាកដនៅលើកុំព្យូទ័ររបស់អ្នកបាន!` 
                        : `Due to web browser security policies, websites cannot read the exact full absolute physical path (e.g., D:\\ or C:\\...) on your computer. We successfully selected the directory named "${pickedFolderName || 'Folder'}" and proposed the path: "${downloadFolder}". You can edit the text box directly to match your actual local Windows folder path!`}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowBrowserPathNotice(false)}
                    className="absolute right-3 top-3 text-xs opacity-50 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Action Buttons & Progress state */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button 
                  id="btn-analyze"
                  onClick={() => triggerAnalysis()}
                  disabled={analyzing || !urlInput.trim()}
                  className={`flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl font-semibold transition-all cursor-pointer shadow-lg active:scale-95 ${
                    !urlInput.trim()
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 shadow-lg'
                  }`}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isKhmer ? 'កំពុងវិភាគតំណភ្ជាប់...' : 'Analyzing...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{isKhmer ? 'វិភាគតំណភ្ជាប់' : 'Analyze'}</span>
                    </>
                  )}
                </button>

                {urlInput && (
                  <button 
                    onClick={() => {
                      setUrlInput('');
                      setMetadata(null);
                      setScripts([]);
                      setErrorMsg('');
                    }}
                    className={`px-5 py-3 rounded-xl text-xs font-semibold border transition-colors ${
                      darkMode ? 'border-white/10 hover:bg-white/5 text-white/60' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isKhmer ? 'សម្អាត' : 'Clear'}
                  </button>
                )}

                <p className="text-xs text-white/30 text-right font-medium">
                  Link supported: https://www.youtube.com/watch?v=..., https://www.facebook.com/..., etc.
                </p>
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* ANALYZED RESULTS SECTION */}
            {metadata && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                {/* Left Side: Video Card Preview & Browser Downloader */}
                <div className="lg:col-span-5 space-y-4">
                  <div className={`p-5 rounded-2xl border ${
                    darkMode ? 'bg-white/5 border-white/5 shadow-xl' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="text-xs font-semibold uppercase opacity-40 tracking-wider mb-4">
                      {isKhmer ? 'ព័ត៌មានវីដេអូ' : 'Video Information'}
                    </h3>

                    {/* Video thumbnail with play overlay */}
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow border border-white/5">
                      <img 
                        src={metadata.thumbnailUrl} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-100 hover:scale-110 active:scale-95 transition-transform shadow cursor-pointer">
                          <Play className="w-5 h-5 fill-white ml-1" />
                        </div>
                      </div>
                      <span className="absolute bottom-2.5 right-2.5 bg-black/75 px-1.5 py-0.5 rounded text-[10px] text-white font-mono font-semibold">
                        {metadata.duration}
                      </span>
                    </div>

                    {/* Metadata specs */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold line-clamp-2 leading-snug">
                        {metadata.title}
                      </h4>
                      <p className="text-xs text-white/50 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{metadata.author}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-white/5">
                        <div>
                          <span className="text-[10px] uppercase opacity-40 block mb-0.5">
                            {isKhmer ? 'ទំហំឯកសារ' : 'File Size'}
                          </span>
                          <span className="text-xs font-bold text-blue-400">
                            ~{metadata.fileSizeEstimate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase opacity-40 block mb-0.5">
                            {isKhmer ? 'បណ្តាញ' : 'Platform'}
                          </span>
                          <span className="text-xs font-bold capitalize">
                            {metadata.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Web Downloader Control */}
                    <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                      <div>
                        <label className="text-[10px] uppercase opacity-40 block mb-2 font-bold">
                          {isKhmer ? 'ជ្រើសរើសគុណភាពវីដេអូ' : 'Select Resolution'}
                        </label>
                        <select 
                          value={selectedResolution}
                          onChange={(e) => setSelectedResolution(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold ${
                            darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          {metadata.resolutionOptions.map((res, i) => (
                            <option key={i} value={res}>{res}</option>
                          ))}
                        </select>
                      </div>

                      {downloading ? (
                        <div className="space-y-2.5 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              {isKhmer ? 'កំពុងទាញយក...' : 'Downloading...'}
                            </span>
                            <span className="font-mono font-bold text-blue-400">{downloadProgress}%</span>
                          </div>
                          
                          {/* Progress bar container */}
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-100" 
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-white/40 font-mono">
                            <span>ល្បឿន៖ {downloadSpeed}</span>
                            <span>រង់ចាំ៖ {timeLeft}</span>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={startDownloadSimulation}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>{isKhmer ? 'ទាញយកតាមកម្មវិធីរុករក (Browser)' : 'Download Direct to Browser'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Windows 11 Native Download Scripts */}
                <div className="lg:col-span-7 space-y-4">
                  <div className={`p-5 rounded-2xl border flex flex-col h-full justify-between ${
                    darkMode ? 'bg-white/5 border-white/5 shadow-xl' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Laptop className="w-4.5 h-4.5 text-blue-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">
                          {isKhmer ? 'បញ្ជាសម្រាប់ Windows 11 (ណែនាំ)' : 'Windows 11 Native Script Commands'}
                        </h3>
                      </div>
                      <p className="text-xs text-white/40 mb-5 leading-relaxed">
                        {isKhmer 
                          ? 'ដោយសារគោលការណ៍រក្សាសិទ្ធិ វីដេអូកម្រិតខ្ពស់ FHD (1080p) ខ្លះត្រូវការទាញយកតាមរយៈឧបករណ៍ដើម។ ប្រើប្រាស់បញ្ជា Windows ទាំងនេះ ដើម្បីដំណើរការដោយឥតគិតថ្លៃ ១០០%!' 
                          : 'Due to network restrictions, high-quality full resolution streams are best downloaded directly on your PC. Run these commands natively inside your Windows 11 system.'}
                      </p>

                      <div className="space-y-4">
                        {scripts.map((scr, idx) => (
                           <div 
                            key={idx} 
                            className={`p-4 rounded-xl border ${
                              darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200/80'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3 mb-3">
                              <div>
                                <h4 className="text-xs font-bold text-blue-400 mb-0.5">
                                  {scr.methodName}
                                </h4>
                                <p className="text-[10px] text-white/50 leading-relaxed">
                                  {scr.description}
                                </p>
                              </div>
                              <button 
                                onClick={() => handleCopyScript(getFolderAdjustedCommand(scr.command), idx)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all shrink-0 ${
                                  copiedScriptIndex === idx
                                    ? 'bg-blue-600 border-blue-600 text-white shadow shadow-blue-600/35'
                                    : darkMode 
                                      ? 'bg-[#0a0a0a] border-white/10 text-white/80 hover:bg-white/5' 
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {copiedScriptIndex === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{isKhmer ? 'ចម្លងរួច!' : 'Copied!'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{isKhmer ? 'ចម្លងកូដ' : 'Copy Code'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Code display terminal */}
                            <div className="relative rounded-lg overflow-hidden bg-[#0a0a0a] p-4 shadow-inner border border-white/5">
                              <pre className="font-mono text-[10px] text-white/80 overflow-x-auto whitespace-pre leading-relaxed select-all">
                                {getFolderAdjustedCommand(scr.command)}
                              </pre>
                            </div>

                            <div className="mt-3 flex items-start gap-2.5 text-[10px] text-white/50 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span className="whitespace-pre-line leading-relaxed">{scr.instructions}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-700/10 flex justify-end">
                      <button 
                        onClick={() => setActiveTab('guide')}
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>{isKhmer ? 'មើលរបៀបតម្លើងឧបករណ៍ yt-dlp & ffmpeg' : 'How to set up yt-dlp & ffmpeg guide'}</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
                  {isKhmer ? 'ប្រវត្តិការទាញយក' : 'Download History'}
                </h1>
                <p className="text-xs opacity-75">
                  {isKhmer ? 'បញ្ជីរាយនាមវីដេអូដែលលោកអ្នកបានទាញយកដោយជោគជ័យ។' : 'List of media files successfully processed and downloaded.'}
                </p>
              </div>

              {historyItems.length > 0 && (
                <button 
                  onClick={handleClearAllHistory}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/10 font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isKhmer ? 'សម្អាតទាំងអស់' : 'Clear All'}</span>
                </button>
              )}
            </div>

            {historyItems.length === 0 ? (
              <div className={`p-10 text-center rounded-2xl border flex flex-col items-center justify-center ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <History className="w-12 h-12 text-slate-500 mb-3 opacity-60" />
                <h3 className="text-sm font-semibold opacity-80 mb-1">
                  {isKhmer ? 'មិនទាន់មានប្រវត្តិទាញយកនៅឡើយទេ' : 'No history found'}
                </h3>
                <p className="text-xs opacity-60 mb-4">
                  {isKhmer ? 'រាល់វីដេអូដែលបានទាញយកតាម Browser នឹងត្រូវកត់ត្រាទុកនៅទីនេះ។' : 'All browser downloaded videos will be securely cataloged here.'}
                </p>
                <button 
                  onClick={() => setActiveTab('download')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  {isKhmer ? 'ទាញយកឥឡូវនេះ' : 'Download Now'}
                </button>
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'bg-[#121212] border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                        <th className="p-4 font-bold">{isKhmer ? 'ចំណងជើងវីដេអូ' : 'Title'}</th>
                        <th className="p-4 font-bold">{isKhmer ? 'បណ្តាញ' : 'Platform'}</th>
                        <th className="p-4 font-bold">{isKhmer ? 'ទំហំ' : 'Size'}</th>
                        <th className="p-4 font-bold">{isKhmer ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                        <th className="p-4 font-bold text-center">{isKhmer ? 'សកម្មភាព' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {historyItems.map((item) => (
                        <tr 
                          key={item.id} 
                          className={`transition-colors ${
                            darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-4 font-medium max-w-sm truncate">
                            <div className="flex flex-col">
                              <span className="font-bold truncate">{item.title}</span>
                              <span className="text-[10px] opacity-40 truncate">{item.url}</span>
                            </div>
                          </td>
                          <td className="p-4 capitalize font-semibold">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.platform === 'youtube' 
                                ? 'bg-red-500/15 text-red-500' 
                                : item.platform === 'facebook' 
                                  ? 'bg-blue-500/15 text-blue-500' 
                                  : 'bg-emerald-500/15 text-emerald-500'
                            }`}>
                              {item.platform === 'youtube' && <Youtube className="w-3 h-3" />}
                              {item.platform === 'facebook' && <Facebook className="w-3 h-3" />}
                              {item.platform === 'tiktok' && <Video className="w-3 h-3 text-emerald-400" />}
                              {item.platform}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-semibold">{item.fileSize}</td>
                          <td className="p-4 opacity-75">{item.downloadedAt}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => {
                                  setUrlInput(item.url);
                                  setActiveTab('download');
                                  triggerAnalysis(item.url);
                                }}
                                className={`p-1.5 rounded-md hover:bg-blue-500/15 text-blue-400 transition-all`}
                                title={isKhmer ? "ទាញយកឡើងវិញ" : "Analyze again"}
                              >
                                <ListRestart className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteHistory(item.id)}
                                className={`p-1.5 rounded-md hover:bg-red-500/15 text-red-400 transition-all`}
                                title={isKhmer ? "លុបចោល" : "Delete Record"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">
                {isKhmer ? 'របៀបតម្លើង និងប្រើប្រាស់ឧបករណ៍ Windows 11' : 'Windows 11 Setup Guide (yt-dlp)'}
              </h1>
              <p className="text-xs text-white/40 leading-relaxed">
                {isKhmer 
                  ? 'ធ្វើការទាញយកវីដេអូកម្រិត 4K ឬ 1080p បានយ៉ាងងាយស្រួល ឥតគិតថ្លៃ និងល្បឿនលឿនបំផុតដោយការប្រើប្រាស់ឧបករណ៍ yt-dlp លើម៉ាស៊ីនរបស់អ្នកផ្ទាល់។' 
                  : 'To download ultra HD 4K or high quality streams direct on your device, we highly recommend deploying yt-dlp on Windows 11. It is 100% free, fast, and secure.'}
              </p>
            </div>

            {/* Steps Container */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    1
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">
                      {isKhmer ? 'ជំហានទី១៖ បើកកម្មវិធី Terminal ឬ PowerShell របស់ Windows 11' : 'Step 1: Open PowerShell as Administrator'}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {isKhmer 
                        ? 'ចុចលើ Start Menu របស់ Windows រួចវាយពាក្យ "PowerShell" ឬ "Terminal" រួចចុច Mouse ស្តាំជ្រើសរើស "Run as Administrator"។' 
                        : 'Search for "PowerShell" in your Windows 11 Start menu, right-click it, and select "Run as Administrator".'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    2
                  </div>
                  <div className="space-y-3.5 flex-1">
                    <h3 className="text-sm font-semibold">
                      {isKhmer ? 'ជំហានទី២៖ ដំឡើងកម្មវិធី yt-dlp និង ffmpeg' : 'Step 2: Install dependencies via Winget'}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {isKhmer 
                        ? 'ចម្លងបញ្ជានៅខាងក្រោម រួចយកទៅបិទភ្ជាប់ក្នុង PowerShell ហើយចុច Enter ដើម្បីដំឡើងដោយស្វ័យប្រវត្តិ៖' 
                        : 'Windows 11 comes pre-installed with winget. Copy and run the following commands to set up yt-dlp and ffmpeg for parsing/merging high-quality video and audio:'}
                    </p>

                    <div className="space-y-2">
                      <div className="bg-[#0a0a0a] rounded-xl p-3 relative border border-white/10">
                        <pre className="font-mono text-[10px] text-blue-400 overflow-x-auto whitespace-pre">
                          winget install yt-dlp
                        </pre>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('winget install yt-dlp');
                            playSystemChime();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-[#0a0a0a] rounded-xl p-3 relative border border-white/10">
                        <pre className="font-mono text-[10px] text-blue-400 overflow-x-auto whitespace-pre">
                          winget install Gyan.FFmpeg
                        </pre>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('winget install Gyan.FFmpeg');
                            playSystemChime();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    3
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">
                      {isKhmer ? 'ជំហានទី៣៖ ចម្លងកូដបញ្ជាទាញយកពីកម្មវិធីរបស់យើង' : 'Step 3: Copy and run video script'}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {isKhmer 
                        ? 'ត្រលប់មកកាន់ផ្ទាំងទាញយក រួចវិភាគលីងវីដេអូ បន្ទាប់មកចម្លងបញ្ជា PowerShell (វិធីទី១) យកទៅបិទភ្ជាប់ និងដំណើរការនៅក្នុង PowerShell ជាការស្រេច! វីដេអូដែលទាញយករួចនឹងរក្សាទុកក្នុងថត "Downloads" របស់លោកអ្នក។' 
                        : 'Analyze your link on our main tab, copy the custom generated PowerShell command under Method 1, paste it into PowerShell and press Enter. Your high quality output file will be saved directly into your Windows Downloads folder.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated terminal preview */}
            <div className="border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#121212] px-4 py-3.5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[10px] font-mono text-white/40">Windows PowerShell - Administrator</span>
                <span className="w-4" />
              </div>
              <div className="bg-[#0a0a0a] p-5 font-mono text-[10px] text-white/80 space-y-1.5 overflow-x-auto select-none leading-relaxed">
                <p className="text-white/30">Windows PowerShell</p>
                <p className="text-white/30">Copyright (C) Microsoft Corporation. All rights reserved.</p>
                <p>&nbsp;</p>
                <p>PS C:\Windows\system32&gt; <span className="text-white">winget install yt-dlp</span></p>
                <p className="text-emerald-500">Found yt-dlp [yt-dlp.yt-dlp] Version 2026.04.10</p>
                <p className="text-emerald-500">Downloading package... 100% completed</p>
                <p className="text-emerald-500">Successfully installed yt-dlp!</p>
                <p>&nbsp;</p>
                <p>PS C:\Windows\system32&gt; <span className="text-white">yt-dlp -f best "https://www.youtube.com/watch?v=..."</span></p>
                <p className="text-white/40">[youtube] dQw4w9WgXcQ: Downloading webpage</p>
                <p className="text-white/40">[download] Destination: C:\Users\Admin\Downloads\Never_Gonna_Give_You_Up.mp4</p>
                <p className="text-emerald-400">[download] 100% of 15.42MiB in 00:01 (12.45MiB/s)</p>
                <p className="text-emerald-500">Download complete! Saved in Downloads directory.</p>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">
                {isKhmer ? 'ការកំណត់ប្រព័ន្ធ' : 'System Settings'}
              </h1>
              <p className="text-xs text-white/40">
                {isKhmer ? 'ធ្វើការកែប្រែភាសា និងរបៀបបង្ហាញរបស់កម្មវិធីឱ្យត្រូវតាមចំណូលចិត្តរបស់អ្នក។' : 'Customize theme, language, and other local parameters of the downloader.'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Language toggler setting */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">
                    {isKhmer ? 'ភាសាកម្មវិធី' : 'Application Language'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {isKhmer ? 'ជ្រើសរើសរវាងភាសាខ្មែរ និងភាសាអង់គ្លេស' : 'Toggle between Khmer and English'}
                  </p>
                </div>
                
                {/* Segmented language selector */}
                <div className={`p-1 rounded-xl flex items-center gap-1 border self-end sm:self-auto ${
                  darkMode ? 'bg-black/30 border-white/5' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => { if (!isKhmer) onLanguageToggle(); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isKhmer
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : darkMode ? 'text-white/40 hover:text-white/85' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-sm select-none">🇰🇭</span>
                    <span>ខ្មែរ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (isKhmer) onLanguageToggle(); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      !isKhmer
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : darkMode ? 'text-white/40 hover:text-white/85' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-sm select-none">🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Theme setting */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">
                    {isKhmer ? 'ផ្ទៃកម្មវិធី (Theme)' : 'Color Theme'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {isKhmer ? 'ប្តូររវាងផ្ទៃងងឹត (Dark Mode) និងផ្ទៃភ្លឺ (Light Mode)' : 'Switch between Dark mode and Light mode'}
                  </p>
                </div>
                <button 
                  onClick={onThemeToggle}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    darkMode 
                      ? 'bg-[#0a0a0a] border-white/10 hover:bg-white/5 text-white/80' 
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {darkMode 
                    ? (isKhmer ? 'ប្តូរទៅផ្ទៃភ្លឺ' : 'Light Mode') 
                    : (isKhmer ? 'ប្តូរទៅផ្ទៃងងឹត' : 'Dark Mode')}
                </button>
              </div>

              {/* Download Directory setting */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">
                    {isKhmer ? 'ថតទាញយកលំនាំដើម (Default Folder)' : 'Default Download Folder'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {isKhmer ? 'កំណត់ទីតាំងរក្សាទុកឯកសារលំនាំដើមនៅលើ Windows 11' : 'Choose or customize the default download folder for scripts'}
                  </p>
                </div>

                {/* Grid of preset folders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: isKhmer ? '📁 Downloads' : '📁 Downloads', value: 'C:\\Users\\Admin\\Downloads\\' },
                    { label: isKhmer ? '💻 Desktop' : '💻 Desktop', value: 'C:\\Users\\Admin\\Desktop\\' },
                    { label: isKhmer ? '📄 Documents' : '📄 Documents', value: 'C:\\Users\\Admin\\Documents\\' },
                    { label: isKhmer ? '🎥 Videos' : '🎥 Videos', value: 'C:\\Users\\Admin\\Videos\\' }
                  ].map((preset) => {
                    const isSelected = !isCustomFolder && downloadFolder === preset.value;
                    return (
                      <button
                        key={preset.value}
                        onClick={() => handleSelectPresetFolder(preset.value)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                            : darkMode
                              ? 'bg-[#0a0a0a]/50 border-white/10 text-white/70 hover:bg-white/5'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{preset.label}</div>
                        <div className="text-[10px] opacity-50 font-mono mt-0.5 truncate">{preset.value}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Folder Option */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  darkMode ? 'bg-[#0a0a0a]/30 border-white/5' : 'bg-white border-slate-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white/60 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCustomFolder}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectCustomFolder();
                          } else {
                            handleSelectPresetFolder('C:\\Users\\Admin\\Downloads\\');
                          }
                        }}
                        className="rounded border-white/20 text-blue-500 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{isKhmer ? 'កំណត់ទីតាំងផ្សេងៗខ្លួនឯង (Custom Path)' : 'Use Custom Directory Path'}</span>
                    </label>
                    {isCustomFolder && (
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
                        {isKhmer ? 'សកម្ម' : 'Active'}
                      </span>
                    )}
                  </div>

                  {isCustomFolder && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-white/40 leading-normal">
                        {isKhmer 
                          ? 'សូមវាយបញ្ចូលទីតាំងថត (Windows format ឧ. D:\\Videos\\) ឬចុចជ្រើសរើសទីតាំង ដើម្បីរើស Folder ដោយផ្ទាល់ពីកុំព្យូទ័រ' 
                          : 'Type your custom absolute Windows path (e.g., D:\\Downloads\\) or click Browse to select from your computer'}
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={downloadFolder}
                          onChange={(e) => handleCustomPathChange(e.target.value)}
                          placeholder="D:\CustomFolder\"
                          className={`flex-1 px-4 py-3 text-xs border rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                        <button
                          onClick={handleBrowseLocalFolder}
                          className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            darkMode
                              ? 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 text-blue-400'
                              : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                          }`}
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span>{isKhmer ? 'ជ្រើសរើសទីតាំង' : 'Browse...'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
