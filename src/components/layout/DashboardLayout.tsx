import React from 'react';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './Sidebar';
import { DollarSign } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm z-50">
        <div className="px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">Money Manager</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-300">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};