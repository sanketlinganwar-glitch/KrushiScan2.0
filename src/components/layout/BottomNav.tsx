import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, Sprout, BookOpen, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#DDE8DC] px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition ${
              isActive ? 'text-[#0B5137] font-black' : 'text-[#5F7065] hover:text-[#0B5137]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 ${isActive ? 'text-[#2F9E59]' : ''}`} />
              <span className="text-[10px] leading-tight font-medium">{t('navHome')}</span>
            </>
          )}
        </NavLink>

        {/* 2. My Crops */}
        <NavLink
          to="/crops"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition ${
              isActive ? 'text-[#0B5137] font-black' : 'text-[#5F7065] hover:text-[#0B5137]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Sprout className={`w-5 h-5 ${isActive ? 'text-[#2F9E59]' : ''}`} />
              <span className="text-[10px] leading-tight font-medium">{t('navMyCrops')}</span>
            </>
          )}
        </NavLink>

        {/* 3. Center Big Forest Green SCAN button with Leaf Green highlight border */}
        <NavLink
          to="/scan"
          className="relative -top-3 flex flex-col items-center group transition"
          aria-label={t('navScan')}
        >
          <div className="w-14 h-14 rounded-full bg-[#0B5137] hover:bg-[#073D2A] text-white flex items-center justify-center shadow-md border-2 border-[#2F9E59] transition active:scale-95 group-hover:scale-105">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <span className="text-[11px] font-extrabold text-[#0B5137] mt-0.5 tracking-tight">
            {t('navScan')}
          </span>
        </NavLink>

        {/* 4. Guidance */}
        <NavLink
          to="/guidance"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition ${
              isActive ? 'text-[#0B5137] font-black' : 'text-[#5F7065] hover:text-[#0B5137]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <BookOpen className={`w-5 h-5 ${isActive ? 'text-[#2F9E59]' : ''}`} />
              <span className="text-[10px] leading-tight font-medium">{t('navGuidance')}</span>
            </>
          )}
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition ${
              isActive ? 'text-[#0B5137] font-black' : 'text-[#5F7065] hover:text-[#0B5137]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User className={`w-5 h-5 ${isActive ? 'text-[#2F9E59]' : ''}`} />
              <span className="text-[10px] leading-tight font-medium">{t('navProfile')}</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
