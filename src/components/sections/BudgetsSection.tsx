import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { PiggyBank, Plus, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { useBudgetStore } from '../../store/budgetStore';
import { useGroupStore } from '../../store/groupStore';
import { BudgetModal } from '../modals/BudgetModal';
import type { Budget } from '../../store/budgetStore';

const BudgetsSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const { activeGroup } = useGroupStore();
  const { 
    budgets,
    isLoading,
    fetchBudgets,
    deleteBudget
  } = useBudgetStore();

  useEffect(() => {
    const loadBudgets = async () => {
      if (activeGroup) {
        try {
          await fetchBudgets(activeGroup.id);
        } catch (error) {
          console.error('Error loading budgets:', error);
        }
      }
    };
    loadBudgets();
  }, [activeGroup, fetchBudgets]);

  const handleCreateBudget = () => {
    setSelectedBudget(undefined);
    setShowModal(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowModal(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        toast.success('Budget deleted successfully');
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const handleSaveBudget = async () => {
    // Modal already handles create/update, just close and refresh
    setShowModal(false);
    setSelectedBudget(undefined);
    
    // Show success message
    toast.success(selectedBudget ? 'Budget updated successfully' : 'Budget created successfully');
    
    // Refresh budgets list
    if (activeGroup) {
      await fetchBudgets(activeGroup.id);
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && budget.isActive) ||
      (filter === 'inactive' && !budget.isActive);
    
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalBudget: budgets.reduce((sum, budget) => sum + budget.limit, 0),
    totalSpent: budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0),
    remainingBudget: budgets.reduce((sum, budget) => sum + (budget.remaining || 0), 0),
    overallProgress: budgets.length > 0 ? 
      (budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0) / 
       budgets.reduce((sum, budget) => sum + budget.limit, 0)) * 100 : 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (budget: Budget) => {
    if (!budget.status) return 'text-slate-400';
    
    switch (budget.status) {
      case 'exceeded': return 'text-red-400';
      case 'critical': return 'text-orange-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getStatusText = (budget: Budget) => {
    if (!budget.status) return 'No Data';
    
    switch (budget.status) {
      case 'exceeded': return 'Over Budget';
      case 'critical': return 'Critical';
      case 'warning': return 'Warning';
      default: return 'On Track';
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Budgets</h2>
          <p className="text-slate-400">Track your spending against budget limits</p>
        </div>
        <Button onClick={handleCreateBudget} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

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
                    {formatCurrency(stats.totalBudget)}
                  </span>
                </div>
                <Progress value={stats.overallProgress} className="h-2" />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-green-400">
                    {formatCurrency(stats.totalSpent)} spent
                  </span>
                  <span className="text-blue-400">
                    {formatCurrency(stats.remainingBudget)} remaining
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
                  <p className="text-lg font-semibold text-white">
                    {budgets.filter(b => b.status === 'safe').length}
                  </p>
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
                  <p className="text-lg font-semibold text-white">
                    {budgets.filter(b => b.status === 'exceeded').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilter('inactive')}
            size="sm"
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Budget Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Budget Categories
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400 py-8">
            Loading budgets...
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            No budgets found
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBudgets.map((budget) => (
              <Card 
                key={budget._id} 
                className="p-4 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <PiggyBank className="h-5 w-5 text-blue-400" />
                    <h4 className="font-medium text-white">{budget.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditBudget(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteBudget(budget._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white">{budget.category}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Period</span>
                    <span className="text-white capitalize">{budget.period}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Status</span>
                    <span className={`text-sm ${getStatusColor(budget)}`}>
                      {getStatusText(budget)}
                    </span>
                  </div>
                </div>

                <Progress 
                  value={budget.percentageUsed || 0} 
                  className="h-2 mb-3" 
                />

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">Limit</p>
                    <p className="font-medium text-white">
                      {formatCurrency(budget.limit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Spent</p>
                    <p className="font-medium text-green-400">
                      {formatCurrency(budget.spent || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Remaining</p>
                    <p className="font-medium text-blue-400">
                      {formatCurrency(budget.remaining || 0)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <BudgetModal
          budget={selectedBudget}
          onSave={handleSaveBudget}
          onCancel={() => {
            setShowModal(false);
            setSelectedBudget(undefined);
          }}
        />
      )}
    </div>
  );
};

export default BudgetsSection;