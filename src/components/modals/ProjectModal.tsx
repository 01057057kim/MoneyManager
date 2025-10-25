import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useProjectStore } from '../../store/projectStore';
import { useClientStore } from '../../store/clientStore';
import { useGroupStore } from '../../store/groupStore';
import { X, Briefcase, Target, Calendar, DollarSign, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any; // For editing existing project
}

const ProjectModal = ({ isOpen, onClose, project }: ProjectModalProps) => {
  const { activeGroup } = useGroupStore();
  const { createProject, updateProject, isLoading } = useProjectStore();
  const { clients } = useClientStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    budget: '',
    hourlyRate: '',
    totalHours: '',
    progress: 0,
    notes: ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        clientId: project.clientId || '',
        status: project.status || 'planning',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget?.toString() || '',
        hourlyRate: project.hourlyRate?.toString() || '',
        totalHours: project.totalHours?.toString() || '',
        progress: project.progress || 0,
        notes: project.notes || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        clientId: '',
        status: 'planning',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: '',
        hourlyRate: '',
        totalHours: '',
        progress: 0,
        notes: ''
      });
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeGroup) {
      toast.error('No active group selected');
      return;
    }

    if (!formData.name.trim() || !formData.clientId) {
      toast.error('Name and client are required');
      return;
    }

    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        totalHours: formData.totalHours ? parseFloat(formData.totalHours) : undefined,
        groupId: activeGroup.id
      };

      if (project) {
        await updateProject(project._id, projectData);
        toast.success('Project updated successfully');
      } else {
        await createProject(projectData);
        toast.success('Project created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 bg-slate-800 border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              {project ? 'Edit Project' : 'Add New Project'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <Label htmlFor="clientId" className="text-slate-300">
                  Client *
                </Label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                >
                  <option value="">Select a client</option>
                  {(clients || []).map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md resize-none"
                placeholder="Enter project description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-slate-300">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="progress" className="text-slate-300">
                  Progress (%)
                </Label>
                <Input
                  id="progress"
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-slate-300">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-slate-300">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget" className="text-slate-300">
                  Budget
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="hourlyRate" className="text-slate-300">
                  Hourly Rate
                </Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="totalHours" className="text-slate-300">
                  Total Hours
                </Label>
                <Input
                  id="totalHours"
                  name="totalHours"
                  type="number"
                  step="0.1"
                  value={formData.totalHours}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-300">
                Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md resize-none"
                placeholder="Enter any additional notes"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-500 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ProjectModal;
