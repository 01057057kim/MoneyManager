                import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGroupStore } from '../../store/groupStore';
import { useSettingsStore } from '../../store/settingsStore';
import api from '../../lib/api';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Save, 
  Eye,
  EyeOff,
  Building2,
  Users,
  Crown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const SettingsSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'group' | 'notifications' | 'security' | 'appearance'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  
  const { activeGroup, deleteGroup, leaveGroup } = useGroupStore();
  const { 
    userSettings, 
    groupSettings, 
    fetchUserSettings, 
    updateUserProfile, 
    sendEmailVerification,
    verifyEmailCode,
    send2FAVerification, 
    verify2FACode, 
    disable2FA, 
    deleteAccount, 
    fetchGroupSettings, 
    updateGroupSettings 
  } = useSettingsStore();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: ''
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    currency: 'USD',
    taxRate: 0,
    description: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    taskReminders: true,
    weeklyReports: true,
    monthlyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    passwordExpiry: 90
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark' as 'dark' | 'light' | 'auto',
    language: 'en' as 'en' | 'es' | 'fr' | 'de',
    dateFormat: 'MM/DD/YYYY' as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD',
    timezone: 'UTC'
  });

  // Fetch settings on component mount
  useEffect(() => {
    fetchUserSettings();
    if (activeGroup) {
      fetchGroupSettings(activeGroup.id);
    }
  }, [activeGroup, fetchUserSettings, fetchGroupSettings]);

  // Update form states when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setProfileForm({
        name: userSettings.name || '',
        email: userSettings.email || '',
        phone: userSettings.phone || '',
        address: userSettings.address || '',
        company: userSettings.company || ''
      });
      setNotificationSettings(userSettings.notificationSettings || {
        emailNotifications: true,
        budgetAlerts: true,
        taskReminders: true,
        weeklyReports: true,
        monthlyReports: true
      });
      setAppearanceSettings(userSettings.appearanceSettings || {
        theme: 'dark',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC'
      });
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorAuth: userSettings.twoFactorEnabled || false
      }));
    }
  }, [userSettings]);

  useEffect(() => {
    if (groupSettings) {
      setGroupForm({
        name: groupSettings.name || '',
        currency: groupSettings.currency || 'USD',
        taxRate: groupSettings.taxRate || 0,
        description: groupSettings.description || ''
      });
    }
  }, [groupSettings]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'group', label: 'Group Settings', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(profileForm);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleGroupUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeGroup) {
      try {
        await updateGroupSettings(activeGroup.id, groupForm);
      } catch (error) {
        console.error('Group update failed:', error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt('Please enter your password to confirm account deletion:');
    if (password) {
      try {
        await deleteAccount(password);
      } catch (error) {
        console.error('Account deletion failed:', error);
      }
    }
  };

  const handleEmailVerification = async () => {
    try {
      await sendEmailVerification();
      setShowEmailVerifyModal(true);
    } catch (error) {
      console.error('Failed to send email verification:', error);
    }
  };

  const handleEmailVerifyCode = async () => {
    try {
      await verifyEmailCode(emailVerificationCode);
      setShowEmailVerifyModal(false);
      setEmailVerificationCode('');
      // Now proceed to 2FA setup
      await send2FAVerification();
      setShow2FAModal(true);
    } catch (error) {
      console.error('Failed to verify email code:', error);
    }
  };

  const handle2FAEnable = async () => {
    // Check if email is verified first
    if (!userSettings?.email) {
      alert('Please set up your email address first');
      return;
    }
    await handleEmailVerification();
  };

  const handle2FAVerify = async () => {
    try {
      await verify2FACode(verificationCode);
      setShow2FAModal(false);
      setVerificationCode('');
    } catch (error) {
      console.error('Failed to verify code:', error);
    }
  };

  const handle2FADisable = async () => {
    const password = prompt('Please enter your password to disable 2FA:');
    if (password) {
      try {
        await disable2FA(password);
      } catch (error) {
        console.error('Failed to disable 2FA:', error);
      }
    }
  };


  const handleLeaveGroup = async () => {
    const groupName = prompt('Please type the group name to confirm leaving:');
    if (!groupName) return;
    
    if (groupName !== activeGroup?.name) {
      alert('Group name does not match. Please try again.');
      return;
    }

    if (confirm('Are you sure you want to leave this group? You will lose access to all group data.')) {
      try {
        await leaveGroup(activeGroup?.id || '');
        alert('Successfully left the group');
        // Navigate to dashboard after successful leave
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Leave group failed:', error);
        alert(error.response?.data?.error || 'Failed to leave group');
      }
    }
  };

  const handleDeleteGroup = async () => {
    const groupName = prompt('Please type the group name to confirm deletion:');
    if (!groupName) return;
    
    if (groupName !== activeGroup?.name) {
      alert('Group name does not match. Please try again.');
      return;
    }

    if (confirm('Are you sure you want to delete this group? This action cannot be undone and will remove all group data.')) {
      try {
        await deleteGroup(activeGroup?.id || '');
        alert('Group deleted successfully');
        // Navigate to dashboard after successful deletion
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Delete group failed:', error);
        alert(error.response?.data?.error || 'Failed to delete group');
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await api.put(`/groups/${activeGroup?.id}/members/${userId}/role`, { role: newRole });
        alert(`Successfully changed user role to ${newRole}`);
        window.location.reload();
      } catch (error: any) {
        console.error('Failed to change member role:', error);
        alert(error.response?.data?.error || 'Failed to change member role');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                      {!userSettings?.emailVerified && (
                        <div className="mt-2">
                          <span className="text-red-400 text-sm flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Email not verified</span>
                            <button
                              type="button"
                              onClick={handleEmailVerification}
                              className="text-blue-400 hover:text-blue-300 underline ml-2"
                            >
                              Click to verify
                            </button>
                          </span>
                        </div>
                      )}
                      {userSettings?.emailVerified && (
                        <div className="mt-2">
                          <span className="text-green-400 text-sm flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Email verified</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-white">Company</Label>
                      <Input
                        id="company"
                        value={profileForm.company}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Input
                      id="address"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Update Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Group Settings */}
          {activeTab === 'group' && (
            <div className="space-y-6">
              {!activeGroup ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Active Group</h3>
                    <p className="text-slate-400 mb-4">Please select a group to manage its settings</p>
                  </CardContent>
                </Card>
              ) : (
              <>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Group Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGroupUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="groupName" className="text-white">Group Name</Label>
                        <Input
                          id="groupName"
                          value={groupForm.name}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-white">Currency</Label>
                        <select
                          id="currency"
                          value={groupForm.currency}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, currency: e.target.value }))}
                          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                          <option value="CAD">CAD</option>
                          <option value="AUD">AUD</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="taxRate" className="text-white">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          step="0.01"
                          value={groupForm.taxRate}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Input
                        id="description"
                        value={groupForm.description}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Update Group
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Group Members */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Group Members</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeGroup?.members?.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {member.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{member.user.name}</div>
                            <div className="text-slate-400 text-sm">{member.user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.role === 'Owner' && <Crown className="h-4 w-4 text-yellow-500" />}
                          <span className={`text-sm px-2 py-1 rounded ${
                            member.role === 'Owner' ? 'bg-yellow-500/20 text-yellow-400' :
                            member.role === 'Editor' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {member.role}
                          </span>
                          {activeGroup?.userRole === 'Owner' && member.role !== 'Owner' && (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                              className="text-xs bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white"
                            >
                              <option value="Viewer">Viewer</option>
                              <option value="Editor">Editor</option>
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone - Only show for non-owners */}
              {activeGroup?.userRole !== 'Owner' && (
                <Card className="bg-slate-800 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Danger Zone</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Leave Group</h3>
                          <p className="text-slate-400 text-sm">You will lose access to all group data</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleLeaveGroup}
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          Leave Group
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Owner Actions - Only show for owners */}
              {activeGroup?.userRole === 'Owner' && (
                <Card className="bg-slate-800 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Owner Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Delete Group</h3>
                          <p className="text-slate-400 text-sm">This action cannot be undone</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleDeleteGroup}
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          Delete Group
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              </>
              )}
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Email Notifications</h3>
                        <p className="text-slate-400 text-sm">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Budget Alerts</h3>
                        <p className="text-slate-400 text-sm">Get notified when budgets are exceeded</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.budgetAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, budgetAlerts: e.target.checked }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Task Reminders</h3>
                        <p className="text-slate-400 text-sm">Get reminded about upcoming tasks</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.taskReminders}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, taskReminders: e.target.checked }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Weekly Reports</h3>
                        <p className="text-slate-400 text-sm">Receive weekly financial summaries</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReports}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Monthly Reports</h3>
                        <p className="text-slate-400 text-sm">Receive monthly financial summaries</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.monthlyReports}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, monthlyReports: e.target.checked }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                        <p className="text-slate-400 text-sm">Add an extra layer of security</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${securitySettings.twoFactorAuth ? 'text-green-400' : 'text-slate-400'}`}>
                          {securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                        </span>
                        {securitySettings.twoFactorAuth ? (
                          <Button
                            onClick={handle2FADisable}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            Disable
                          </Button>
                        ) : (
                          <Button
                            onClick={handle2FAEnable}
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-400 hover:bg-green-500/10"
                          >
                            Enable 2FA
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Login Alerts</h3>
                        <p className="text-slate-400 text-sm">Get notified of new login attempts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={securitySettings.loginAlerts}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAlerts: e.target.checked }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-6">
                    <h3 className="text-white font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            className="bg-slate-700 border-slate-600 text-white pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="text-white">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-red-500/20 pt-6">
                    <h3 className="text-red-400 font-medium mb-4">Delete Account</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleDeleteAccount}
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme" className="text-white">Theme</Label>
                      <select
                        id="theme"
                        value={appearanceSettings.theme}
                        onChange={(e) => setAppearanceSettings(prev => ({ ...prev, theme: e.target.value as 'dark' | 'light' | 'auto' }))}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="language" className="text-white">Language</Label>
                      <select
                        id="language"
                        value={appearanceSettings.language}
                        onChange={(e) => setAppearanceSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'fr' | 'es' | 'de' }))}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dateFormat" className="text-white">Date Format</Label>
                      <select
                        id="dateFormat"
                        value={appearanceSettings.dateFormat}
                        onChange={(e) => setAppearanceSettings(prev => ({ ...prev, dateFormat: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' }))}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone" className="text-white">Timezone</Label>
                      <select
                        id="timezone"
                        value={appearanceSettings.timezone}
                        onChange={(e) => setAppearanceSettings(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Email Verification Modal */}
      {showEmailVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Verify Your Email Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300">
                  Before enabling Two-Factor Authentication, we need to verify your email address. 
                  We've sent a 6-digit verification code to <strong>{userSettings?.email}</strong>.
                </p>
                <div>
                  <Label htmlFor="emailVerificationCode" className="text-white">Email Verification Code</Label>
                  <Input
                    id="emailVerificationCode"
                    value={emailVerificationCode}
                    onChange={(e) => setEmailVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="bg-slate-700 border-slate-600 text-white text-center text-lg tracking-widest"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEmailVerifyModal(false);
                      setEmailVerificationCode('');
                    }}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEmailVerifyCode}
                    disabled={emailVerificationCode.length !== 6}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    Verify Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Verify Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300">
                  Great! Your email has been verified. Now we've sent a 6-digit verification code to your email address to complete the 2FA setup.
                </p>
                <div>
                  <Label htmlFor="verificationCode" className="text-white">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="bg-slate-700 border-slate-600 text-white text-center text-lg tracking-widest"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShow2FAModal(false);
                      setVerificationCode('');
                    }}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handle2FAVerify}
                    disabled={verificationCode.length !== 6}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    Verify & Enable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsSection;
