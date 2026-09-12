import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { logout } from '../../redux/slices/authSlice';
import {
  changePasswordApi,
  updatePreferencesApi,
  deleteAccountApi,
} from '../../api/userApi';
import {
  Settings,
  Lock,
  Sun,
  Moon,
  Monitor,
  Bell,
  Mail,
  ShieldAlert,
  LogOut,
  Trash2,
  Check,
  Save,
  Loader2,
  AlertTriangle,
  KeyRound,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('security');

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'light',
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    orderNotifications: user?.preferences?.orderNotifications ?? true,
    promotionalEmails: user?.preferences?.promotionalEmails ?? false,
  });
  const [prefLoading, setPrefLoading] = useState(false);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePasswordApi({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(res.message || 'Password changed successfully! 🔐');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password Change Error:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Preferences Save
  const handleSavePreferences = async (newPrefs = preferences) => {
    setPrefLoading(true);
    try {
      const res = await updatePreferencesApi(newPrefs);
      toast.success(res.message || 'Preferences updated! ⚙️');
      setPreferences(res.preferences || newPrefs);
    } catch (err) {
      console.error('Preferences Error:', err);
      toast.error(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setPrefLoading(false);
    }
  };

  const handleTogglePref = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    handleSavePreferences(updated);
  };

  const handleThemeChange = (theme) => {
    const updated = { ...preferences, theme };
    setPreferences(updated);
    handleSavePreferences(updated);
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      await deleteAccountApi({ password: deleteConfirmPassword });
      toast.success('Account permanently deleted');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error('Delete Account Error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'preferences', label: 'App Preferences', icon: SlidersHorizontal },
    { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
  ];

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Settings className="w-7 h-7 text-emerald-600" />
              <span>System & Security Settings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage your password, login sessions, notification alerts, and application preferences
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Security & Password */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-emerald-600" />
                    <span>Change Account Password</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ensure your account is using a long, random password to stay secure
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800"
                    placeholder="••••••••••••"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Session Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Current Session</h4>
                <p className="text-xs text-slate-500 mt-0.5">Logged in as {user?.email}</p>
              </div>

              <button
                onClick={() => {
                  dispatch(logout());
                  toast.success('Logged out successfully');
                  navigate('/login');
                }}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: App Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Theme Preference */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Display Theme Mode</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                    preferences.theme === 'light'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="text-xs font-bold">Light Mode</span>
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                    preferences.theme === 'dark'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs font-bold">Dark Mode</span>
                </button>

                <button
                  onClick={() => handleThemeChange('system')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                    preferences.theme === 'system'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Monitor className="w-6 h-6 text-slate-600" />
                  <span className="text-xs font-bold">System Default</span>
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <span>Notification Preferences</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">Email Alerts</span>
                    <span className="text-[11px] text-slate-500 block">Receive account security and system notification emails</span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('emailNotifications')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      preferences.emailNotifications ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.emailNotifications ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">Order Status Updates</span>
                    <span className="text-[11px] text-slate-500 block">Get instant updates when crop orders change status</span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('orderNotifications')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      preferences.orderNotifications ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.orderNotifications ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">Promotional Deals & Newsletters</span>
                    <span className="text-[11px] text-slate-500 block">Receive seasonal crop offers and farming advisory updates</span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('promotionalEmails')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      preferences.promotionalEmails ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.promotionalEmails ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="bg-red-50/60 rounded-3xl p-6 sm:p-8 border border-red-200 space-y-6">
            <div className="flex items-start space-x-3 text-red-800">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-black">Danger Zone: Account Deactivation</h3>
                <p className="text-xs text-red-600 mt-1">
                  Once you delete your account, there is no going back. All listed produce, order history, and saved wishlist items will be permanently removed.
                </p>
              </div>
            </div>

            {!showDeleteModal ? (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account Permanently</span>
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} className="p-5 rounded-2xl bg-white border border-red-200 space-y-4 max-w-md">
                <span className="text-xs font-bold text-red-900 block">
                  Enter your password to confirm permanent account deletion:
                </span>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-red-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Enter current password"
                  required
                />
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={deleteLoading}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Confirm Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
