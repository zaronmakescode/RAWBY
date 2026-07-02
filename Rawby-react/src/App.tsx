import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastViewport } from "./components/ui/ToastViewport";
import { Spinner } from "./components/ui/Bits";
import { Shell } from "./components/layout/Shell";
import { RequireAuth } from "./components/layout/RequireAuth";
import { useAuth } from "./store/auth";
import { useSettings } from "./store/settings";

// Route-level code splitting — each page ships as its own chunk so the first
// paint only loads what it needs (three.js is already split separately).
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Prompts = lazy(() => import("./pages/Prompts"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Atlas = lazy(() => import("./pages/Atlas"));
const Gear = lazy(() => import("./pages/Gear"));
const IdeaBank = lazy(() => import("./pages/IdeaBank"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));

// Root: visitors see the landing page; signed-in users go straight to the app.
function RootGate() {
  const token = useAuth((s) => s.token);
  return token ? <Navigate to="/home" replace /> : <Landing />;
}

// SPA routing keeps scroll positions — reset to top on every page change.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

export default function App() {
  // "Reduce animations" damps framer-motion app-wide (on top of the OS setting).
  const reduceMotion = useSettings((s) => s.reduceMotion);
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <BrowserRouter>
        <ToastViewport />
        <ScrollToTop />
        <Suspense fallback={<PageFallback />}>
        <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/gear" element={<Gear />} />
          <Route path="/idea-bank" element={<IdeaBank />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}
