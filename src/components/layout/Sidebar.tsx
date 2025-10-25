import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  CheckSquare, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  PlusSquare,
  BarChart2,
  Repeat,
  Tag,
  FileText,
  Briefcase,
  Target,
  FolderOpen
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { activeGroup } = useGroupStore();

  const menuItems = [
    {
      section: 'Overview',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/reports', label: 'Reports & Analytics', icon: BarChart2 },
      ]
    },
    {
      section: 'Finance',
      items: [
        { path: '/transactions', label: 'Transactions', icon: CreditCard },
        { path: '/recurring', label: 'Recurring', icon: Repeat },
        { path: '/budgets', label: 'Budgets', icon: PiggyBank },
        { path: '/categories', label: 'Categories', icon: Tag },
      ]
    },
    {
      section: 'Business',
      items: [
        { path: '/clients', label: 'Clients', icon: Users },
        { path: '/invoices', label: 'Invoices', icon: FileText },
        { path: '/projects', label: 'Projects', icon: Briefcase },
      ]
    },
    {
      section: 'Planning',
      items: [
        { path: '/tasks', label: 'Tasks', icon: CheckSquare },
        { path: '/calendar', label: 'Calendar', icon: Calendar },
        { path: '/goals', label: 'Financial Goals', icon: Target },
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/groups', label: 'Groups', icon: PlusSquare },
        { path: '/documents', label: 'Documents', icon: FolderOpen },
        { path: '/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      {/* Active Group Display */}
      <div className="p-4 border-b border-slate-700">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400">Current Group</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white h-6 w-6 p-1"
              onClick={() => navigate('/groups/new')}
            >
              <PlusSquare className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            <Button
              variant="default"
              className={`w-full justify-start text-sm ${
                activeGroup
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
              onClick={() => {
                navigate('/groups');
                const event = new CustomEvent('section-change', { 
                  detail: { section: 'groups' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="truncate">
                  {activeGroup?.name || 'Select a Group'}
                </span>
                <Users className="h-4 w-4 ml-2" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {activeGroup ? (
            menuItems.map((section) => (
              <div key={section.section}>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive 
                            ? "bg-blue-600 text-white" 
                            : "text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                        onClick={() => {
                          navigate(item.path);
                          const section = item.path.substring(1);
                          const event = new CustomEvent('section-change', { 
                            detail: { section } 
                          });
                          window.dispatchEvent(event);
                        }}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">
                Select a group to access features
              </p>
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
