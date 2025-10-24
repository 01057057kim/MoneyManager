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
import type { Category, CategoryFormData } from '../../store/categoryStore';

interface CategoryModalProps {
  category?: Category;
  onSave: (data: CategoryFormData) => void;
  onCancel: () => void;
}

export function CategoryModal({
  category,
  onSave,
  onCancel
}: CategoryModalProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CategoryFormData>({
    defaultValues: category ? {
      name: category.name,
      groupId: '',
      description: '',
      color: '#3B82F6',
      icon: 'tag'
    } : {
      name: '',
      groupId: '',
      description: '',
      color: '#3B82F6',
      icon: 'tag'
    }
  });

  const { isLoading } = useCategoryStore();
  const { activeGroup } = useGroupStore();

  const colors = [
    { value: '#3B82F6', label: 'Blue', color: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', color: 'bg-green-500' },
    { value: '#F59E0B', label: 'Yellow', color: 'bg-yellow-500' },
    { value: '#EF4444', label: 'Red', color: 'bg-red-500' },
    { value: '#8B5CF6', label: 'Purple', color: 'bg-purple-500' },
    { value: '#F97316', label: 'Orange', color: 'bg-orange-500' },
    { value: '#06B6D4', label: 'Cyan', color: 'bg-cyan-500' },
    { value: '#84CC16', label: 'Lime', color: 'bg-lime-500' }
  ];

  const icons = [
    { value: 'tag', label: 'Tag' },
    { value: 'shopping-cart', label: 'Shopping' },
    { value: 'car', label: 'Transport' },
    { value: 'home', label: 'Home' },
    { value: 'heart', label: 'Health' },
    { value: 'book', label: 'Education' },
    { value: 'plane', label: 'Travel' },
    { value: 'briefcase', label: 'Business' },
    { value: 'gamepad2', label: 'Entertainment' },
    { value: 'utensils', label: 'Food' }
  ];

  const onSubmit = async (data: CategoryFormData) => {
    try {
      await onSave(data);
      // Modal will be closed by parent component on success
    } catch (error) {
      // Error is handled by parent component
      console.error('Error in modal submit:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {category ? 'Edit Category' : 'New Category'}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {category ? 'Update the category details' : 'Create a new transaction category'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-slate-300">Category Name</Label>
              <Input
                id="name"
                {...register('name', { 
                  required: 'Category name is required',
                  minLength: {
                    value: 2,
                    message: 'Category name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Category name must be less than 50 characters'
                  }
                })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Groceries"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
              <textarea
                id="description"
                {...register('description', {
                  maxLength: {
                    value: 200,
                    message: 'Description must be less than 200 characters'
                  }
                })}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400"
                rows={3}
                placeholder="Describe this category..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <Label className="text-slate-300">Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colors.map((color) => (
                  <label key={color.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={color.value}
                      {...register('color')}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div 
                      className={`w-8 h-8 rounded-full ${color.color} ${
                        watch('color') === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                      } transition-all`}
                      title={color.label}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <Label htmlFor="icon" className="text-slate-300">Icon</Label>
              <select
                id="icon"
                {...register('icon')}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                disabled={isLoading}
              >
                {icons.map(icon => (
                  <option key={icon.value} value={icon.value}>{icon.label}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  category ? 'Update Category' : 'Create Category'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}