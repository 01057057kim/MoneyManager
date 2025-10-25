import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useClientStore } from '../../store/clientStore';
import { useProjectStore } from '../../store/projectStore';
import { useGroupStore } from '../../store/groupStore';
import { X, FileText, Plus, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: any; // For editing existing invoice
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const InvoiceModal = ({ isOpen, onClose, invoice }: InvoiceModalProps) => {
  const { activeGroup } = useGroupStore();
  const { createInvoice, updateInvoice, isLoading } = useInvoiceStore();
  const { clients } = useClientStore();
  const { projects } = useProjectStore();
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientId: '',
    projectId: '',
    status: 'draft',
    issueDate: '',
    dueDate: '',
    paidDate: '',
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    notes: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        clientId: invoice.clientId || '',
        projectId: invoice.projectId || '',
        status: invoice.status || 'draft',
        issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : '',
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
        paidDate: invoice.paidDate ? invoice.paidDate.split('T')[0] : '',
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 0,
        taxAmount: invoice.taxAmount || 0,
        total: invoice.total || 0,
        notes: invoice.notes || ''
      });
      setItems(invoice.items || [{ description: '', quantity: 1, rate: 0, amount: 0 }]);
    } else {
      setFormData({
        invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        clientId: '',
        projectId: '',
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        paidDate: '',
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
        notes: ''
      });
      setItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
    }
  }, [invoice, isOpen]);

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  }, [items, formData.taxRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeGroup) {
      toast.error('No active group selected');
      return;
    }

    if (!formData.invoiceNumber.trim() || !formData.clientId) {
      toast.error('Invoice number and client are required');
      return;
    }

    if (items.length === 0 || items.every(item => !item.description.trim())) {
      toast.error('At least one invoice item is required');
      return;
    }

    try {
      const invoiceData = {
        ...formData,
        items: items.filter(item => item.description.trim()),
        groupId: activeGroup.id
      };

      console.log('Creating invoice with data:', invoiceData);

      if (invoice) {
        await updateInvoice(invoice._id, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        await createInvoice(invoiceData);
        toast.success('Invoice created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to save invoice: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? value as number : newItems[index].quantity;
      const rate = field === 'rate' ? value as number : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {invoice ? 'Edit Invoice' : 'Add New Invoice'}
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
                <Label htmlFor="invoiceNumber" className="text-slate-300">
                  Invoice Number *
                </Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter invoice number"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectId" className="text-slate-300">
                  Project
                </Label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                >
                  <option value="">Select a project (optional)</option>
                  {(projects || []).map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="issueDate" className="text-slate-300">
                  Issue Date
                </Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="dueDate" className="text-slate-300">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="paidDate" className="text-slate-300">
                  Paid Date
                </Label>
                <Input
                  id="paidDate"
                  name="paidDate"
                  type="date"
                  value={formData.paidDate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300">Invoice Items</Label>
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={item.amount}
                        readOnly
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="h-10 w-10 p-0 text-red-400 hover:text-red-300"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxRate" className="text-slate-300">
                  Tax Rate (%)
                </Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <Label className="text-slate-300">Subtotal</Label>
                <Input
                  value={`$${formData.subtotal.toFixed(2)}`}
                  readOnly
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Total</Label>
                <Input
                  value={`$${formData.total.toFixed(2)}`}
                  readOnly
                  className="bg-slate-600 border-slate-500 text-white font-semibold"
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
                {isLoading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
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

export default InvoiceModal;
