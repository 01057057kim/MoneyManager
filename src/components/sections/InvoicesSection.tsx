import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useClientStore } from '../../store/clientStore';
import { useProjectStore } from '../../store/projectStore';
import { useGroupStore } from '../../store/groupStore';
import InvoiceModal from '../modals/InvoiceModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const InvoicesSection = () => {
  const { activeGroup } = useGroupStore();
  const { invoices, isLoading, fetchInvoices, deleteInvoice, markAsPaid } = useInvoiceStore();
  const { clients } = useClientStore();
  const { projects } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      if (activeGroup) {
        try {
          await fetchInvoices(activeGroup.id);
        } catch (error) {
          console.error('Error loading invoices:', error);
          toast.error('Failed to load invoices');
        }
      }
    };
    loadInvoices();
  }, [activeGroup?.id]);

  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      try {
        await deleteInvoice(invoiceId);
        toast.success('Invoice deleted successfully');
        setShowActions(null);
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    const paidDate = new Date().toISOString().split('T')[0];
    try {
      await markAsPaid(invoiceId, paidDate);
      toast.success('Invoice marked as paid');
      setShowActions(null);
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    }
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowModal(true);
    setShowActions(null);
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-slate-400" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-400" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-slate-400';
      case 'sent':
        return 'text-blue-400';
      case 'paid':
        return 'text-green-500';
      case 'overdue':
        return 'text-red-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredInvoices = (invoices || []).filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!activeGroup) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Active Group</h3>
        <p className="text-slate-400">Please select a group to manage invoices</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-slate-400">Manage your billing and invoicing</p>
        </div>
        <Button 
          onClick={handleAddInvoice}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search invoices..."
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
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading invoices...</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
          </h3>
          <p className="text-slate-400 mb-4">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first invoice to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
             <Button onClick={handleAddInvoice} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Invoice
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => {
            const client = (clients || []).find(c => c._id === invoice.clientId);
            const project = (projects || []).find(p => p._id === invoice.projectId);
            const overdue = isOverdue(invoice.dueDate, invoice.status);
            
            return (
              <Card key={invoice._id} className={`p-4 border-slate-700 ${
                overdue ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">#{invoice.invoiceNumber}</h3>
                        <span className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                        {overdue && (
                          <span className="text-sm font-medium text-red-400">OVERDUE</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                        {client && (
                          <span>Client: {client.name}</span>
                        )}
                        {project && (
                          <span>Project: {project.name}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${invoice.total.toLocaleString()}</span>
                        </div>
                        {invoice.paidDate && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>Paid: {new Date(invoice.paidDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditInvoice(invoice)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowActions(showActions === invoice._id ? null : invoice._id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Actions Dropdown */}
                    {showActions === invoice._id && (
                      <div className="absolute right-2 top-12 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10">
                        <div className="py-1">
                          {invoice.status !== 'paid' && (
                            <button
                              className="flex items-center w-full px-3 py-2 text-sm text-green-400 hover:bg-slate-600"
                              onClick={() => {
                                handleMarkAsPaid(invoice._id);
                                setShowActions(null);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </button>
                          )}
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
                            onClick={() => {
                              handleEditInvoice(invoice);
                              setShowActions(null);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Invoice
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-600"
                            onClick={() => {
                              handleDeleteInvoice(invoice._id, invoice.invoiceNumber);
                              setShowActions(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Invoice
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

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        invoice={editingInvoice}
      />
    </div>
  );
};

export default InvoicesSection;
