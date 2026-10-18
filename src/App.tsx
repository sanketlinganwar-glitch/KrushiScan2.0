import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';

import { Layout } from './components/layout/Layout';
import { PageSkeleton } from './components/ui/PageSkeleton';

// Code-split route components via React.lazy() to reduce initial bundle size and boost rural 3G/4G load speed
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Scan = lazy(() => import('./pages/Scan').then(m => ({ default: m.Scan })));
const MyCrops = lazy(() => import('./pages/MyCrops').then(m => ({ default: m.MyCrops })));
const RecoveryTracker = lazy(() => import('./pages/RecoveryTracker').then(m => ({ default: m.RecoveryTracker })));
const ScanHistory = lazy(() => import('./pages/ScanHistory').then(m => ({ default: m.ScanHistory })));
const Guidance = lazy(() => import('./pages/Guidance').then(m => ({ default: m.Guidance })));
const TankMix = lazy(() => import('./pages/TankMix').then(m => ({ default: m.TankMix })));
const PestScouting = lazy(() => import('./pages/PestScouting').then(m => ({ default: m.PestScouting })));
const SoilHealth = lazy(() => import('./pages/SoilHealth').then(m => ({ default: m.SoilHealth })));
const WeatherAdvisor = lazy(() => import('./pages/WeatherAdvisor'));
const MandiRates = lazy(() => import('./pages/MandiRates').then(m => ({ default: m.MandiRates })));
const AgriStore = lazy(() => import('./pages/AgriStore').then(m => ({ default: m.AgriStore })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const ExpertSupport = lazy(() => import('./pages/ExpertSupport').then(m => ({ default: m.ExpertSupport })));
const Alerts = lazy(() => import('./pages/Alerts').then(m => ({ default: m.Alerts })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));

// Mandatory Legal & Compliance Pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsConditions = lazy(() => import('./pages/TermsConditions').then(m => ({ default: m.TermsConditions })));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy').then(m => ({ default: m.CookiePolicy })));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy').then(m => ({ default: m.RefundPolicy })));

// Standalone Auth Routes
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));

// Resilient basename detector: accurately handles GitHub Pages subpath (/KrushiScan2.0),
// Vercel/Netlify root (/), and local preview environments without blank screens.
const getRouterBasename = (): string => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/KrushiScan2.0')) {
    return '/KrushiScan2.0';
  }
  const base = import.meta.env.BASE_URL;
  if (base && base.startsWith('/') && base !== '/KrushiScan2.0/') {
    return base;
  }
  return '/';
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter basename={getRouterBasename()}>
              <Routes>
                {/* Main Dashboard Layout with Sidebar and BottomNav */}
                <Route element={<Layout />}>
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <Home />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/scan"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <Scan />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/crops"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <MyCrops />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/recovery"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <RecoveryTracker />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <ScanHistory />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/guidance"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <Guidance />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/tank-mix"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <TankMix />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/scouting"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <PestScouting />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/soil"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <SoilHealth />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/weather"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <WeatherAdvisor />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/mandi"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <MandiRates />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/store"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <AgriStore />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <Checkout />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <Orders />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/expert"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <ExpertSupport />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/alerts"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <Alerts />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <Profile />
                      </Suspense>
                    }
                  />

                  {/* Mandatory Legal & Compliance Pages */}
                  <Route
                    path="/privacy"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <PrivacyPolicy />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/terms"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <TermsConditions />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/cookies"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <CookiePolicy />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/refund-policy"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <RefundPolicy />
                      </Suspense>
                    }
                  />
                </Route>

                {/* Standalone Auth Routes with full-screen skeleton */}
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<PageSkeleton isFullScreen />}>
                      <Login />
                    </Suspense>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <Suspense fallback={<PageSkeleton isFullScreen />}>
                      <Signup />
                    </Suspense>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <Suspense fallback={<PageSkeleton isFullScreen />}>
                      <ForgotPassword />
                    </Suspense>
                  }
                />

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
