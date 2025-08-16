import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { QuestionScreen } from './components/QuestionScreen';
import { MappingScreen } from './components/MappingScreen';
import { RevealScreen } from './components/RevealScreen';
import { Dashboard } from './components/Dashboard';
import { AdvancedSimulation } from './components/AdvancedSimulation';
import { Settings } from './components/Settings';
import { Reports } from './components/Reports';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import { useFinanceStore } from './stores/financeStore';
import './styles/globals.css';
import { Profile } from './components/Profile';
import { Library } from './components/Library';
import { Lessons } from './components/Lessons';
import { Feedback } from './components/Feedback';
import { FinancialSimulator } from './components/FinancialSimulator';
import { EmotionalJournal } from './components/EmotionalJournal';
import { HiddenFeesDetector } from './components/HiddenFeesDetector';
// Désactiver les restrictions premium globalement
if (window) {
  window.PREMIUM_ENABLED = true;
  window.DISABLE_PREMIUM_RESTRICTIONS = true;
}
export function App() {
  const {
    hasCompletedOnboarding
  } = useFinanceStore();
  return <ThemeProvider>
      <FinanceProvider>
        <BrowserRouter>
          <Layout>
            <AnimatePresence mode="wait" initial={false}>
              <Routes>
                <Route path="/" element={hasCompletedOnboarding ? <Dashboard /> : <QuestionScreen />} />
                <Route path="/question" element={<QuestionScreen />} />
                <Route path="/mapping" element={<MappingScreen />} />
                <Route path="/reveal" element={<RevealScreen />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/simulation" element={<AdvancedSimulation />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/library" element={<Library />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/financial-simulator" element={<FinancialSimulator />} />
                <Route path="/emotional-journal" element={<EmotionalJournal />} />
                <Route path="/hidden-fees" element={<HiddenFeesDetector />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </BrowserRouter>
      </FinanceProvider>
    </ThemeProvider>;
}