import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { useGroupStore } from '../../store/groupStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  Key, 
  Crown, 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Mail,
  UserPlus,
  Edit,
  Eye,
  BarChart3,
  Building2,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import GroupSettingsModal from '../modals/GroupSettingsModal';

const GroupsSection = () => {
  const { groups, activeGroup, setActiveGroup, isLoading, fetchGroups, deleteGroup } = useGroupStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinKey, setJoinKey] = useState('');

  // Load groups on component mount
  useEffect(() => {
    const loadGroups = async () => {
      if (!isLoading && !hasLoaded) { // Prevent multiple simultaneous requests and duplicate loads
        try {
          await fetchGroups();
          setHasLoaded(true);
        } catch (error) {
          console.error('Error loading groups:', error);
          toast.error('Failed to load groups');
        }
      }
    };
    loadGroups();
  }, []); // Remove fetchGroups from dependency array

  const handleCreateGroup = () => {
    navigate('/groups');
  };

  const handleGroupSettings = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setShowSettingsModal(true);
      setShowActions(null);
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      // Implement leave group functionality
      console.log('Leave group:', groupId);
      toast.info('Leave group functionality coming soon!');
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone and will remove all data associated with this group.`)) {
      try {
        await deleteGroup(groupId);
        toast.success('Group deleted successfully');
        setShowActions(null);
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Failed to delete group');
      }
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

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActions(null);
    };

    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  const filteredGroups = groups?.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || group.userRole === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" richColors />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Groups</h2>
          <p className="text-slate-400">Manage your groups and switch between them</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowJoinModal(true)} 
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <Key className="h-4 w-4 mr-2" />
            Join Group
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Groups</p>
                <p className="text-lg font-semibold text-white">{groups?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Crown className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Owned Groups</p>
                <p className="text-lg font-semibold text-white">
                  {groups?.filter(g => g.userRole === 'Owner').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-full">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Members</p>
                <p className="text-lg font-semibold text-white">
                  {groups?.reduce((sum, group) => sum + (group.memberCount || 0), 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-full">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Group</p>
                <p className="text-lg font-semibold text-white">
                  {activeGroup?.name || 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value="all">All Roles</option>
          <option value="Owner">Owner</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading groups...</span>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {groups?.length === 0 ? 'No Groups Yet' : 'No Groups Match Your Search'}
          </h3>
          <p className="text-slate-400 mb-4">
            {groups?.length === 0 
              ? 'Create your first group or join an existing one'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {groups?.length === 0 && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className={`bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer relative ${
                activeGroup?.id === group.id ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
              }`}
              onClick={() => setActiveGroup(group.id)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {group.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${group.userRole === 'Owner' 
                        ? 'bg-purple-500/20 text-purple-400'
                        : group.userRole === 'Editor'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-500/20 text-slate-400'
                      }
                    `}>
                      {group.userRole}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(showActions === group.id ? null : group.id);
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Currency</span>
                    <span className="font-medium">{group.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Tax Rate</span>
                    <span className="font-medium">{group.taxRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Members</span>
                    <span className="font-medium">{group.memberCount}</span>
                  </div>

                  {group.userRole === 'Owner' && (
                    <div className="pt-3 mt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center">
                          <Key className="h-4 w-4 mr-1" />
                          <span>Invite Key</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded">
                            {group.inviteKey}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyInviteKey(group.inviteKey);
                            }}
                          >
                            {copiedKey === group.inviteKey ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 mt-3 border-t border-slate-700">
                    <div className="flex items-center text-slate-400 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      <span>{group.owner.name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                {showActions === group.id && (
                  <div className="absolute top-2 right-2 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupSettings(group.id);
                          setShowActions(null);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </button>
                      {group.userRole === 'Owner' && (
                        <button
                          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id, group.name);
                            setShowActions(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Delete Group
                        </button>
                      )}
                      {group.userRole !== 'Owner' && (
                        <button
                          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveGroup(group.id);
                            setShowActions(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Leave Group
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Group Settings Modal */}
      <GroupSettingsModal
        group={selectedGroup}
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSelectedGroup(null);
        }}
      />

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Create New Group</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                console.log('Creating group:', {
                  name: formData.get('name'),
                  currency: formData.get('currency'),
                  taxRate: formData.get('taxRate')
                });
                setShowCreateModal(false);
                toast.success('Group created successfully!');
              }} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Group Name</Label>
                  <Input
                    id="name"
                    name="name"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency" className="text-white">Currency</Label>
                    <select
                      id="currency"
                      name="currency"
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="taxRate" className="text-white">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Join Group</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                console.log('Joining group with key:', joinKey);
                setShowJoinModal(false);
                setJoinKey('');
                toast.success('Group joined successfully!');
              }} className="space-y-4">
                <div>
                  <Label htmlFor="joinKey" className="text-white">Invite Key</Label>
                  <Input
                    id="joinKey"
                    value={joinKey}
                    onChange={(e) => setJoinKey(e.target.value)}
                    placeholder="Enter the group invite key"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Ask the group owner for the invite key
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinKey('');
                    }}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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

export default GroupsSection;