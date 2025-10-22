import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { PiggyBank, Plus, TrendingUp, ArrowRight } from 'lucide-react';

// Temporary type definitions
interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  progress: number;
}

const BudgetsSection = () => {
  // Temporary data - will be replaced with API calls
  const budgets: Budget[] = [
    {
      id: '1',
      category: 'Office Supplies',
      allocated: 1000,
      spent: 650,
      remaining: 350,
      progress: 65
    },
    {
      id: '2',
      category: 'Marketing',
      allocated: 2000,
      spent: 1800,
      remaining: 200,
      progress: 90
    },
    {
      id: '3',
      category: 'Software',
      allocated: 500,
      spent: 200,
      remaining: 300,
      progress: 40
    }
  ];

  const stats = {
    totalBudget: 5000,
    totalSpent: 3000,
    remainingBudget: 2000,
    overallProgress: 60
  };

  return (
    <div className="space-y-6">
      {/* Overall Budget Status */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Budget Overview
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Total Budget</span>
                  <span className="text-white font-medium">
                    ${stats.totalBudget.toLocaleString()}
                  </span>
                </div>
                <Progress value={stats.overallProgress} className="h-2" />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-green-400">
                    ${stats.totalSpent.toLocaleString()} spent
                  </span>
                  <span className="text-blue-400">
                    ${stats.remainingBudget.toLocaleString()} remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">On Track</p>
                  <p className="text-lg font-semibold text-white">4</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Over Budget</p>
                  <p className="text-lg font-semibold text-white">2</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Budget Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Budget Categories
          </h3>
          <Button className="text-sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Budget
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <Card 
              key={budget.id} 
              className="p-4 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <PiggyBank className="h-5 w-5 text-blue-400" />
                  <h4 className="font-medium text-white">{budget.category}</h4>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <Progress value={budget.progress} className="h-2 mb-3" />

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-slate-400">Allocated</p>
                  <p className="font-medium text-white">
                    ${budget.allocated.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Spent</p>
                  <p className="font-medium text-green-400">
                    ${budget.spent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Remaining</p>
                  <p className="font-medium text-blue-400">
                    ${budget.remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetsSection;