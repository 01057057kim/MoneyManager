import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Filter,
  ArrowUpDown,
  Receipt,
  CalendarDays
} from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { useGroupStore } from '../../store/groupStore';
import { TransactionModal } from '../modals/TransactionModal';

import type { Transaction } from '../../store/transactionStore';
import type { TransactionFormData } from '../modals/TransactionModal';

interface TransactionsSectionProps {}

const TransactionsSection: React.FC<TransactionsSectionProps> = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const { activeGroup } = useGroupStore();
  const { 
    isLoading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    getFilteredTransactions,
    getStats,
    setFilter,
    setSorting
  } = useTransactionStore();

  useEffect(() => {
    const loadTransactions = async () => {
      if (activeGroup) {
        try {
          await fetchTransactions(activeGroup.id);
        } catch (error) {
          toast.error('Failed to load transactions. Please try again.');
          console.error('Error loading transactions:', error);
        }
      }
    };
    loadTransactions();
  }, [activeGroup, fetchTransactions]);

  const handleTransactionSave = async (formData: TransactionFormData) => {
    try {
      if (selectedTransaction) {
        await updateTransaction(selectedTransaction.id, {
          ...formData,
          date: new Date(formData.date),
          groupId: activeGroup!.id
        });
        toast.success('Transaction updated successfully');
      } else {
        await addTransaction({
          ...formData,
          date: new Date(formData.date),
          groupId: activeGroup!.id
        });
        toast.success('Transaction added successfully');
      }
      setShowTransactionModal(false);
      setSelectedTransaction(undefined);
    } catch (error) {
      toast.error(selectedTransaction ? 'Failed to update transaction' : 'Failed to add transaction');
      console.error('Transaction save error:', error);
    }
  };

  const handleSort = (field: keyof Transaction) => {
    setSorting(field, 'asc');
  };

  const filteredTransactions = getFilteredTransactions();
  const stats = getStats();

  return (
    <>
      <Toaster position="bottom-right" expand={false} richColors />
      <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Income</p>
              <p className="text-2xl font-bold text-green-400">
                ${stats.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Expenses</p>
              <p className="text-2xl font-bold text-red-400">
                ${stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full">
              <ArrowDownLeft className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Net Amount</p>
              <p className="text-2xl font-bold text-blue-400">
                ${stats.netAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Receipt className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            className="text-sm"
          >
            List View
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
            className="text-sm"
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setFilterOpen(!filterOpen)}
            className="text-sm"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button 
            className="text-sm"
            onClick={() => {
              setSelectedTransaction(undefined);
              setShowTransactionModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-slate-400">Type</Label>
              <select 
                className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                onChange={(e) => setFilter({ type: e.target.value as 'income' | 'expense' })}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <Label className="text-sm text-slate-400">Status</Label>
              <select 
                className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                onChange={(e) => setFilter({ status: e.target.value as 'completed' | 'pending' })}
              >
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <Label className="text-sm text-slate-400">Start Date</Label>
              <Input 
                type="date"
                className="w-full mt-1 bg-slate-700 border-slate-600 text-white"
                onChange={(e) => setFilter({ startDate: new Date(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-sm text-slate-400">End Date</Label>
              <Input 
                type="date"
                className="w-full mt-1 bg-slate-700 border-slate-600 text-white"
                onChange={(e) => setFilter({ endDate: new Date(e.target.value) })}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Transactions Table */}
      <Card className="bg-slate-800 border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="text-slate-400 cursor-pointer hover:text-white"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </TableHead>
              <TableHead 
                className="text-slate-400 cursor-pointer hover:text-white"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center">
                  Description
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </TableHead>
              <TableHead 
                className="text-slate-400 cursor-pointer hover:text-white"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </TableHead>
              <TableHead 
                className="text-slate-400 cursor-pointer hover:text-white"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center text-slate-400">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading transactions...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className="cursor-pointer hover:bg-slate-700/50"
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setShowTransactionModal(true);
                  }}
                >
                  <TableCell className="text-slate-300">
                    {transaction.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {transaction.category}
                  </TableCell>
                  <TableCell className={`font-medium ${
                    transaction.type === 'income' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    ${transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.status === 'completed'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          transaction={selectedTransaction}
          onSave={handleTransactionSave}
          onCancel={() => {
            setShowTransactionModal(false);
            setSelectedTransaction(undefined);
          }}
        />
      )}
      </div>
    </>
  );
};

export { TransactionsSection };
export type { TransactionsSectionProps };