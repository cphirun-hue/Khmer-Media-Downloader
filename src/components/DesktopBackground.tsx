import React from 'react';

interface DesktopBackgroundProps {
  darkMode: boolean;
}

export default function DesktopBackground({ darkMode }: DesktopBackgroundProps) {
  return (
    <div 
      id="desktop-bg"
      className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-1000 select-none ${
        darkMode ? 'bg-slate-950' : 'bg-slate-100'
      }`}
    >
      {/* Fluent Bloom Vector Art simulated via elegant blurred gradient nodes */}
      <div 
        id="bg-bloom-1"
        className={`absolute top-1/4 left-1/4 w-[80vw] h-[80vh] rounded-full blur-[140px] opacity-40 mix-blend-screen transition-all duration-1000 ${
          darkMode 
            ? 'bg-gradient-to-tr from-indigo-700 via-purple-900 to-pink-800' 
            : 'bg-gradient-to-tr from-sky-400 via-indigo-200 to-pink-200'
        }`}
      />
      <div 
        id="bg-bloom-2"
        className={`absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vh] rounded-full blur-[160px] opacity-35 mix-blend-screen transition-all duration-1000 ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900 via-purple-950 to-indigo-950' 
            : 'bg-gradient-to-br from-purple-100 via-sky-200 to-emerald-100'
        }`}
      />
      <div 
        id="bg-bloom-3"
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] rounded-full blur-[120px] opacity-25 mix-blend-color-dodge transition-all duration-1000 ${
          darkMode ? 'bg-blue-600' : 'bg-pink-300'
        }`}
      />

      {/* Decorative Grid Mesh overlay for windows grid aesthetics */}
      <div 
        id="bg-grid-mesh"
        className={`absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none ${
          darkMode ? 'bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.1)_1px,transparent_1px)]'
        } bg-[size:32px_32px]`}
      />
    </div>
  );
}
