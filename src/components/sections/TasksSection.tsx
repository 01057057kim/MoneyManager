import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle2,
  Circle,
  Play,
  X,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useGroupStore } from '../../store/groupStore';
import { useCategoryStore } from '../../store/categoryStore';

const TasksSection = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { 
    tasks, 
    loading, 
    fetchTasks, 
    createTask, 
    updateTask,
    deleteTask, 
    updateTaskStatus,
    updateChecklistItem,
    getTasksByStatus,
    getOverdueTasks 
  } = useTaskStore();
  
  const { activeGroup } = useGroupStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (activeGroup) {
      fetchTasks(activeGroup.id);
      fetchCategories(activeGroup.id);
    }
  }, [activeGroup, fetchTasks, fetchCategories]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee?._id === assigneeFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesCategory;
  });

  const pendingTasks = getTasksByStatus('pending');
  const inProgressTasks = getTasksByStatus('in-progress');
  const completedTasks = getTasksByStatus('completed');
  const overdueTasks = getOverdueTasks();

  const handleCreateTask = async (taskData: any) => {
    if (activeGroup) {
      await createTask({
        ...taskData,
        group: activeGroup.id
      });
      setShowTaskModal(false);
    }
  };

  const handleEditTask = async (taskData: any) => {
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
      setEditingTask(null);
      setShowTaskModal(false);
    }
  };

  const handleChecklistToggle = async (taskId: string, itemId: string, completed: boolean) => {
    await updateChecklistItem(taskId, itemId, completed);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    await updateTaskStatus(taskId, status as any);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Circle className="h-4 w-4 text-gray-400" />;
      case 'in-progress': return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <X className="h-4 w-4 text-red-500" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const TaskCard = ({ task }: { task: any }) => (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(task.status)}
            <h3 className="font-medium text-white">{task.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {task.priority}
            </span>
            {task.isOverdue && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingTask(task);
                setShowTaskModal(true);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTask(task._id)}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-slate-300 mb-3">{task.description}</p>
        )}
        
        {task.category && (
          <div className="mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
              {task.category}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            {task.assignee && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{task.assignee.name}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className={task.isOverdue ? 'text-red-400' : ''}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateTaskStatus(task._id, 
                task.status === 'pending' ? 'in-progress' : 
                task.status === 'in-progress' ? 'completed' : 'pending'
              )}
              className="h-6 px-2 text-xs"
            >
              {task.status === 'pending' ? 'Start' : 
               task.status === 'in-progress' ? 'Complete' : 'Reopen'}
            </Button>
          </div>
        </div>
        
        {task.checklist && task.checklist.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <div className="mt-2 space-y-1">
              {task.checklist.slice(0, 3).map((item: any) => (
                <div key={item._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => handleChecklistToggle(task._id, item._id, e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className={`text-xs ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {item.item}
                  </span>
                </div>
              ))}
              {task.checklist.length > 3 && (
                <div className="text-xs text-slate-500">
                  +{task.checklist.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const TaskModal = () => {
    const isEditing = !!editingTask;
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      // Process checklist items
      const checklistText = formData.get('checklist') as string;
      const checklistItems = checklistText 
        ? checklistText.split('\n').filter(item => item.trim()).map(item => ({
            item: item.trim(),
            completed: false
          }))
        : [];
      
      const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        dueDate: formData.get('dueDate'),
        assignee: formData.get('assignee') || undefined,
        category: formData.get('category') || undefined,
        checklist: checklistItems
      };
      
      if (isEditing) {
        handleEditTask(taskData);
      } else {
        handleCreateTask(taskData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditing ? 'Edit Task' : 'Create New Task'}
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
                    defaultValue={editingTask?.title || ''}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={editingTask?.description || ''}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority" className="text-white">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue={editingTask?.priority || 'medium'}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="dueDate" className="text-white">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    defaultValue={editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="assignee" className="text-white">Assignee (Optional)</Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    placeholder="User ID or email"
                    defaultValue={editingTask?.assignee?._id || ''}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editingTask?.category || ''}
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
                  <Label htmlFor="checklist" className="text-white">Checklist Items (Optional)</Label>
                  <textarea
                    id="checklist"
                    name="checklist"
                    placeholder="Enter checklist items, one per line"
                    defaultValue={editingTask?.checklist?.map((item: any) => item.item).join('\n') || ''}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    rows={3}
                  />
                  <p className="text-xs text-slate-400 mt-1">Enter one checklist item per line</p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowTaskModal(false);
                      setEditingTask(null);
                    }}
                    className="text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {isEditing ? 'Update Task' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tasks</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {/* TODO: Add actual group members */}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Circle className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-slate-400">Pending</p>
                <p className="text-xl font-bold text-white">{pendingTasks.length}</p>
                <p className="text-xs text-slate-500">
                  {tasks.length > 0 ? Math.round((pendingTasks.length / tasks.length) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">In Progress</p>
                <p className="text-xl font-bold text-white">{inProgressTasks.length}</p>
                <p className="text-xs text-slate-500">
                  {tasks.length > 0 ? Math.round((inProgressTasks.length / tasks.length) * 100) : 0}% of total
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
                <p className="text-xl font-bold text-white">{completedTasks.length}</p>
                <p className="text-xs text-slate-500">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-slate-400">Overdue</p>
                <p className="text-xl font-bold text-white">{overdueTasks.length}</p>
                <p className="text-xs text-slate-500">
                  {overdueTasks.length > 0 ? 'Needs attention' : 'All on track'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-slate-400">High Priority</p>
                <p className="text-xl font-bold text-white">
                  {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
                </p>
                <p className="text-xs text-slate-500">Urgent tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">Assigned</p>
                <p className="text-xl font-bold text-white">
                  {tasks.filter(t => t.assignee).length}
                </p>
                <p className="text-xs text-slate-500">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.assignee).length / tasks.length) * 100) : 0}% assigned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-400">With Checklists</p>
                <p className="text-xl font-bold text-white">
                  {tasks.filter(t => t.checklist && t.checklist.length > 0).length}
                </p>
                <p className="text-xs text-slate-500">Detailed tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <CheckSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No tasks found</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && <TaskModal />}
    </div>
  );
};

export default TasksSection;
