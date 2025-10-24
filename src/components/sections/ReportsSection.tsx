import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  Activity,
  Target,
  AlertTriangle
} from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useRecurringStore } from '../../store/recurringStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useGroupStore } from '../../store/groupStore';

interface ReportsSectionProps {}

const ReportsSection: React.FC<ReportsSectionProps> = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { activeGroup } = useGroupStore();
  const { 
    transactions,
    fetchTransactions
  } = useTransactionStore();
  
  const { 
    budgets, 
    fetchBudgets
  } = useBudgetStore();
  
  const { 
    fetchRecurringTransactions
  } = useRecurringStore();
  
  const { 
    fetchCategories
  } = useCategoryStore();

  useEffect(() => {
    const loadData = async () => {
      if (activeGroup) {
        try {
          await Promise.all([
            fetchTransactions(activeGroup.id),
            fetchBudgets(activeGroup.id),
            fetchRecurringTransactions(activeGroup.id),
            fetchCategories(activeGroup.id)
          ]);
        } catch (error) {
          console.error('Error loading reports data:', error);
        }
      }
    };
    loadData();
  }, [activeGroup, fetchTransactions, fetchBudgets, fetchRecurringTransactions, fetchCategories]);

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (dateRange) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now);
        start.setDate(now.getDate() - 30);
    }

    return { start, end };
  };

  const { start, end } = getDateRange();
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const inDateRange = transactionDate >= start && transactionDate <= end;
    const categoryMatch = !selectedCategory || transaction.category === selectedCategory;
    return inDateRange && categoryMatch;
  });

  
  // Calculate analytics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAmount = totalIncome - totalExpenses;

  // Category breakdown
  const categoryBreakdown = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { income: 0, expense: 0, count: 0 };
    }
    acc[category][transaction.type] += transaction.amount;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { income: number; expense: number; count: number }>);

  // Monthly spending trend
  const monthlyTrend = filteredTransactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    acc[month][transaction.type] += transaction.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Budget analysis
  const budgetAnalysis = budgets.map(budget => {
    const categoryTransactions = filteredTransactions.filter(t => t.category === budget.category);
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    const status = percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'critical' : percentage >= 75 ? 'warning' : 'safe';
    
    return {
      ...budget,
      spent,
      percentage,
      status,
      remaining: budget.limit - spent
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-400';
      case 'critical': return 'text-orange-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-slate-400">Comprehensive financial insights and trends</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            >
              <option value="">All Categories</option>
              {Object.keys(categoryBreakdown).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Income</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-full">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Expenses</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Net Amount</p>
              <p className={`text-lg font-semibold ${netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-full">
              <Activity className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Transactions</p>
              <p className="text-lg font-semibold text-white">{filteredTransactions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Budget Analysis</h3>
          <div className="space-y-4">
            {budgetAnalysis.map((budget) => (
              <div key={budget._id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">{budget.name}</span>
                  <span className={`text-sm ${getStatusColor(budget.status)}`}>
                    {budget.status.toUpperCase()}
                  </span>
                </div>
                <Progress value={budget.percentage} className="h-2" />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</span>
                  <span>{budget.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown)
              .sort(([,a], [,b]) => (b.income + b.expense) - (a.income + a.expense))
              .slice(0, 8)
              .map(([category, data]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-slate-300">{category}</span>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatCurrency(data.income + data.expense)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {data.count} transactions
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Spending Trend</h3>
        <div className="space-y-4">
          {Object.entries(monthlyTrend)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => (
              <div key={month} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">{month}</span>
                <div className="flex space-x-4">
                  <div className="text-green-400">
                    +{formatCurrency(data.income)}
                  </div>
                  <div className="text-red-400">
                    -{formatCurrency(data.expense)}
                  </div>
                  <div className={`font-medium ${data.income - data.expense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(data.income - data.expense)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Alerts and Insights */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Insights & Alerts</h3>
        <div className="space-y-3">
          {budgetAnalysis.filter(b => b.status === 'exceeded').map(budget => (
            <div key={budget._id} className="flex items-center space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Budget Exceeded</p>
                <p className="text-sm text-slate-400">
                  {budget.name} has exceeded its limit by {formatCurrency(Math.abs(budget.remaining))}
                </p>
              </div>
            </div>
          ))}
          
          {budgetAnalysis.filter(b => b.status === 'critical').map(budget => (
            <div key={budget._id} className="flex items-center space-x-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <Target className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-orange-400 font-medium">Budget Critical</p>
                <p className="text-sm text-slate-400">
                  {budget.name} is at {budget.percentage.toFixed(1)}% of its limit
                </p>
              </div>
            </div>
          ))}

          {netAmount < 0 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Negative Cash Flow</p>
                <p className="text-sm text-slate-400">
                  Expenses exceed income by {formatCurrency(Math.abs(netAmount))}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReportsSection;
