import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { 
  Target, 
  Plus, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  PiggyBank,
  BarChart3
} from 'lucide-react';
import { useGroupStore } from '../../store/groupStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useFinancialGoalStore } from '../../store/financialGoalStore';

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'savings' | 'debt' | 'investment' | 'emergency' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const FinancialGoalsSection = () => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { activeGroup } = useGroupStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { goals, loading, error, fetchGoals, createGoal, updateGoal, deleteGoal, updateProgress } = useFinancialGoalStore();

  // Fetch categories and goals when component mounts
  useEffect(() => {
    if (activeGroup) {
      fetchCategories(activeGroup.id);
      fetchGoals(activeGroup.id);
    }
  }, [activeGroup, fetchCategories, fetchGoals]);

  // Mock data for demonstration (fallback)
  useEffect(() => {
    if (!activeGroup || goals.length > 0) return;
    
    const mockGoals: FinancialGoal[] = [
      {
        id: '1',
        title: 'Emergency Fund',
        description: 'Build a 6-month emergency fund',
        targetAmount: 15000,
        currentAmount: 8500,
        targetDate: '2024-12-31',
        category: 'emergency',
        priority: 'high',
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Vacation Fund',
        description: 'Save for a family vacation to Europe',
        targetAmount: 5000,
        currentAmount: 3200,
        targetDate: '2024-06-30',
        category: 'savings',
        priority: 'medium',
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      },
      {
        id: '3',
        title: 'Pay Off Credit Card',
        description: 'Eliminate credit card debt',
        targetAmount: 3000,
        currentAmount: 3000,
        targetDate: '2024-03-31',
        category: 'debt',
        priority: 'urgent',
        status: 'completed',
        createdAt: '2024-01-01',
        updatedAt: '2024-03-31'
      }
    ];
    // Only set mock data if no real data is available
    if (goals.length === 0) {
      // This would be handled by the store in a real implementation
      console.log('Using mock data for demonstration');
    }
  }, [goals.length]);

  const filteredGoals = goals.filter(goal => {
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const getProgressPercentage = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'paused': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled': return <X className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return <PiggyBank className="h-4 w-4 text-green-500" />;
      case 'debt': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'investment': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'emergency': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const GoalCard = ({ goal }: { goal: FinancialGoal }) => {
    const progress = getProgressPercentage(goal);
    const daysRemaining = getDaysRemaining(goal.targetDate);
    const isOverdue = daysRemaining < 0 && goal.status === 'active';
    
    return (
      <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(goal.category)}
              <h3 className="font-medium text-white">{goal.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                goal.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                goal.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                goal.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {goal.priority}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {getStatusIcon(goal.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingGoal(goal);
                  setShowGoalModal(true);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this goal?')) {
                    try {
                      await deleteGoal(goal.id);
                    } catch (error) {
                      console.error('Failed to delete goal:', error);
                      alert('Failed to delete goal. Please try again.');
                    }
                  }
                }}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-slate-300 mb-3">{goal.description}</p>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>${goal.currentAmount.toLocaleString()}</span>
                <span>${goal.targetAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span className={isOverdue ? 'text-red-400' : ''}>
                    {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
                     daysRemaining === 0 ? 'Due today' : 
                     `${daysRemaining} days left`}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${(goal.targetAmount - goal.currentAmount).toLocaleString()} to go</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const GoalModal = () => {
    const isEditing = !!editingGoal;
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const goalData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        targetAmount: parseFloat(formData.get('targetAmount') as string),
        currentAmount: parseFloat(formData.get('currentAmount') as string),
        targetDate: formData.get('targetDate') as string,
        category: formData.get('category') as string,
        priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
        group: activeGroup?.id || '',
        createdBy: 'current-user-id', // This should come from auth store
        status: 'active' as const
      };
      
      try {
        if (isEditing && editingGoal) {
          await updateGoal(editingGoal.id, goalData);
        } else {
          await createGoal(goalData);
        }
        
        setShowGoalModal(false);
        setEditingGoal(null);
      } catch (error) {
        console.error('Failed to save goal:', error);
        alert('Failed to save goal. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditing ? 'Edit Goal' : 'Create New Goal'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={editingGoal?.title || ''}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={editingGoal?.description || ''}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAmount" className="text-white">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      name="targetAmount"
                      type="number"
                      required
                      defaultValue={editingGoal?.targetAmount || ''}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentAmount" className="text-white">Current Amount</Label>
                    <Input
                      id="currentAmount"
                      name="currentAmount"
                      type="number"
                      defaultValue={editingGoal?.currentAmount || 0}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="targetDate" className="text-white">Target Date</Label>
                  <Input
                    id="targetDate"
                    name="targetDate"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    defaultValue={editingGoal?.targetDate || new Date().toISOString().split('T')[0]}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-white">Category</Label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={editingGoal?.category || ''}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority" className="text-white">Priority</Label>
                    <select
                      id="priority"
                      name="priority"
                      defaultValue={editingGoal?.priority || 'medium'}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowGoalModal(false);
                      setEditingGoal(null);
                    }}
                    className="text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {isEditing ? 'Update Goal' : 'Create Goal'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Financial Goals</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowGoalModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">Total Goals</p>
                <p className="text-xl font-bold text-white">{goals.length}</p>
                <p className="text-xs text-slate-500">{activeGoals.length} active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-400">Total Target</p>
                <p className="text-xl font-bold text-white">${totalTargetAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">All goals combined</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-400">Current Amount</p>
                <p className="text-xl font-bold text-white">${totalCurrentAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">
                  {totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0}% of target
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-xl font-bold text-white">{completedGoals.length}</p>
                <p className="text-xs text-slate-500">
                  {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}% success rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No goals found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Goal Modal */}
      {showGoalModal && <GoalModal />}
    </div>
  );
};

export default FinancialGoalsSection;
