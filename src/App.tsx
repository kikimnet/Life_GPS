import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Vision } from './pages/Vision';
import { Objectifs } from './pages/Objectifs';
import { PlansActions } from './pages/PlansActions';
import { PlansTrimestriels } from './pages/PlansTrimestriels';
import { Systemes } from './pages/Systemes';
import { DeepWork } from './pages/DeepWork';
import { Suivi } from './pages/Suivi';
import { Pomodoro } from './pages/Pomodoro';
import { FocusSemaine } from './pages/FocusSemaine';
import { Respiration } from './pages/Respiration';
import { RevueHebdo } from './pages/RevueHebdo';
import { RevueMensuelle } from './pages/RevueMensuelle';
import { Journal } from './pages/Journal';
import { Parametres } from './pages/Parametres';
import { Login } from './pages/auth/Login';
import { Pricing } from './pages/Pricing';
import { PlanGate } from './components/PlanGate';
import { initAnalytics } from './lib/analytics';
import { useEffect } from 'react';

// ─── Auth guard: redirect to /login if not authenticated ─────────────────────
const RequireAuth = () => {
  const { user, loading, isDemo } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0e0e10',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', margin: '0 auto 16px',
            animation: 'pulse 1.5s ease infinite',
          }}>🧭</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Chargement de LifeGPS...</div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  if (!user && !isDemo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// ─── App shell layout (sidebar + main) ───────────────────────────────────────
const AppLayout = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) initAnalytics(user.id);
  }, [user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e0e10', color: '#e5e7eb', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* ── Protected routes ── */}
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="vision" element={<Vision />} />
                <Route path="objectifs" element={<Objectifs />} />
                <Route path="plans" element={<PlansActions />} />
                <Route path="trimestriels" element={<PlansTrimestriels />} />
                <Route path="systemes" element={<Systemes />} />
                <Route path="deepwork" element={<DeepWork />} />
                <Route path="suivi" element={<Suivi />} />
                <Route path="respiration" element={<Respiration />} />

                {/* ── Pro-gated routes ── */}
                <Route path="pomodoro" element={
                  <PlanGate requiredPlan="pro"><Pomodoro /></PlanGate>
                } />
                <Route path="focus-semaine" element={
                  <PlanGate requiredPlan="pro"><FocusSemaine /></PlanGate>
                } />
                <Route path="revue-hebdo" element={
                  <PlanGate requiredPlan="pro"><RevueHebdo /></PlanGate>
                } />
                <Route path="revue-mensuelle" element={
                  <PlanGate requiredPlan="pro"><RevueMensuelle /></PlanGate>
                } />
                <Route path="journal" element={
                  <PlanGate requiredPlan="pro"><Journal /></PlanGate>
                } />

                <Route path="parametres" element={<Parametres />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
