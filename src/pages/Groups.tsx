import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useGroupStore } from '../store/groupStore';
import type { CreateGroupData, JoinGroupData } from '../types';

const Groups = () => {
  const navigate = useNavigate();
  const { groups, createGroup, joinGroup } = useGroupStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
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
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsJoining(true);
      await joinGroup(joinData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to join group:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Groups</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Create New Group */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Create New Group</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={newGroup.currency}
                onChange={(e) => setNewGroup({ ...newGroup, currency: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                {/* Add more currency options as needed */}
              </select>
            </div>
            
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newGroup.taxRate}
                onChange={(e) => setNewGroup({ ...newGroup, taxRate: Number(e.target.value) })}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </Card>

        {/* Join Existing Group */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Join Existing Group</h2>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <Label htmlFor="inviteKey">Invite Key</Label>
              <Input
                id="inviteKey"
                value={joinData.inviteKey}
                onChange={(e) => setJoinData({ ...joinData, inviteKey: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Group'}
            </Button>
          </form>
        </Card>

        {/* My Groups */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">My Groups</h2>
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              You haven't joined any groups yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id} className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Currency: {group.currency}</p>
                    <p>Tax Rate: {group.taxRate}%</p>
                    <p>Members: {group.memberCount}</p>
                    <p>Role: {group.userRole}</p>
                  </div>
                  {group.userRole === 'Owner' && (
                    <div className="mt-4">
                      <Label className="text-xs">Invite Key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={group.inviteKey}
                          readOnly
                          className="text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(group.inviteKey);
                          }}
                        >
                          Copy
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
  );
};

export default Groups;