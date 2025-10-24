import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGroupStore } from '../../store/groupStore';
import { Users, Key, Crown, Plus, Settings, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GroupsSection = () => {
  const { groups, activeGroup, setActiveGroup } = useGroupStore();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleCreateGroup = () => {
    navigate('/groups');
  };

  const handleGroupSettings = (groupId: string) => {
    // Navigate to group settings or show settings modal
    console.log('Settings for group:', groupId);
  };

  const handleLeaveGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      // Implement leave group functionality
      console.log('Leave group:', groupId);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Groups</h2>
          <p className="text-slate-400">Manage your groups and switch between them</p>
        </div>
        <Button onClick={handleCreateGroup} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {groups?.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Groups Yet</h3>
          <p className="text-slate-400 mb-4">Create your first group or join an existing one</p>
          <Button onClick={handleCreateGroup} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Group
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups?.map((group) => (
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
                        <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded">
                          {group.inviteKey}
                        </span>
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
    </div>
  );
};

export default GroupsSection;