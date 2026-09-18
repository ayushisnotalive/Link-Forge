import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import RedirectPage from "./pages/RedirectPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthReady } = useAuth();
  if (!isAuthReady) return (
    <div className="flex min-h-screen items-center justify-center bg-black p-8 font-mono text-sm text-zinc-400 gap-3">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      Loading...
    </div>
  );
  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/analytics/:code" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/:code" element={<RedirectPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}