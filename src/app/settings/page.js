'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileForm from '@/features/profile/components/ProfileForm';
import PasswordChangeForm from '@/features/profile/components/PasswordChangeForm';
import { User, Lock, Bell, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal information, security preferences, and account settings.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                    activeTab === tab.id 
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-100">
               <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all">
                  <LogOut size={18} />
                  Deactivate Account
               </button>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <User size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                  </div>
                  <ProfileForm />
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                      <Shield size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Security & Password</h2>
                  </div>
                  <PasswordChangeForm />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="py-20 text-center space-y-4">
                   <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <Bell size={32} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-gray-900">Notification Settings</h3>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">Personalize how you receive updates about attendance, fees, and assignments.</p>
                   </div>
                   <div className="pt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest">
                         Coming Soon
                      </span>
                   </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
