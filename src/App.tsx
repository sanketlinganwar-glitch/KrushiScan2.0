import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';

import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { MyCrops } from './pages/MyCrops';
import { RecoveryTracker } from './pages/RecoveryTracker';
import { ScanHistory } from './pages/ScanHistory';
import { Guidance } from './pages/Guidance';
import { MandiRates } from './pages/MandiRates';
import { AgriStore } from './pages/AgriStore';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { ExpertSupport } from './pages/ExpertSupport';
import { Alerts } from './pages/Alerts';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Routes>
                {/* Main Dashboard Layout with Sidebar and BottomNav */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/crops" element={<MyCrops />} />
                  <Route path="/recovery" element={<RecoveryTracker />} />
                  <Route path="/history" element={<ScanHistory />} />
                  <Route path="/guidance" element={<Guidance />} />
                  <Route path="/mandi" element={<MandiRates />} />
                  <Route path="/store" element={<AgriStore />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/expert" element={<ExpertSupport />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Standalone Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
