'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const PasswordChangeForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ 
        password: formData.newPassword 
      });

      if (error) throw error;
      toast.success('Password changed successfully!');
      setFormData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
         <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm">
            <ShieldCheck size={24} />
         </div>
         <div>
            <p className="text-sm font-bold text-amber-900">Security Recommendation</p>
            <p className="text-xs text-amber-700 mt-0.5">Use a password that is at least 12 characters long and contains numbers.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">New Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} className="px-8 shadow-lg shadow-indigo-100 bg-gray-900 hover:bg-black">
            {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
