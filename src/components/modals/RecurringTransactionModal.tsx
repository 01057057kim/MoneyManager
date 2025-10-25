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
import { useRecurringStore } from '../../store/recurringStore';
import { useGroupStore } from '../../store/groupStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useEffect } from 'react';
import type { RecurringTransaction, RecurringTransactionFormData } from '../../store/recurringStore';

interface RecurringTransactionModalProps {
  transaction?: RecurringTransaction;
  onSave: (data: RecurringTransactionFormData) => void;
  onCancel: () => void;
}

export function RecurringTransactionModal({
  transaction,
  onSave,
  onCancel
}: RecurringTransactionModalProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RecurringTransactionFormData>({
    defaultValues: transaction ? {
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      group: transaction.group._id,
      frequency: transaction.frequency,
      startDate: transaction.startDate.split('T')[0],
      endDate: transaction.endDate ? transaction.endDate.split('T')[0] : '',
      payer: '', // Don't populate payer when editing - let user choose if needed
      notes: transaction.notes || '',
      client: transaction.client?._id || ''
    } : {
      type: 'expense',
      frequency: 'monthly',
      startDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
      group: '',
      payer: '',
      client: ''
    }
  });

  const { createRecurringTransaction, updateRecurringTransaction, isLoading } = useRecurringStore();
  const { activeGroup } = useGroupStore();
  const { categories, fetchCategories } = useCategoryStore();

  // Fetch categories when modal opens
  useEffect(() => {
    if (activeGroup?.id) {
      fetchCategories(activeGroup.id);
    } else {
      fetchCategories();
    }
  }, [activeGroup?.id, fetchCategories]);

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const onSubmit = async (data: RecurringTransactionFormData) => {
    try {
      // Sanitize the data - remove empty strings for optional ObjectId fields
      const sanitizedData: any = {
        title: data.title,
        amount: Number(data.amount), // Ensure amount is a number
        type: data.type,
        category: data.category,
        group: data.group,
        frequency: data.frequency,
        startDate: data.startDate
      };

      // Only include optional fields if they have valid values
      if (data.payer && data.payer.trim().length > 0) {
        sanitizedData.payer = data.payer.trim();
      }

      if (data.client && data.client.trim().length > 0) {
        sanitizedData.client = data.client.trim();
      }

      if (data.endDate && data.endDate.trim().length > 0) {
        sanitizedData.endDate = data.endDate.trim();
      }

      if (data.notes && data.notes.trim().length > 0) {
        sanitizedData.notes = data.notes.trim();
      }

      console.log('Submitting sanitized data:', sanitizedData);

      if (transaction) {
        await updateRecurringTransaction(transaction._id, sanitizedData);
      } else {
        await createRecurringTransaction(sanitizedData);
      }
      onSave(sanitizedData);
    } catch (error: any) {
      console.error('Error saving recurring transaction:', error);
      console.error('Error response:', error.response?.data);
      // Show more detailed error to user
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (error.response?.data?.errors ? 
                            error.response.data.errors.map((e: any) => e.msg).join(', ') : 
                            error.message) || 
                          'Failed to save recurring transaction';
      alert(`Error: ${errorMessage}\n\nPlease check the form and try again.`);
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
            {transaction ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {transaction ? 'Update the recurring transaction details' : 'Set up a new recurring transaction'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-slate-300">Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., Monthly Rent"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount" className="text-slate-300">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                  })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="type" className="text-slate-300">Type</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
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
                    <option key={category.name} value={category.name}>{category.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Frequency */}
              <div>
                <Label htmlFor="frequency" className="text-slate-300">Frequency</Label>
                <select
                  id="frequency"
                  {...register('frequency', { required: 'Frequency is required' })}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
                {errors.frequency && (
                  <p className="text-red-400 text-sm mt-1">{errors.frequency.message}</p>
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
                <p className="text-slate-400 text-xs mt-1">Leave empty for no end date</p>
              </div>

              {/* Payer */}
              <div>
                <Label htmlFor="payer" className="text-slate-300">Payer (Optional)</Label>
                <Input
                  id="payer"
                  {...register('payer')}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Leave empty to use yourself"
                />
                <p className="text-slate-400 text-xs mt-1">Enter valid User ID or leave empty</p>
              </div>

              {/* Client */}
              <div>
                <Label htmlFor="client" className="text-slate-300">Client (Optional)</Label>
                <Input
                  id="client"
                  {...register('client')}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Leave empty if not applicable"
                />
                <p className="text-slate-400 text-xs mt-1">Enter valid Client ID or leave empty</p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-slate-300">Notes (Optional)</Label>
              <textarea
                id="notes"
                {...register('notes')}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                rows={3}
                placeholder="Additional notes..."
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
                {isLoading ? 'Saving...' : (transaction ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}