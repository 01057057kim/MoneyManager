import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { useProjectStore } from '../../store/projectStore';
import { useClientStore } from '../../store/clientStore';
import { useGroupStore } from '../../store/groupStore';
import ProjectModal from '../modals/ProjectModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Clock,
  Target,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ProjectsSection = () => {
  const { activeGroup } = useGroupStore();
  const { projects, isLoading, fetchProjects, deleteProject } = useProjectStore();
  const { clients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    const loadProjects = async () => {
      if (activeGroup) {
        try {
          await fetchProjects(activeGroup.id);
        } catch (error) {
          console.error('Error loading projects:', error);
          toast.error('Failed to load projects');
        }
      }
    };
    loadProjects();
  }, [activeGroup?.id]);

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete ${projectName}?`)) {
      try {
        await deleteProject(projectId);
        toast.success('Project deleted successfully');
        setShowActions(null);
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowModal(true);
    setShowActions(null);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Target className="h-4 w-4 text-blue-400" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-green-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'on_hold':
        return <Pause className="h-4 w-4 text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Target className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'text-blue-400';
      case 'in_progress':
        return 'text-green-400';
      case 'completed':
        return 'text-green-500';
      case 'on_hold':
        return 'text-yellow-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!activeGroup) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Active Group</h3>
        <p className="text-slate-400">Please select a group to manage projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-slate-400">Track and manage your projects</p>
        </div>
        <Button 
          onClick={handleAddProject}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-slate-400 mb-4">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first project to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={handleAddProject} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => {
            const client = (clients || []).find(c => c._id === project.clientId);
            return (
              <Card key={project._id} className="p-4 bg-slate-800 border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      {getStatusIcon(project.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-slate-400 mb-2">{project.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        {client && (
                          <span>Client: {client.name}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                        {project.budget && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${project.budget.toLocaleString()}</span>
                          </div>
                        )}
                        {project.totalHours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{project.totalHours}h</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowActions(showActions === project._id ? null : project._id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Actions Dropdown */}
                    {showActions === project._id && (
                      <div className="absolute right-2 top-12 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10">
                        <div className="py-1">
                        <button
                          className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
                          onClick={() => {
                            handleEditProject(project);
                            setShowActions(null);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-600"
                            onClick={() => {
                              handleDeleteProject(project._id, project.name);
                              setShowActions(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={showModal}
        onClose={handleCloseModal}
        project={editingProject}
      />
    </div>
  );
};

export default ProjectsSection;
