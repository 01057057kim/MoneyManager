// src/App.tsx
// App.tsx;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import GroupDashboard from './pages/GroupDashboard';
import Groups from './pages/Groups';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { TransactionsSection } from './components/sections/TransactionsSection';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/group"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <GroupDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TransactionsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-white">Budgets Page (Coming Soon)</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-white">Tasks Page (Coming Soon)</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-white">Calendar Page (Coming Soon)</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-white">Clients Page (Coming Soon)</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Groups />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/new"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Groups />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-white">Settings Page (Coming Soon)</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
