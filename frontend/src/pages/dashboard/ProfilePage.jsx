import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { updateUserData } from '../../redux/slices/authSlice';
import { updateProfileApi } from '../../api/userApi';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Camera,
  Edit3,
  CheckCircle2,
  Tractor,
  ShoppingCart,
  ShieldAlert,
  Save,
  Loader2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
      });
      setPreviewAvatar(user.avatar || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be under 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      let submitData;
      if (selectedFile) {
        submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('phone', formData.phone);
        submitData.append('location', formData.location);
        submitData.append('avatar', selectedFile);
      } else {
        submitData = {
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
        };
      }

      const res = await updateProfileApi(submitData);
      if (res.success && res.user) {
        dispatch(updateUserData(res.user));
        toast.success(res.message || 'Profile updated successfully! 🌱');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'farmer':
        return {
          label: 'Farmer Producer',
          icon: Tractor,
          color: 'bg-amber-50 text-amber-800 border-amber-300',
        };
      case 'admin':
        return {
          label: 'System Administrator',
          icon: ShieldAlert,
          color: 'bg-purple-50 text-purple-800 border-purple-300',
        };
      default:
        return {
          label: 'Verified Consumer',
          icon: ShoppingCart,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <DashboardLayout title="My Account Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-forest-800 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              {/* Avatar Container */}
              <div className="relative group">
                {previewAvatar ? (
                  <img
                    src={previewAvatar.startsWith('/uploads') ? `http://localhost:3333${previewAvatar}` : previewAvatar}
                    alt={user?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/90 shadow-2xl"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-950 text-emerald-100 flex items-center justify-center font-black text-3xl border-4 border-white/90 shadow-2xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Edit Photo File Button */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-1 right-1 bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-emerald-50 cursor-pointer transition-transform hover:scale-110 border border-slate-200"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Basic Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
                  <ShieldCheck className="w-5 h-5 text-emerald-300" title="Verified FarmEasy Member" />
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium">@{user?.username}</p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.color}`}>
                    <RoleIcon className="w-3.5 h-3.5" />
                    <span>{roleInfo.label}</span>
                  </span>

                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/20">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {formattedDate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Edit Toggle */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPreviewAvatar(user?.avatar || '');
                }}
                className="flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-md transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Details & Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md">
          {!isEditing ? (
            /* View Mode */
            <div className="space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-emerald-600" />
                <span>Account Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.name || 'Not provided'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {user?.phone || 'No phone number added'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location / Farm Address</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {user?.location || 'No location set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-emerald-600" />
                  <span>Update Profile Information</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">* Required fields</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">Location / Farm Address</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800"
                    placeholder="e.g. Anand, Gujarat, India"
                  />
                </div>

                {/* Protected Fields Notice */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider block">
                    Protected Account Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">Email Address (Primary Login):</span>
                      <span className="font-bold text-slate-700">{user?.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Assigned Role:</span>
                      <span className="font-bold text-slate-700 capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium pt-1">
                    🔒 Email and Role are locked for security compliance. Contact platform admin to request account role changes.
                  </p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
