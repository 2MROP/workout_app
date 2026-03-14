import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';

// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail'));

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout" element={<WorkoutDetail />} />
      </Routes>
    </AnimatePresence>
  );
}

function Loader() {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin drop-shadow-[var(--shadow-glow)]"></div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Mobile-first centered container */}
      <div className="min-h-screen bg-[var(--color-background)] text-white selection:bg-[var(--color-primary-glow)]">
        <main className="mx-auto max-w-[420px] min-h-screen relative overflow-x-hidden">
          <Suspense fallback={<Loader />}>
            <AnimatedRoutes />
          </Suspense>
          <Navigation />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
