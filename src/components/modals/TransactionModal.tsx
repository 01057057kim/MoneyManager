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
import { useCategoryStore } from '../../store/categoryStore';
import { useGroupStore } from '../../store/groupStore';
import { useEffect } from 'react';
import type { Transaction } from '../../store/transactionStore';

export interface TransactionFormData {
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  status: 'completed' | 'pending';
}

interface TransactionModalProps {
  transaction?: Transaction;
  onSave: (data: TransactionFormData) => void;
  onCancel: () => void;
}

export function TransactionModal({
  transaction,
  onSave,
  onCancel
}: TransactionModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: transaction ? {
      ...transaction,
      date: transaction.date.toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
    } : {
      type: 'expense',
      status: 'completed',
      date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
    }
  });

  const { categories, fetchCategories } = useCategoryStore();
  const { activeGroup } = useGroupStore();

  // Fetch categories when modal opens
  useEffect(() => {
    if (activeGroup?.id) {
      fetchCategories(activeGroup.id);
    } else {
      fetchCategories();
    }
  }, [activeGroup?.id, fetchCategories]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {transaction ? 'Edit Transaction' : 'New Transaction'}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {transaction ? 'Update the transaction details' : 'Add a new transaction'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-200">Description</Label>
              <Input
                id="description"
                className="bg-slate-700 border-slate-600 text-white"
                {...register('description', { required: true })}
              />
              {errors.description && (
                <span className="text-sm text-red-400">Description is required</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-200">Category</Label>
              <select
                id="category"
                className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                {...register('category', { required: true })}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-200">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  className="bg-slate-700 border-slate-600 text-white"
                  {...register('amount', { required: true, min: 0 })}
                />
                {errors.amount && (
                  <span className="text-sm text-red-400">Valid amount is required</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-200">Date</Label>
                <Input
                  id="date"
                  type="date"
                  className="bg-slate-700 border-slate-600 text-white"
                  {...register('date', { required: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-slate-200">Type</Label>
                <select
                  id="type"
                  className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                  {...register('type')}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-200">Status</Label>
                <select
                  id="status"
                  className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                  {...register('status')}
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {transaction ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}