import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Camera, 
  Sprout, 
  Activity, 
  History, 
  BookOpen, 
  TrendingUp, 
  ShoppingBag, 
  MessageSquare, 
  Bell, 
  User 
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export const DesktopSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: t('navHome'), icon: Home },
    { to: '/scan', label: t('navScan'), icon: Camera, highlight: true },
    { to: '/crops', label: t('navMyCrops'), icon: Sprout },
    { to: '/recovery', label: t('navRecovery'), icon: Activity },
    { to: '/history', label: t('navHistory'), icon: History },
    { to: '/guidance', label: t('navGuidance'), icon: BookOpen },
    { to: '/mandi', label: t('navMandi'), icon: TrendingUp },
    { to: '/store', label: t('navStore'), icon: ShoppingBag },
    { to: '/expert', label: t('navExpert'), icon: MessageSquare },
    { to: '/alerts', label: t('navAlerts'), icon: Bell },
    { to: '/profile', label: t('navProfile'), icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#D5DEE8] h-screen fixed left-0 top-0 z-50 overflow-y-auto shadow-xs">
      {/* Brand Header */}
      <div className="bg-[#0A2540] text-white">
        <div className="p-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xs shrink-0">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="KrushiScan" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                KrushiScan <span className="text-[#FF9933]">AI</span>
              </h1>
              <p className="text-[11px] text-slate-300 font-medium">
                Simple Technology.
              </p>
            </div>
          </NavLink>
        </div>

        {/* Signature Tri-color stripe under sidebar header */}
        <div className="h-1 w-full flex shrink-0" role="presentation" aria-hidden="true">
          <div className="h-full flex-1 bg-[#FF9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>
      </div>

      {/* Primary Navy Scan Action Button */}
      <div className="p-4">
        <NavLink
          to="/scan"
          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 bg-[#0A2540] hover:bg-[#071A2E] text-white rounded-2xl font-bold shadow-sm transition active:scale-98 border border-[#0A2540]"
        >
          <Camera className="w-5 h-5 text-white" />
          <span>{t('navScan')}</span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.highlight) return null; // rendered as top action
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#0A2540] text-white shadow-xs font-bold'
                    : 'text-[#5B6B7D] hover:text-[#0A2540] hover:bg-[#EEF3F8]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Status / Vidarbha Node */}
      <div className="p-4 border-t border-[#D5DEE8] bg-[#EEF3F8]/80">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name?.charAt(0) || 'श'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#0A2540] truncate">
              {user?.name || 'शेतकरी'}
            </p>
            <p className="text-[10px] text-[#5B6B7D] font-medium truncate">
              {user?.district || 'यवतमाळ, विदर्भ'}
            </p>
          </div>
        </div>


      </div>
    </aside>
  );
};
