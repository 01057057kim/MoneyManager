// GroupDashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  BarChart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useGroupStore } from '../store/groupStore';

const GroupDashboard = () => {
  const { activeGroup } = useGroupStore();

  // Placeholder data - will be replaced with real data
  const stats = {
    totalBalance: 12500.00,
    monthlyIncome: 4500.00,
    monthlyExpenses: 3200.00,
    remainingBudget: 1300.00
  };

  const upcomingDeadlines = [
    { id: 1, title: 'Rent Payment', date: '2025-10-25', amount: 1200 },
    { id: 2, title: 'Utility Bills', date: '2025-10-28', amount: 150 },
    { id: 3, title: 'Team Meeting', date: '2025-10-22', type: 'event' }
  ];

  if (!activeGroup) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-300">Please select a group to view its dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {activeGroup.name} Dashboard
        </h1>
        <p className="text-slate-300">
          Here's an overview of your financial status and upcoming events
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeGroup.currency} {stats.totalBalance.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Current group balance
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Monthly Income
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeGroup.currency} {stats.monthlyIncome.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Total income this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Monthly Expenses
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeGroup.currency} {stats.monthlyExpenses.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Total expenses this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Budget Remaining
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeGroup.currency} {stats.remainingBudget.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Left to spend this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.type === 'event' ? (
                      <Calendar className="h-5 w-5 text-blue-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.date}</p>
                    </div>
                  </div>
                  {item.amount && (
                    <span className="text-sm font-medium text-white">
                      {activeGroup.currency} {item.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Overview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px]">
              <BarChart className="h-16 w-16 text-slate-500" />
              <p className="text-sm text-slate-400">Chart will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupDashboard;