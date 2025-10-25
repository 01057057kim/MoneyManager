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
import AuthProvider from './components/AuthProvider';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { TransactionsSection } from './components/sections/TransactionsSection';
import BudgetsSection from './components/sections/BudgetsSection';
import RecurringSection from './components/sections/RecurringSection';
import CategoriesSection from './components/sections/CategoriesSection';
import ReportsSection from './components/sections/ReportsSection';
import ClientsSection from './components/sections/ClientsSection';
import ProjectsSection from './components/sections/ProjectsSection';
import InvoicesSection from './components/sections/InvoicesSection';
import TasksSection from './components/sections/TasksSection';
import CalendarSection from './components/sections/CalendarSection';
import FinancialGoalsSection from './components/sections/FinancialGoalsSection';
import DocumentsSection from './components/sections/DocumentsSection';
import SettingsSection from './components/sections/SettingsSection';

export default function App() {
  return (
    <AuthProvider>
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
                <BudgetsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recurring"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RecurringSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CategoriesSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReportsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TasksSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CalendarSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FinancialGoalsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DocumentsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ClientsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectsSection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <InvoicesSection />
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
    </AuthProvider>
  );
}
