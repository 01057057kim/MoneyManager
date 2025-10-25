import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Tag, 
  Plus, 
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useCategoryStore } from '../../store/categoryStore';
import { useGroupStore } from '../../store/groupStore';
import { CategoryModal } from '../modals/CategoryModal';

import type { Category } from '../../store/categoryStore';

interface CategoriesSectionProps {}

const CategoriesSection: React.FC<CategoriesSectionProps> = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'transactions'>('spent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { activeGroup } = useGroupStore();
  const { 
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategoryStore();

  useEffect(() => {
    const loadCategories = async () => {
      if (activeGroup) {
        try {
          await fetchCategories(activeGroup.id);
        } catch (error) {
          console.error('Error loading categories:', error);
          toast.error('Failed to load categories');
        }
      }
    };
    loadCategories();
  }, [activeGroup?.id]); // Only depend on activeGroup.id, not the function

  const handleCreateCategory = () => {
    setSelectedCategory(undefined);
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (name: string) => {
    if (!activeGroup) return;
    
    const newCategory = prompt(
      `Enter the category name to merge "${name}" transactions into:\n\n` +
      `(All transactions from "${name}" will be moved to this category)`
    );
    
    if (!newCategory) {
      toast.info('Delete cancelled');
      return;
    }

    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (newCategory.trim().toLowerCase() === name.toLowerCase()) {
      toast.error('New category must be different from the current one');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?\n\n` +
      `All transactions will be moved to "${newCategory.trim()}".`
    );

    if (!confirmed) {
      toast.info('Delete cancelled');
      return;
    }

    try {
      await deleteCategory(name, activeGroup.id, newCategory.trim());
      toast.success(`Category "${name}" deleted and transactions merged to "${newCategory.trim()}"`);
      
      // Refresh categories list
      await fetchCategories(activeGroup.id);
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory.name, data.name, activeGroup?.id || '');
        toast.success(`Category updated to "${data.name}"`);
      } else {
        // Create new category
        await createCategory({
          ...data,
          groupId: activeGroup?.id || ''
        });
        toast.success(`Category "${data.name}" created successfully`);
      }
      
      setShowModal(false);
      setSelectedCategory(undefined);
      
      // Refresh categories
      if (activeGroup) {
        await fetchCategories(activeGroup.id);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.error || 
        (selectedCategory ? 'Failed to update category' : 'Failed to create category');
      toast.error(errorMessage);
      
      // Don't close modal on error so user can fix the issue
      throw error;
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'spent':
        aValue = a.totalSpent;
        bValue = b.totalSpent;
        break;
      case 'transactions':
        aValue = a.transactionCount;
        bValue = b.transactionCount;
        break;
      default:
        aValue = a.totalSpent;
        bValue = b.totalSpent;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBudgetStatusColor = (category: Category) => {
    if (!category.budget) return 'text-slate-400';
    
    const percentage = category.budget.percentageUsed;
    if (percentage >= 100) return 'text-red-400';
    if (percentage >= 90) return 'text-orange-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getBudgetStatusText = (category: Category) => {
    if (!category.budget) return 'No Budget';
    
    const percentage = category.budget.percentageUsed;
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 90) return 'Critical';
    if (percentage >= 75) return 'Warning';
    return 'On Track';
  };

  const totalSpent = categories.reduce((sum, cat) => sum + cat.totalSpent, 0);
  const totalTransactions = categories.reduce((sum, cat) => sum + cat.transactionCount, 0);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Categories</h2>
          <p className="text-slate-400">Manage your transaction categories and spending</p>
        </div>
        <Button onClick={handleCreateCategory} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Tag className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Categories</p>
              <p className="text-lg font-semibold text-white">{categories.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Spent</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-full">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Transactions</p>
              <p className="text-lg font-semibold text-white">{totalTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-full">
              <BarChart3 className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">With Budgets</p>
              <p className="text-lg font-semibold text-white">
                {categories.filter(cat => cat.budget).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
          >
            <option value="spent">Sort by Spent</option>
            <option value="transactions">Sort by Transactions</option>
            <option value="name">Sort by Name</option>
          </select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            size="sm"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <Card className="bg-slate-800 border-slate-700">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Category</TableHead>
              <TableHead className="text-slate-300">Total Spent</TableHead>
              <TableHead className="text-slate-300">Transactions</TableHead>
              <TableHead className="text-slate-300">Last Transaction</TableHead>
              <TableHead className="text-slate-300">Budget Status</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : sortedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                  {searchTerm ? 'No categories match your search' : 'No categories found. Create one to get started!'}
                </TableCell>
              </TableRow>
            ) : (
              sortedCategories.map((category) => (
                <TableRow key={category.name} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell className="text-white">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <span className="font-medium text-green-400">
                      {formatCurrency(category.totalSpent)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {category.transactionCount}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {formatDate(category.lastTransaction)}
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${getBudgetStatusColor(category)}`}>
                      {getBudgetStatusText(category)}
                    </span>
                    {category.budget && (
                      <div className="text-xs text-slate-400 mt-1">
                        {formatCurrency(category.budget.remaining)} remaining
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                        className="h-8 w-8 p-0 bg-slate-700 border-slate-600 hover:bg-slate-600"
                        title="Edit category"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCategory(category.name)}
                        className="h-8 w-8 p-0 bg-slate-700 border-slate-600 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      {showModal && (
        <CategoryModal
          category={selectedCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setShowModal(false);
            setSelectedCategory(undefined);
          }}
        />
      )}
    </div>
  );
};

export default CategoriesSection;