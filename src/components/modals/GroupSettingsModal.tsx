import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGroupStore } from '../../store/groupStore';
import { 
  X, 
  Users, 
  Crown, 
  Edit, 
  Trash2, 
  AlertTriangle,
  User,
  Shield,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupSettingsModalProps {
  group: any;
  isOpen: boolean;
  onClose: () => void;
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({ group, isOpen, onClose }) => {
  const { updateMemberRole, removeMember, deleteGroup } = useGroupStore();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteGroupName, setDeleteGroupName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Check if current user is the owner
  const isOwner = group?.userRole === 'Owner';

  useEffect(() => {
    if (group && isOpen) {
      setMembers(group.members || []);
    }
  }, [group, isOpen]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setIsLoading(true);
      await updateMemberRole(group.id, memberId, { role: newRole });
      toast.success('Member role updated successfully');
      
      // Update local state
      setMembers(prev => prev.map(member => 
        member.user._id === memberId 
          ? { ...member, role: newRole }
          : member
      ));
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from this group?`)) {
      try {
        setIsLoading(true);
        await removeMember(group.id, memberId);
        toast.success('Member removed successfully');
        
        // Update local state
        setMembers(prev => prev.filter(member => member.user._id !== memberId));
      } catch (error) {
        console.error('Error removing member:', error);
        toast.error('Failed to remove member');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (deleteGroupName !== group.name) {
      toast.error('Group name does not match. Please enter the exact group name.');
      return;
    }

    try {
      setIsLoading(true);
      await deleteGroup(group.id);
      toast.success('Group deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="h-4 w-4 text-purple-400" />;
      case 'Editor':
        return <Edit className="h-4 w-4 text-blue-400" />;
      case 'Viewer':
        return <Eye className="h-4 w-4 text-slate-400" />;
      default:
        return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'text-purple-400';
      case 'Editor':
        return 'text-blue-400';
      case 'Viewer':
        return 'text-slate-400';
      default:
        return 'text-slate-400';
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-white">{group.name} Settings</h2>
                <p className="text-sm text-slate-400">Manage group members and settings</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Members Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Group Members</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-600 rounded-full">
                      <User className="h-4 w-4 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.user.name}</p>
                      <p className="text-sm text-slate-400">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Role Display/Change */}
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <span className={`text-sm font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>

                    {/* Role Change Dropdown (only for owners and non-owner members) */}
                    {isOwner && member.role !== 'Owner' && (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                        disabled={isLoading}
                        className="bg-slate-600 border-slate-500 text-white text-sm px-2 py-1 rounded"
                      >
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    )}

                    {/* Remove Member Button (only for owners and non-owner members) */}
                    {isOwner && member.role !== 'Owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.user._id, member.user.name)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone - Only for Owners */}
          {isOwner && (
            <div className="border-t border-slate-700 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </Button>
              ) : (
                <div className="space-y-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-red-400 font-medium">
                    This action cannot be undone. This will permanently delete the group and all associated data.
                  </div>
                  <div>
                    <Label htmlFor="deleteGroupName" className="text-red-400">
                      Type the group name "{group.name}" to confirm:
                    </Label>
                    <Input
                      id="deleteGroupName"
                      value={deleteGroupName}
                      onChange={(e) => setDeleteGroupName(e.target.value)}
                      placeholder={`Type "${group.name}" to confirm`}
                      className="bg-slate-700 border-slate-600 text-white mt-2"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteGroup}
                      disabled={isLoading || deleteGroupName !== group.name}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoading ? 'Deleting...' : 'Delete Group'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteGroupName('');
                      }}
                      className="border-slate-500 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Non-Owner Message */}
          {!isOwner && (
            <div className="border-t border-slate-700 pt-6">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">View Only</h3>
                <p className="text-slate-400">
                  Only group owners can manage members and group settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GroupSettingsModal;
