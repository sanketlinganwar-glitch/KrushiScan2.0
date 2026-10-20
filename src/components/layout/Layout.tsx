import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { Footer } from './Footer';
import { CookieConsentBanner } from '../common/CookieConsentBanner';
import { OnlineStatusBanner } from '../common/OnlineStatusBanner';
import { VoiceAssistantModal } from '../voice/VoiceAssistantModal';
import { VoiceFloatingButton } from '../voice/VoiceFloatingButton';

export const Layout: React.FC = () => {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCookiePreferencesOpen, setIsCookiePreferencesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8F0] text-[#152D24] flex flex-col font-sans">
      {/* Desktop Sidebar (Fixed left) */}
      <DesktopSidebar />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Offline / Connectivity Notification Banner */}
        <OnlineStatusBanner />

        {/* Top Navbar */}
        <Navbar onOpenVoiceAssistant={() => setIsVoiceOpen(true)} />

        {/* Main Routed Page Content */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-10">
          <Outlet />
        </main>

        {/* Floating Voice Assistant Trigger (Omnipresent for farmers) */}
        <VoiceFloatingButton
          isOpen={isVoiceOpen}
          onClick={() => setIsVoiceOpen(true)}
        />

        {/* Site-wide Compliance & Corporate Information Footer */}
        <Footer onOpenCookiePreferences={() => setIsCookiePreferencesOpen(true)} />

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* Cookie Consent Banner */}
        <CookieConsentBanner
          forceOpen={isCookiePreferencesOpen}
          onClose={() => setIsCookiePreferencesOpen(false)}
        />

        {/* Voice AI Assistant Modal */}
        <VoiceAssistantModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
        />
      </div>
    </div>
  );
};
