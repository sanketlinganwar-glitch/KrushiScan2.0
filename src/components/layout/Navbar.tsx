import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  MapPin, 
  Globe, 
  ShoppingCart, 
  Mic,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useCart } from '../../contexts/CartContext';
import { subscribeToOnlineStatus } from '../../lib/pwa';

interface NavbarProps {
  onOpenVoiceAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoiceAssistant }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();
  const { itemCount } = useCart();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    return subscribeToOnlineStatus((online) => setIsOnline(online));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 17) return t('greetingAfternoon');
    return t('greetingEvening');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B5137] text-white shadow-md">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          {/* Left: Mobile Brand & Greeting */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xs shrink-0 backdrop-blur-xs">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="KrushiScan" className="w-8 h-8" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    KrushiScan <span className="text-[#2F9E59]">AI</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium line-clamp-1">
                  {t('tagline')}
                </p>
              </div>
            </Link>

            {/* Location badge on mobile/tablet */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#073D2A] text-xs text-slate-200 border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-[#2F9E59] shrink-0" />
              <span className="font-semibold text-white">
                {user?.district || t('farmerLocationDefault')}
              </span>
            </div>
          </div>

          {/* Center / Right: Farmer Info & Interactive Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline Mode Indicator */}
            {!isOnline && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold animate-pulse">
                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">ऑफलाइन मोड (Offline)</span>
                <span className="sm:hidden">ऑफलाइन</span>
              </span>
            )}

            {/* Voice Assistant quick launcher button */}
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#073D2A] hover:bg-[#05291c] text-white border border-white/20 transition shadow-xs group font-semibold"
              title="बोलून प्रश्न विचारा (Voice AI)"
              aria-label="बोलून प्रश्न विचारा (Voice AI)"
            >
              <Mic className="w-4 h-4 text-[#2F9E59] group-hover:text-white animate-pulse" aria-hidden="true" />
              <span className="text-xs hidden sm:inline">
                {t('navVoiceAssistant')}
              </span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#073D2A] hover:bg-[#05291c] border border-white/20 text-white text-xs font-bold transition"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#2F9E59]" />
                <span>{language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिंदी' : 'EN'}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-[#DDE8DC] rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in text-[#152D24]">
                  <button
                    onClick={() => { setLanguage('mr'); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#E6F2E5] transition flex items-center justify-between ${language === 'mr' ? 'text-[#0B5137] font-bold bg-[#E6F2E5]' : 'text-[#5F7065]'}`}
                  >
                    <span>मराठी (Vidarbha)</span>
                    {language === 'mr' && <span className="w-2 h-2 rounded-full bg-[#2F9E59]" />}
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#E6F2E5] transition flex items-center justify-between ${language === 'hi' ? 'text-[#0B5137] font-bold bg-[#E6F2E5]' : 'text-[#5F7065]'}`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <span className="w-2 h-2 rounded-full bg-[#2F9E59]" />}
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#E6F2E5] transition flex items-center justify-between ${language === 'en' ? 'text-[#0B5137] font-bold bg-[#E6F2E5]' : 'text-[#5F7065]'}`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="w-2 h-2 rounded-full bg-[#2F9E59]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              to="/store"
              className="relative p-2.5 rounded-xl bg-[#073D2A] hover:bg-[#05291c] text-white border border-white/20 transition"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2F9E59] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            <Link
              to="/alerts"
              className="relative p-2.5 rounded-xl bg-[#073D2A] hover:bg-[#05291c] text-white border border-white/20 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C83E3E] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Farmer Profile Avatar & Greeting */}
            <Link
              to="/profile"
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-2xl bg-[#073D2A] hover:bg-[#05291c] border border-white/20 transition"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Farmer'}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[#2F9E59]/60"
              />
              <div className="hidden xl:block text-left">
                <p className="text-[10px] text-slate-300 font-medium leading-none">
                  {getGreeting()}
                </p>
                <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {user?.name?.split(' ')[0] || 'शेतकरी'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Signature Detail: Thin Krushi Green Tri-band Stripe Under Header */}
      <div className="h-1 w-full flex shrink-0" role="presentation" aria-hidden="true">
        <div className="h-full flex-1 bg-[#0B5137]" />
        <div className="h-full flex-1 bg-[#2F9E59]" />
        <div className="h-full flex-1 bg-[#E6F2E5]" />
      </div>
    </header>
  );
};
