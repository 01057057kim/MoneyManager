import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGroupStore } from '../../store/groupStore';
import { Users, Key, Crown } from 'lucide-react';

const GroupsSection = () => {
  const { groups, activeGroup, setActiveGroup } = useGroupStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Groups</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups?.map((group) => (
          <Card
            key={group.id}
            className={`bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer ${
              activeGroup?.id === group.id ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
            }`}
            onClick={() => setActiveGroup(group.id)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white truncate">
                  {group.name}
                </h3>
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
            </div>
          </Card>
        ))}

        {/* Create New Group Card */}
        <Card
          className="bg-slate-800 border-slate-700 border-dashed hover:border-blue-500 transition-colors cursor-pointer p-4 flex items-center justify-center"
          onClick={() => window.location.href = '/groups/new'}
        >
          <div className="text-center">
            <Button
              variant="ghost"
              size="lg"
              className="h-12 w-12 rounded-full mb-2"
            >
              <Users className="h-6 w-6 text-blue-400" />
            </Button>
            <p className="text-sm font-medium text-slate-300">Create New Group</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GroupsSection;