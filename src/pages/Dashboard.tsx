import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { useBudgetStore } from '../store/budgetStore';
import { useRecurringStore } from '../store/recurringStore';
import { useCategoryStore } from '../store/categoryStore';
import { useClientStore } from '../store/clientStore';
import { useProjectStore } from '../store/projectStore';
import { useInvoiceStore } from '../store/invoiceStore';
import { useTaskStore } from '../store/taskStore';
import { useFinancialGoalStore } from '../store/financialGoalStore';
import OverviewSection from '../components/sections/OverviewSection';
import GroupsSection from '../components/sections/GroupsSection';
import { TransactionsSection } from '../components/sections/TransactionsSection';
import BudgetsSection from '../components/sections/BudgetsSection';
import RecurringSection from '../components/sections/RecurringSection';
import CategoriesSection from '../components/sections/CategoriesSection';
import ReportsSection from '../components/sections/ReportsSection';
import ClientsSection from '../components/sections/ClientsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import InvoicesSection from '../components/sections/InvoicesSection';
import TasksSection from '../components/sections/TasksSection';
import CalendarSection from '../components/sections/CalendarSection';
import FinancialGoalsSection from '../components/sections/FinancialGoalsSection';
import DocumentsSection from '../components/sections/DocumentsSection';
import SettingsSection from '../components/sections/SettingsSection';
import { 
  Plus, 
  Key, 
  Building2, 
  Loader2,
  DollarSign,
  Target,
  AlertTriangle,
  Calendar,
  BarChart3,
  PiggyBank,
  Repeat,
  CheckSquare,
  Users,
  FileText,
  Briefcase,
  FolderOpen,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [createForm, setCreateForm] = useState({
    name: '',
    currency: 'USD',
    taxRate: 0
  });
  const [joinForm, setJoinForm] = useState({
    inviteKey: ''
  });

  const { user } = useAuthStore();
  const { groups, activeGroup, isLoading, fetchGroups, createGroup, joinGroup } = useGroupStore();
  
  // Finance data stores
  const { 
    transactions, 
    fetchTransactions 
  } = useTransactionStore();
  
  const { 
    budgets, 
    fetchBudgets 
  } = useBudgetStore();
  
  const { 
    recurringTransactions, 
    dueTransactions, 
    fetchRecurringTransactions, 
    fetchDueTransactions 
  } = useRecurringStore();
  
  const { 
    categories, 
    fetchCategories 
  } = useCategoryStore();

  // Planning data stores
  const { 
    fetchClients 
  } = useClientStore();
  
  const { 
    fetchProjects 
  } = useProjectStore();
  
  const { 
    fetchInvoices 
  } = useInvoiceStore();

  // Planning data stores
  const { 
    tasks,
    fetchTasks,
    getTasksByStatus,
    getOverdueTasks
  } = useTaskStore();

  const { 
    goals,
    fetchGoals
  } = useFinancialGoalStore();

  useEffect(() => {
    // Only fetch groups if we don't have any groups yet
    if (groups.length === 0) {
      console.log('Dashboard - Fetching groups (no groups loaded yet)');
      fetchGroups();
    } else {
      console.log('Dashboard - Groups already loaded, skipping fetch');
    }
  }, []); // fetchGroups is stable, no need to include in deps

  // Load finance data when active group changes
  useEffect(() => {
    const loadFinanceData = async () => {
      if (activeGroup) {
        console.log('Dashboard - Loading data for active group:', activeGroup.name, activeGroup.id);
        try {
          // Load core finance data first
          await Promise.all([
            fetchTransactions(activeGroup.id),
            fetchBudgets(activeGroup.id),
            fetchRecurringTransactions(activeGroup.id),
            fetchDueTransactions(activeGroup.id),
            fetchCategories(activeGroup.id)
          ]);
          console.log('Dashboard - Core finance data loaded successfully for group:', activeGroup.name);
          
          // Load planning data (handle errors gracefully)
          try {
            await Promise.all([
              fetchClients(activeGroup.id),
              fetchProjects(activeGroup.id),
              fetchInvoices(activeGroup.id),
              fetchTasks(activeGroup.id),
              fetchGoals(activeGroup.id)
            ]);
            console.log('Dashboard - Planning data loaded successfully for group:', activeGroup.name);
          } catch (planningError) {
            console.warn('Dashboard - Some planning data failed to load:', planningError);
            // Don't throw error, just log warning
          }
        } catch (error) {
          console.error('Error loading finance data:', error);
        }
      } else {
        console.log('Dashboard - No active group found');
      }
    };
    loadFinanceData();
  }, [activeGroup?.id]); // Only depend on activeGroup.id, not the functions

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent<{ section: string }>) => {
      setActiveSection(event.detail.section);
    };

    window.addEventListener('section-change', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('section-change', handleSectionChange as EventListener);
    };
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', currency: 'USD', taxRate: 0 });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinGroup(joinForm);
      setShowJoinModal(false);
      setJoinForm({ inviteKey: '' });
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  return (
    <div className="flex-1 bg-slate-800 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              {activeGroup ? (
                <>
                  {activeGroup.name}
                  <span className="ml-3 text-sm bg-blue-600 px-2 py-1 rounded">
                    {activeGroup.userRole}
                  </span>
                </>
              ) : (
                'Welcome'
              )}
            </h1>
            <p className="text-slate-300 mt-1">
              {activeGroup ? (
                <span className="flex items-center space-x-3">
                  <span>{activeGroup.currency}</span>
                  <span>•</span>
                  <span>Tax Rate: {activeGroup.taxRate}%</span>
                  <span>•</span>
                  <span>{activeGroup.memberCount} members</span>
                </span>
              ) : (
                `Welcome back, ${user?.name}! Select or create a group to get started.`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : !activeGroup ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Groups Yet</h2>
              <p className="text-slate-300 mb-8">
                Get started by creating a new group or joining an existing one to manage your finances together.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Group
                </Button>
                
                <Button
                  onClick={() => setShowJoinModal(true)}
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                  size="lg"
                >
                  <Key className="mr-2 h-5 w-5" />
                  Join Existing Group
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Section Content */}
            {activeSection === 'overview' && activeGroup && (
              <div className="space-y-6">
                <OverviewSection />

                {/* Budget Status and Recurring Transactions - 2 Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Budget Status */}
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <PiggyBank className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-white">Budget Status</h3>
                    </div>
                    <div className="space-y-3">
                      {(Array.isArray(budgets) ? budgets : []).slice(0, 3).map((budget) => {
                        const percentage = budget.percentageUsed || 0;
                        const status = percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'critical' : percentage >= 75 ? 'warning' : 'safe';
                        return (
                          <div key={budget._id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300">{budget.name}</span>
                              <span className={`text-sm ${
                                status === 'exceeded' ? 'text-red-400' :
                                status === 'critical' ? 'text-orange-400' :
                                status === 'warning' ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {status.toUpperCase()}
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            <div className="flex justify-between text-sm text-slate-400">
                              <span>${(budget.spent || 0).toLocaleString()} / ${budget.limit.toLocaleString()}</span>
                              <span>{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                      {(Array.isArray(budgets) ? budgets : []).length === 0 && (
                        <div className="text-center py-4">
                          <div className="text-slate-500 text-sm">No budgets created yet</div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Recurring Transactions */}
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <Repeat className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-white">Recurring Transactions</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Recurring</span>
                        <span className="text-white">{recurringTransactions.filter(t => t.isActive).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Due This Month</span>
                        <span className="text-orange-400">{dueTransactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Categories</span>
                        <span className="text-white">{categories.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Inactive Recurring</span>
                        <span className="text-slate-500">{recurringTransactions.filter(t => !t.isActive).length}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Additional Financial Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Budget Summary */}
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-full">
                        <Target className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Budgets</p>
                        <p className="text-lg font-semibold text-white">
                          {Array.isArray(budgets) ? budgets.length : 0}
                        </p>
                        <p className="text-xs text-slate-500">
                          ${Array.isArray(budgets) ? budgets.reduce((sum, b) => sum + (b.limit || 0), 0).toLocaleString() : 0} total limit
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Budget Spending */}
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-500/10 rounded-full">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Budget Spent</p>
                        <p className="text-lg font-semibold text-white">
                          ${Array.isArray(budgets) ? budgets.reduce((sum, b) => sum + (b.spent || 0), 0).toLocaleString() : 0}
                        </p>
                        <p className="text-xs text-slate-500">
                          {Array.isArray(budgets) && budgets.length > 0 ? 
                            (budgets.reduce((sum, b) => sum + (b.percentageUsed || 0), 0) / budgets.length).toFixed(1) : 0}% avg usage
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Categories */}
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Categories</p>
                        <p className="text-lg font-semibold text-white">{categories.length}</p>
                        <p className="text-xs text-slate-500">
                          {categories.length} total categories
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Transaction Count */}
                  <Card className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-full">
                        <Calendar className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Transactions</p>
                        <p className="text-lg font-semibold text-white">
                          {Array.isArray(transactions) ? transactions.length : 0}
                        </p>
                        <p className="text-xs text-slate-500">
                          {Array.isArray(transactions) ? transactions.filter(t => t.type === 'income').length : 0} income, {Array.isArray(transactions) ? transactions.filter(t => t.type === 'expense').length : 0} expense
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Alerts */}
                <Card className="p-6 bg-slate-800 border-slate-700">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-white">Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    {budgets.filter(b => (b.percentageUsed || 0) >= 90).length > 0 && (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">
                          {budgets.filter(b => (b.percentageUsed || 0) >= 90).length} budget(s) near limit
                        </span>
                      </div>
                    )}
                    {dueTransactions.length > 0 && (
                      <div className="flex items-center space-x-2 text-orange-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {dueTransactions.length} recurring transaction(s) due
                        </span>
                      </div>
                    )}
                    {budgets.filter(b => (b.percentageUsed || 0) >= 100).length > 0 && (
                      <div className="flex items-center space-x-2 text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">
                          {budgets.filter(b => (b.percentageUsed || 0) >= 100).length} budget(s) exceeded
                        </span>
                      </div>
                    )}
                    {budgets.filter(b => (b.percentageUsed || 0) >= 90).length === 0 && 
                     dueTransactions.length === 0 && 
                     budgets.filter(b => (b.percentageUsed || 0) >= 100).length === 0 && (
                      <div className="text-center py-4">
                        <div className="text-green-400 text-sm">All good! No alerts at this time.</div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Planning Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Tasks Overview */}
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckSquare className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-white">Tasks Overview</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Total Tasks</span>
                        <span className="text-white font-semibold">{tasks.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Pending</span>
                        <span className="text-yellow-400 font-semibold">{getTasksByStatus('pending').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">In Progress</span>
                        <span className="text-blue-400 font-semibold">{getTasksByStatus('in-progress').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Completed</span>
                        <span className="text-green-400 font-semibold">{getTasksByStatus('completed').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Overdue</span>
                        <span className="text-red-400 font-semibold">{getOverdueTasks().length}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Calendar Overview */}
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-white">Calendar Overview</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Today's Tasks</span>
                        <span className="text-white font-semibold">
                          {tasks.filter(task => {
                            if (!task.dueDate) return false;
                            const today = new Date();
                            const taskDate = new Date(task.dueDate);
                            return taskDate.toDateString() === today.toDateString();
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">This Week</span>
                        <span className="text-blue-400 font-semibold">
                          {tasks.filter(task => {
                            if (!task.dueDate) return false;
                            const today = new Date();
                            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                            const taskDate = new Date(task.dueDate);
                            return taskDate >= today && taskDate <= nextWeek;
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Overdue</span>
                        <span className="text-red-400 font-semibold">{getOverdueTasks().length}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Financial Goals Overview */}
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <Target className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-white">Financial Goals</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Active Goals</span>
                        <span className="text-green-400 font-semibold">
                          {goals.filter(goal => goal.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Completed</span>
                        <span className="text-blue-400 font-semibold">
                          {goals.filter(goal => goal.status === 'completed').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Total Saved</span>
                        <span className="text-white font-semibold">
                          ${goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Target Amount</span>
                        <span className="text-slate-400">
                          ${goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="p-6 bg-slate-800 border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                      onClick={() => setActiveSection('transactions')}
                    >
                      <DollarSign className="h-6 w-6" />
                      <span>Add Transaction</span>
                    </Button>
                    <Button 
                      className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                      onClick={() => setActiveSection('budgets')}
                    >
                      <PiggyBank className="h-6 w-6" />
                      <span>Manage Budgets</span>
                    </Button>
                    <Button 
                      className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                      onClick={() => setActiveSection('recurring')}
                    >
                      <Repeat className="h-6 w-6" />
                      <span>Recurring</span>
                    </Button>
                    <Button 
                      className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                      onClick={() => setActiveSection('reports')}
                    >
                      <BarChart3 className="h-6 w-6" />
                      <span>Reports</span>
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-white mb-3">Planning & Tasks</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('tasks')}
                      >
                        <CheckSquare className="h-6 w-6" />
                        <span>Tasks</span>
                      </Button>
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('calendar')}
                      >
                        <Calendar className="h-6 w-6" />
                        <span>Calendar</span>
                      </Button>
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('goals')}
                      >
                        <Target className="h-6 w-6" />
                        <span>Goals</span>
                      </Button>
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('clients')}
                      >
                        <Users className="h-6 w-6" />
                        <span>Clients</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-white mb-3">Business</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('projects')}
                      >
                        <Briefcase className="h-6 w-6" />
                        <span>Projects</span>
                      </Button>
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('invoices')}
                      >
                        <FileText className="h-6 w-6" />
                        <span>Invoices</span>
                      </Button>
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('categories')}
                      >
                        <BarChart3 className="h-6 w-6" />
                        <span>Categories</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-white mb-3">Management</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('documents')}
                      >
                        <FolderOpen className="h-6 w-6" />
                        <span>Documents</span>
                      </Button>
                      <Button 
                        className="h-20 flex-col space-y-2 bg-slate-700 hover:bg-slate-600"
                        onClick={() => setActiveSection('settings')}
                      >
                        <Settings className="h-6 w-6" />
                        <span>Settings</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {activeSection === 'groups' && <GroupsSection />}
            {activeSection === 'transactions' && activeGroup && <TransactionsSection />}
            {activeSection === 'budgets' && activeGroup && <BudgetsSection />}
            {activeSection === 'recurring' && activeGroup && <RecurringSection />}
            {activeSection === 'categories' && activeGroup && <CategoriesSection />}
            {activeSection === 'reports' && activeGroup && <ReportsSection />}
            {activeSection === 'clients' && activeGroup && <ClientsSection />}
            {activeSection === 'projects' && activeGroup && <ProjectsSection />}
            {activeSection === 'invoices' && activeGroup && <InvoicesSection />}
            {activeSection === 'tasks' && activeGroup && <TasksSection />}
            {activeSection === 'calendar' && activeGroup && <CalendarSection />}
            {activeSection === 'goals' && activeGroup && <FinancialGoalsSection />}
            {activeSection === 'documents' && activeGroup && <DocumentsSection />}
            {activeSection === 'settings' && <SettingsSection />}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Group</CardTitle>
              <CardDescription className="text-slate-300">
                Set up a new workspace for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName" className="text-slate-200">Group Name</Label>
                  <Input
                    id="groupName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter group name"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-slate-200">Currency</Label>
                  <select
                    id="currency"
                    value={createForm.currency}
                    onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate" className="text-slate-200">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={createForm.taxRate}
                    onChange={(e) => setCreateForm({ ...createForm, taxRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Create Group
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Join Existing Group</CardTitle>
              <CardDescription className="text-slate-300">
                Enter the invite key to join a group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteKey" className="text-slate-200">Invite Key</Label>
                  <Input
                    id="inviteKey"
                    value={joinForm.inviteKey}
                    onChange={(e) => setJoinForm({ ...joinForm, inviteKey: e.target.value })}
                    placeholder="Enter invite key"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Join Group
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
