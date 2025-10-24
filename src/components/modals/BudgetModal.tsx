import { useForm } from 'react-hook-form';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useBudgetStore } from '../../store/budgetStore';
import { useGroupStore } from '../../store/groupStore';
import type { Budget, BudgetFormData } from '../../store/budgetStore';

interface BudgetModalProps {
  budget?: Budget;
  onSave: (data: BudgetFormData) => void;
  onCancel: () => void;
}

export function BudgetModal({
  budget,
  onSave,
  onCancel
}: BudgetModalProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BudgetFormData>({
    defaultValues: budget ? {
      name: budget.name,
      group: budget.group._id,
      category: budget.category,
      limit: budget.limit,
      period: budget.period,
      startDate: budget.startDate.split('T')[0],
      endDate: budget.endDate ? budget.endDate.split('T')[0] : '',
      notifications: budget.notifications,
      tags: budget.tags,
      notes: budget.notes || ''
    } : {
      name: '',
      group: '',
      category: '',
      limit: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      notifications: {
        enabled: true,
        thresholds: []
      },
      tags: []
    }
  });

  const { createBudget, updateBudget, isLoading } = useBudgetStore();
  const { activeGroup } = useGroupStore();

  const categories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Shopping',
    'Healthcare',
    'Education',
    'Travel',
    'Business',
    'Other'
  ];

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const onSubmit = async (rawData: any) => {
    console.log('Form submitted with data:', rawData);
    
    try {
      // Transform the data to match backend expectations
      const data: BudgetFormData = {
        name: rawData.name,
        group: rawData.group || activeGroup?.id,
        category: rawData.category,
        limit: parseFloat(rawData.limit),
        period: rawData.period,
        startDate: rawData.startDate,
        endDate: rawData.endDate || undefined,
        notifications: {
          enabled: rawData.notifications?.enabled || false,
          thresholds: rawData.notifications?.thresholds || []
        },
        // Convert comma-separated string to array, or use existing array
        tags: typeof rawData.tags === 'string' 
          ? rawData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
          : (rawData.tags || []),
        notes: rawData.notes || undefined
      };

      console.log('Sending data to API:', data);

      if (budget) {
        const result = await updateBudget(budget._id, data);
        console.log('Update result:', result);
      } else {
        const result = await createBudget(data);
        console.log('Create result:', result);
      }
      
      // Call onSave regardless of the result format
      onSave(data);
    } catch (error: any) {
      console.error('Error saving budget:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Don't re-throw the error if the budget was actually created
      // Check if error is just about response format
      if (error.response?.status === 400 && error.response?.data?.success === false) {
        throw error; // Real validation error
      }
      // If it's another type of error but might have succeeded, check the backend
    }
  };

  // Set default group if not set
  if (!watch('group') && activeGroup) {
    setValue('group', activeGroup.id);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-white">
            {budget ? 'Edit Budget' : 'New Budget'}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {budget ? 'Update the budget details' : 'Create a new budget to track spending'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <Label htmlFor="name" className="text-slate-300">Budget Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Budget name is required' })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., Monthly Groceries"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-slate-300">Category</Label>
                <select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Limit */}
              <div>
                <Label htmlFor="limit" className="text-slate-300">Budget Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  {...register('limit', { 
                    required: 'Budget limit is required',
                    min: { value: 0.01, message: 'Limit must be greater than 0' }
                  })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0.00"
                />
                {errors.limit && (
                  <p className="text-red-400 text-sm mt-1">{errors.limit.message}</p>
                )}
              </div>

              {/* Period */}
              <div>
                <Label htmlFor="period" className="text-slate-300">Period</Label>
                <select
                  id="period"
                  {...register('period', { required: 'Period is required' })}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
                {errors.period && (
                  <p className="text-red-400 text-sm mt-1">{errors.period.message}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <Label htmlFor="startDate" className="text-slate-300">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {errors.startDate && (
                  <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <Label htmlFor="endDate" className="text-slate-300">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Notifications */}
            <div>
              <Label className="text-slate-300">Notifications</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('notifications.enabled')}
                    className="rounded border-slate-600 bg-slate-700 text-blue-600"
                  />
                  <span className="text-slate-300">Enable notifications</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-slate-300">Tags (Optional)</Label>
              <Input
                id="tags"
                {...register('tags')}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter tags separated by commas"
              />
              <p className="text-xs text-slate-400 mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-slate-300">Notes</Label>
              <textarea
                id="notes"
                {...register('notes')}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                rows={3}
                placeholder="Additional notes about this budget..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : (budget ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}