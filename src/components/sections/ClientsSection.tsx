import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useClientStore } from '../../store/clientStore';
import { useGroupStore } from '../../store/groupStore';
import ClientModal from '../modals/ClientModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building2,
  User,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

const ClientsSection = () => {
  const { activeGroup } = useGroupStore();
  const { clients, isLoading, fetchClients, deleteClient } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  useEffect(() => {
    const loadClients = async () => {
      if (activeGroup) {
        try {
          await fetchClients(activeGroup.id);
        } catch (error) {
          console.error('Error loading clients:', error);
          toast.error('Failed to load clients');
        }
      }
    };
    loadClients();
  }, [activeGroup?.id]);

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete ${clientName}?`)) {
      try {
        await deleteClient(clientId);
        toast.success('Client deleted successfully');
        setShowActions(null);
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setShowModal(true);
    setShowActions(null);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const filteredClients = (clients || []).filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!activeGroup) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Active Group</h3>
        <p className="text-slate-400">Please select a group to manage clients</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Clients</h2>
          <p className="text-slate-400">Manage your client relationships</p>
        </div>
        <Button 
          onClick={handleAddClient}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-white"
        />
      </div>

      {/* Clients List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading clients...</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-slate-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first client to get started'}
          </p>
          {!searchTerm && (
            <Button onClick={handleAddClient} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Client
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client._id} className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.company && (
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{client.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClient(client)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowActions(showActions === client._id ? null : client._id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {/* Actions Dropdown */}
                  {showActions === client._id && (
                    <div className="absolute right-2 top-12 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
                          onClick={() => {
                            handleEditClient(client);
                            setShowActions(null);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Client
                        </button>
                        <button
                          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-600"
                          onClick={() => {
                            handleDeleteClient(client._id, client.name);
                            setShowActions(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Client
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Client Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={handleCloseModal}
        client={editingClient}
      />
    </div>
  );
};

export default ClientsSection;
