import { Card } from '../ui/card';
import { 
  BarChart2, 
  CreditCard, 
  DollarSign, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const OverviewSection = () => {
  // This will be connected to real data later
  const stats = {
    balance: 24680.55,
    income: 12500.00,
    expenses: 8750.25,
    budgetProgress: 65
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Current Balance</p>
              <p className="text-2xl font-bold text-white">
                ${stats.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Monthly Income</p>
              <p className="text-2xl font-bold text-white">
                ${stats.income.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <ArrowDownRight className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Monthly Expenses</p>
              <p className="text-2xl font-bold text-white">
                ${stats.expenses.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <PiggyBank className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Budget Progress</p>
              <p className="text-2xl font-bold text-white">
                {stats.budgetProgress}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Income vs Expenses
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <BarChart2 className="h-16 w-16 text-slate-600" />
            <span className="text-slate-500 ml-2">Chart coming soon...</span>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Transaction {i}</p>
                    <p className="text-xs text-slate-400">Today, 2:30 PM</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-red-400">-$99.00</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;