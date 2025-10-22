import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import OverviewSection from '../components/sections/OverviewSection';
import GroupsSection from '../components/sections/GroupsSection';
import { TransactionsSection } from '../components/sections/TransactionsSection';
import BudgetsSection from '../components/sections/BudgetsSection';
import { 
  Plus, 
  Key, 
  Building2, 
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [createForm, setCreateForm] = useState({
    name: '',
    currency: 'USD',
    taxRate: 0
  });
  const [joinForm, setJoinForm] = useState({
    inviteKey: ''
  });

  const { user } = useAuthStore();
  const { activeGroup, isLoading, fetchGroups, createGroup, joinGroup } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent<{ section: string }>) => {
      setActiveSection(event.detail.section);
    };

    window.addEventListener('section-change', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('section-change', handleSectionChange as EventListener);
    };
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', currency: 'USD', taxRate: 0 });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinGroup(joinForm);
      setShowJoinModal(false);
      setJoinForm({ inviteKey: '' });
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  return (
    <div className="flex-1 bg-slate-800 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              {activeGroup ? (
                <>
                  {activeGroup.name}
                  <span className="ml-3 text-sm bg-blue-600 px-2 py-1 rounded">
                    {activeGroup.userRole}
                  </span>
                </>
              ) : (
                'Welcome'
              )}
            </h1>
            <p className="text-slate-300 mt-1">
              {activeGroup ? (
                <span className="flex items-center space-x-3">
                  <span>{activeGroup.currency}</span>
                  <span>•</span>
                  <span>Tax Rate: {activeGroup.taxRate}%</span>
                  <span>•</span>
                  <span>{activeGroup.memberCount} members</span>
                </span>
              ) : (
                `Welcome back, ${user?.name}! Select or create a group to get started.`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : !activeGroup ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Groups Yet</h2>
              <p className="text-slate-300 mb-8">
                Get started by creating a new group or joining an existing one to manage your finances together.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Group
                </Button>
                
                <Button
                  onClick={() => setShowJoinModal(true)}
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                  size="lg"
                >
                  <Key className="mr-2 h-5 w-5" />
                  Join Existing Group
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Section Content */}
            {activeSection === 'overview' && activeGroup && <OverviewSection />}
            {activeSection === 'groups' && <GroupsSection />}
            {activeSection === 'transactions' && activeGroup && <TransactionsSection />}
            {activeSection === 'budgets' && activeGroup && <BudgetsSection />}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Group</CardTitle>
              <CardDescription className="text-slate-300">
                Set up a new workspace for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName" className="text-slate-200">Group Name</Label>
                  <Input
                    id="groupName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter group name"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-slate-200">Currency</Label>
                  <select
                    id="currency"
                    value={createForm.currency}
                    onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate" className="text-slate-200">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={createForm.taxRate}
                    onChange={(e) => setCreateForm({ ...createForm, taxRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Create Group
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Join Existing Group</CardTitle>
              <CardDescription className="text-slate-300">
                Enter the invite key to join a group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteKey" className="text-slate-200">Invite Key</Label>
                  <Input
                    id="inviteKey"
                    value={joinForm.inviteKey}
                    onChange={(e) => setJoinForm({ ...joinForm, inviteKey: e.target.value })}
                    placeholder="Enter invite key"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Join Group
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
