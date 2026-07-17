import React, { useState } from 'react';
import { Minus, Square, X, RotateCcw } from 'lucide-react';

interface WindowFrameProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  darkMode: boolean;
  children: React.ReactNode;
}

export default function WindowFrame({ 
  title, 
  isOpen, 
  onClose, 
  onMinimize, 
  darkMode, 
  children 
}: WindowFrameProps) {
  const [isMaximized, setIsMaximized] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div 
      id="win11-window-frame"
      className={`absolute transition-all duration-300 shadow-2xl overflow-hidden flex flex-col border z-40 select-none ${
        isMaximized 
          ? 'top-4 left-4 right-4 bottom-16 rounded-xl' 
          : 'top-12 left-12 w-[85vw] h-[75vh] rounded-xl'
      } ${
        darkMode 
          ? 'bg-[#0a0a0a] border-white/5 shadow-2xl shadow-black/80 text-white' 
          : 'bg-white border-slate-200 text-slate-800'
      } backdrop-blur-2xl`}
    >
      {/* OS Title Bar */}
      <div 
        id="window-titlebar"
        className={`h-11 flex items-center justify-between px-4 cursor-default select-none border-b shrink-0 ${
          darkMode ? 'border-white/5 bg-[#121212]/90' : 'border-slate-100 bg-slate-50/40'
        }`}
        onDoubleClick={() => setIsMaximized(!isMaximized)}
      >
        {/* App Title Left */}
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow">
            DL
          </div>
          <span className="text-xs font-semibold tracking-wide truncate">
            {title}
          </span>
        </div>

        {/* Windows Controls Right */}
        <div className="flex items-center h-full -mr-4">
          {/* Minimize */}
          <button 
            onClick={onMinimize}
            className={`w-11 h-full flex items-center justify-center transition-colors ${
              darkMode ? 'hover:bg-slate-800/80' : 'hover:bg-slate-200/80'
            }`}
            title="Minimize"
          >
            <Minus className="w-4 h-4 opacity-75" />
          </button>

          {/* Maximize/Restore */}
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className={`w-11 h-full flex items-center justify-center transition-colors ${
              darkMode ? 'hover:bg-slate-800/80' : 'hover:bg-slate-200/80'
            }`}
            title={isMaximized ? "Restore Down" : "Maximize"}
          >
            {isMaximized ? (
              <RotateCcw className="w-3.5 h-3.5 opacity-75" />
            ) : (
              <Square className="w-3.5 h-3.5 opacity-75" />
            )}
          </button>

          {/* Close */}
          <button 
            onClick={onClose}
            className="w-11 h-full flex items-center justify-center transition-all hover:bg-red-600 hover:text-white"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Window Client Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
