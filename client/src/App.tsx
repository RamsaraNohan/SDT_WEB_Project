import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Toaster from './components/Toaster';

// Role-based protected route — redirects to the correct dashboard shell
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (roles && !roles.some(role => user?.roles.includes(role))) {
    return <RoleRedirect />;
  }
  return <>{children}</>;
};

// Dynamically redirect to the correct role dashboard
const RoleRedirect = () => {
  const { user } = useAuthStore();
  if (user?.roles.includes('Admin') || user?.roles.includes('ModuleLeader')) {
    return <Navigate to="/admin" replace />;
  }
  if (user?.roles.includes('Supervisor')) {
    return <Navigate to="/supervisor" replace />;
  }
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <Router>
      <Toaster />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute roles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Supervisor Routes */}
          <Route
            path="/supervisor/*"
            element={
              <ProtectedRoute roles={['Supervisor']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin / Module Leader Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['Admin', 'ModuleLeader']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Legacy /dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
