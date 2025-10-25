import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useClientStore } from '../../store/clientStore';
import { useGroupStore } from '../../store/groupStore';
import { X, User, Mail, Phone, MapPin, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: any; // For editing existing client
}

const ClientModal = ({ isOpen, onClose, client }: ClientModalProps) => {
  const { activeGroup } = useGroupStore();
  const { createClient, updateClient, isLoading } = useClientStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        company: client.company || '',
        notes: client.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        notes: ''
      });
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeGroup) {
      toast.error('No active group selected');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      if (client) {
        await updateClient(client._id, formData);
        toast.success('Client updated successfully');
      } else {
        await createClient({
          ...formData,
          groupId: activeGroup.id
        });
        toast.success('Client created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-slate-800 border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <User className="h-5 w-5 mr-2" />
              {client ? 'Edit Client' : 'Add New Client'}
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
            <div>
              <Label htmlFor="name" className="text-slate-300">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter client name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter client email"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-slate-300">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-slate-300">
                Company
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-slate-300">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter address"
              />
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
                {isLoading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
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

export default ClientModal;
