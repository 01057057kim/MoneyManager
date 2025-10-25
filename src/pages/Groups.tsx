import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useGroupStore } from '../store/groupStore';
import { toast, Toaster } from 'sonner';
import { Copy, Check } from 'lucide-react';
import GroupSettingsModal from '../components/modals/GroupSettingsModal';
import type { CreateGroupData, JoinGroupData } from '../types';

const Groups = () => {
  const navigate = useNavigate();
  const { groups, createGroup, joinGroup, activeGroup, setActiveGroup } = useGroupStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newGroup, setNewGroup] = useState<CreateGroupData>({
    name: '',
    currency: 'USD',
    taxRate: 0
  });
  const [joinData, setJoinData] = useState<JoinGroupData>({
    inviteKey: ''
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await createGroup(newGroup);
      toast.success('Group created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsJoining(true);
      await joinGroup(joinData);
      toast.success('Successfully joined group!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to join group:', error);
      toast.error('Failed to join group');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyInviteKey = async (inviteKey: string) => {
    try {
      await navigator.clipboard.writeText(inviteKey);
      setCopiedKey(inviteKey);
      toast.success('Invite key copied to clipboard!');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy invite key:', error);
      toast.error('Failed to copy invite key');
    }
  };

  const handleGroupClick = (group: any) => {
    setSelectedGroup(group);
    setShowSettingsModal(true);
  };

  const handleGroupSwitch = (groupId: string) => {
    console.log('Groups - Switching to group:', groupId);
    setActiveGroup(groupId);
    toast.success('Group switched successfully');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster position="bottom-right" richColors />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Groups</h1>
        
        {/* Active Group Info */}
        {activeGroup && (
          <div className="mb-8 p-6 bg-slate-800 border-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Currently Active Group</h2>
              <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                Active
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400">Group Name</p>
                <p className="text-lg font-medium text-white">{activeGroup.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Currency</p>
                <p className="text-lg font-medium text-white">{activeGroup.currency}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Tax Rate</p>
                <p className="text-lg font-medium text-white">{activeGroup.taxRate}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Your Role</p>
                <p className="text-lg font-medium text-white">{activeGroup.userRole}</p>
              </div>
            </div>
          </div>
        )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Create New Group */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white">Create New Group</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-200">Group Name</Label>
              <Input
                id="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="currency" className="text-slate-200">Currency</Label>
              <select
                id="currency"
                value={newGroup.currency}
                onChange={(e) => setNewGroup({ ...newGroup, currency: e.target.value })}
                className="w-full rounded-md border border-slate-600 bg-slate-700 text-white px-3 py-2"
                required
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                {/* Add more currency options as needed */}
              </select>
            </div>
            
            <div>
              <Label htmlFor="taxRate" className="text-slate-200">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newGroup.taxRate}
                onChange={(e) => setNewGroup({ ...newGroup, taxRate: Number(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </Card>

        {/* Join Existing Group */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white">Join Existing Group</h2>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <Label htmlFor="inviteKey" className="text-slate-200">Invite Key</Label>
              <Input
                id="inviteKey"
                value={joinData.inviteKey}
                onChange={(e) => setJoinData({ ...joinData, inviteKey: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Group'}
            </Button>
          </form>
        </Card>

        {/* Active Group Data */}
        {activeGroup && (
          <Card className="p-6 md:col-span-2 bg-slate-800 border-slate-700">
            <h2 className="text-2xl font-semibold mb-6 text-white">Active Group Data</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Group Settings</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Name:</span> {activeGroup.name}</p>
                  <p><span className="text-slate-400">Currency:</span> {activeGroup.currency}</p>
                  <p><span className="text-slate-400">Tax Rate:</span> {activeGroup.taxRate}%</p>
                  <p><span className="text-slate-400">Members:</span> {activeGroup.memberCount}</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Your Access</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Role:</span> {activeGroup.userRole}</p>
                  <p><span className="text-slate-400">Permissions:</span> {
                    activeGroup.userRole === 'Owner' ? 'Full Access' :
                    activeGroup.userRole === 'Editor' ? 'Edit Access' : 'View Only'
                  }</p>
                  {activeGroup.userRole === 'Owner' && (
                    <p><span className="text-slate-400">Invite Key:</span> {activeGroup.inviteKey}</p>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGroupClick(activeGroup)}
                    className="w-full border-slate-500 text-slate-200 hover:bg-slate-600"
                  >
                    Manage Group
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="w-full border-slate-500 text-slate-200 hover:bg-slate-600"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* My Groups */}
        <Card className="p-6 md:col-span-2 bg-slate-800 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white">All My Groups</h2>
          {groups.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              You haven't joined any groups yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card 
                  key={group.id} 
                  className={`p-4 border-2 transition-colors ${
                    activeGroup?.id === group.id 
                      ? 'bg-slate-600 border-blue-500 ring-2 ring-blue-500/20' 
                      : 'bg-slate-700 border-slate-600 hover:border-blue-500 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg text-white">{group.name}</h3>
                      {activeGroup?.id === group.id && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupSwitch(group.id);
                        }}
                        className="border-slate-500 text-slate-200 hover:bg-slate-600"
                      >
                        Switch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupClick(group);
                        }}
                        className="border-slate-500 text-slate-200 hover:bg-slate-600"
                      >
                        Settings
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 space-y-1">
                    <p>Currency: {group.currency}</p>
                    <p>Tax Rate: {group.taxRate}%</p>
                    <p>Members: {group.memberCount}</p>
                    <p>Role: {group.userRole}</p>
                  </div>
                  {group.userRole === 'Owner' && (
                    <div className="mt-4">
                      <Label className="text-xs text-slate-200">Invite Key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={group.inviteKey}
                          readOnly
                          className="text-xs bg-slate-600 border-slate-500 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-500 text-slate-200 hover:bg-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyInviteKey(group.inviteKey);
                          }}
                        >
                          {copiedKey === group.inviteKey ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
      </div>

      {/* Group Settings Modal */}
      <GroupSettingsModal
        group={selectedGroup}
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSelectedGroup(null);
        }}
      />
    </div>
  );
};

export default Groups;