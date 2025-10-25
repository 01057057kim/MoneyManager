import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Repeat, 
  Plus, 
  Play,
  Edit,
  Trash2,
  Clock,
  Pause,    // need Add
  PlayCircle // need Add
} from 'lucide-react';
import { useRecurringStore } from '../../store/recurringStore';
import { useGroupStore } from '../../store/groupStore';
import { RecurringTransactionModal } from '../modals/RecurringTransactionModal';

import type { RecurringTransaction } from '../../store/recurringStore';

interface RecurringSectionProps {}

const RecurringSection: React.FC<RecurringSectionProps> = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { activeGroup } = useGroupStore();
  const { 
    recurringTransactions,
    dueTransactions,
    isLoading,
    fetchRecurringTransactions,
    fetchDueTransactions,
    deleteRecurringTransaction,
    executeRecurringTransaction,
    updateRecurringTransaction
  } = useRecurringStore();

  useEffect(() => {
    const loadData = async () => {
      if (activeGroup) {
        try {
          await Promise.all([
            fetchRecurringTransactions(activeGroup.id),
            fetchDueTransactions(activeGroup.id)
          ]);
        } catch (error) {
          console.error('Error loading recurring transactions:', error);
        }
      }
    };
    loadData();
  }, [activeGroup?.id]); // Only depend on activeGroup.id, not the functions

  const handleCreateTransaction = () => {
    setSelectedTransaction(undefined);
    setShowModal(true);
  };

  const handleEditTransaction = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await deleteRecurringTransaction(id);
        toast.success('Recurring transaction deleted successfully');
      } catch (error) {
        toast.error('Failed to delete recurring transaction');
      }
    }
  };

  const handleExecuteTransaction = async (id: string) => {
    try {
      await executeRecurringTransaction(id);
      toast.success('Recurring transaction executed successfully');
    } catch (error) {
      toast.error('Failed to execute recurring transaction');
    }
  };

  const handleToggleStatus = async (transaction: RecurringTransaction) => {
    try {
      const newStatus = !transaction.isActive;
      await updateRecurringTransaction(transaction._id, { isActive: newStatus } as any);
      toast.success(`Recurring transaction ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update transaction status');
    }
  };

  const handleSaveTransaction = async () => {
    // Refresh the data after successful save
    if (activeGroup) {
      try {
        await fetchRecurringTransactions(activeGroup.id);
        await fetchDueTransactions(activeGroup.id);
        
        toast.success(
          selectedTransaction 
            ? 'Recurring transaction updated successfully' 
            : 'Recurring transaction created successfully'
        );
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }
    
    setShowModal(false);
    setSelectedTransaction(undefined);
  };

  const filteredTransactions = recurringTransactions.filter(transaction => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && transaction.isActive) ||
      (filter === 'inactive' && !transaction.isActive);
    
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatFrequency = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return frequencyMap[frequency] || frequency;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (transaction: RecurringTransaction) => {
    if (!transaction.isActive) return 'text-gray-500';
    if (transaction.endDate && new Date(transaction.endDate) < new Date()) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusText = (transaction: RecurringTransaction) => {
    if (!transaction.isActive) return 'Inactive';
    if (transaction.endDate && new Date(transaction.endDate) < new Date()) return 'Expired';
    return 'Active';
  };

  const getStatusIcon = (transaction: RecurringTransaction) => {
    if (!transaction.isActive) return <Pause className="h-4 w-4" />;
    if (transaction.endDate && new Date(transaction.endDate) < new Date()) return <Clock className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recurring Transactions</h2>
          <p className="text-slate-400">Manage your recurring income and expenses</p>
        </div>
        <Button onClick={handleCreateTransaction} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Repeat className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Recurring</p>
              <p className="text-lg font-semibold text-white">{recurringTransactions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <Play className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active</p>
              <p className="text-lg font-semibold text-white">
                {recurringTransactions.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-full">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Due Today</p>
              <p className="text-lg font-semibold text-white">{dueTransactions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilter('inactive')}
            size="sm"
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="bg-slate-800 border-slate-700">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Title</TableHead>
              <TableHead className="text-slate-300">Amount</TableHead>
              <TableHead className="text-slate-300">Frequency</TableHead>
              <TableHead className="text-slate-300">Next Due</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                  Loading recurring transactions...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                  No recurring transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction._id} className="border-slate-700">
                  <TableCell className="text-white">
                    <div>
                      <p className="font-medium">{transaction.title}</p>
                      <p className="text-sm text-slate-400">{transaction.category}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <span className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {formatFrequency(transaction.frequency)}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {transaction.nextOccurrence ? formatDate(transaction.nextOccurrence) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction)}
                      <span className={`text-sm ${getStatusColor(transaction)}`}>
                        {getStatusText(transaction)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {transaction.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExecuteTransaction(transaction._id)}
                          className="h-8 w-8 p-0"
                          title="Execute now"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(transaction)}
                        className={`h-8 w-8 p-0 ${
                          transaction.isActive 
                            ? 'text-orange-400 hover:text-orange-300' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                        title={transaction.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {transaction.isActive ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTransaction(transaction)}
                        className="h-8 w-8 p-0"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      {showModal && (
        <RecurringTransactionModal
          transaction={selectedTransaction}
          onSave={handleSaveTransaction}
          onCancel={() => {
            setShowModal(false);
            setSelectedTransaction(undefined);
          }}
        />
      )}
    </div>
  );
};

export default RecurringSection;