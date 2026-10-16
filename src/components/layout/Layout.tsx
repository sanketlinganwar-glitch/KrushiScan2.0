import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { VoiceAssistantModal } from '../voice/VoiceAssistantModal';
export const Layout: React.FC = () => {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-[#0A2540] flex flex-col font-sans">
      {/* Desktop Sidebar (Fixed left) */}
      <DesktopSidebar />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar onOpenVoiceAssistant={() => setIsVoiceOpen(true)} />



        {/* Main Routed Page Content */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* Voice AI Assistant Floating Trigger & Modal */}
        <VoiceAssistantModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
        />
      </div>
    </div>
  );
};
