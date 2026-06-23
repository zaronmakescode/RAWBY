import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastViewport } from "./components/ui/ToastViewport";
import { Shell } from "./components/layout/Shell";
import { RequireAuth } from "./components/layout/RequireAuth";
import { useAuth } from "./store/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Prompts from "./pages/Prompts";
import Leaderboard from "./pages/Leaderboard";
import Gear from "./pages/Gear";
import IdeaBank from "./pages/IdeaBank";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";

// Root: visitors see the landing page; signed-in users go straight to the app.
function RootGate() {
  const token = useAuth((s) => s.token);
  return token ? <Navigate to="/home" replace /> : <Landing />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastViewport />
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
          <Route path="/gear" element={<Gear />} />
          <Route path="/idea-bank" element={<IdeaBank />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
