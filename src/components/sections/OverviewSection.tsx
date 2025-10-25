import { Card } from '../ui/card';
import { 
  BarChart2, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';

const OverviewSection = () => {
  const { getStats, getFilteredTransactions } = useTransactionStore();
  
  const stats = getStats();
  const recentTransactions = getFilteredTransactions().slice(0, 3);
  
  // Calculate current balance (net amount)
  const currentBalance = stats.netAmount;

  return (
    <div className="space-y-6">
      {/* Financial Overview - Top Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Current Balance</p>
              <p className={`text-2xl font-bold ${
                currentBalance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${currentBalance.toLocaleString()}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Net Worth</span>
                  <span className={currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {currentBalance >= 0 ? '+' : ''}${currentBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Savings Rate</span>
                  <span className="text-blue-400">
                    {stats.totalIncome > 0 ? ((currentBalance / stats.totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Total Income</p>
              <p className="text-2xl font-bold text-green-400">
                ${stats.totalIncome.toLocaleString()}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>This Month</span>
                  <span className="text-green-400">
                    ${stats.totalIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Avg Daily</span>
                  <span className="text-green-400">
                    ${(stats.totalIncome / 30).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Transactions</span>
                  <span className="text-white">
                    {recentTransactions.filter(t => t.type === 'income').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <ArrowDownRight className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400">
                ${stats.totalExpenses.toLocaleString()}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>This Month</span>
                  <span className="text-red-400">
                    ${stats.totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Avg Daily</span>
                  <span className="text-red-400">
                    ${(stats.totalExpenses / 30).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Transactions</span>
                  <span className="text-white">
                    {recentTransactions.filter(t => t.type === 'expense').length}
                  </span>
                </div>
              </div>
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
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{transaction.description}</p>
                      <p className="text-xs text-slate-400">
                        {transaction.date.toLocaleDateString()} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">No recent transactions</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;