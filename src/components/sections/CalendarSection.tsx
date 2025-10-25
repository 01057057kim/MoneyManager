import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle2,
  Circle,
  Play,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useGroupStore } from '../../store/groupStore';

const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const { 
    tasks, 
    loading, 
    fetchTasks 
  } = useTaskStore();
  
  const { activeGroup } = useGroupStore();

  useEffect(() => {
    if (activeGroup) {
      fetchTasks(activeGroup.id);
    }
  }, [activeGroup, fetchTasks]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getTasksForToday = () => {
    const today = new Date();
    return getTasksForDate(today);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      return new Date(task.dueDate) < today;
    });
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate <= nextWeek;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Circle className="h-3 w-3 text-gray-400" />;
      case 'in-progress': return <Play className="h-3 w-3 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'cancelled': return <X className="h-3 w-3 text-red-500" />;
      default: return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  const CalendarGrid = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date();
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-slate-400">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-20"></div>;
          }
          
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
          const dayTasks = getTasksForDate(day);
          
          return (
            <div
              key={day.getDate()}
              className={`h-20 p-1 border border-slate-700 cursor-pointer hover:bg-slate-700/50 ${
                isToday ? 'bg-blue-500/20 border-blue-500' : ''
              } ${isSelected ? 'bg-blue-600/30 border-blue-500' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isToday ? 'text-blue-400 font-bold' : 'text-white'}`}>
                  {day.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex space-x-1">
                    {dayTasks.slice(0, 3).map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-xs text-slate-400">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              {dayTasks.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div key={task._id} className="flex items-center space-x-1">
                      {getStatusIcon(task.status)}
                      <span className="text-xs text-slate-300 truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const TaskList = ({ tasks, title, emptyMessage }: { tasks: any[], title: string, emptyMessage: string }) => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center space-x-3 p-2 bg-slate-700/50 rounded-lg">
                {getStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{task.title}</p>
                  <p className="text-xs text-slate-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Calendar</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setViewMode('month')}
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
          >
            Month
          </Button>
          <Button
            onClick={() => setViewMode('week')}
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
          >
            Week
          </Button>
          <Button
            onClick={() => setViewMode('day')}
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-xl font-semibold text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={() => setCurrentDate(new Date())}
          variant="outline"
          size="sm"
          className="border-slate-600 text-white hover:bg-slate-700"
        >
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <CalendarGrid />
        </CardContent>
      </Card>

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TaskList
          tasks={getTasksForToday()}
          title="Today's Tasks"
          emptyMessage="No tasks for today"
        />
        <TaskList
          tasks={getOverdueTasks()}
          title="Overdue Tasks"
          emptyMessage="No overdue tasks"
        />
        <TaskList
          tasks={getUpcomingTasks()}
          title="Upcoming Tasks"
          emptyMessage="No upcoming tasks"
        />
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Tasks for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTasksForDate(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getTasksForDate(selectedDate).map((task) => (
                  <div key={task._id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <p className="text-xs text-slate-400">{task.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      <span className="text-xs text-slate-400">{task.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">No tasks scheduled for this date</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarSection;
