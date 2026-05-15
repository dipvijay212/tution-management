'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  LayoutGrid, 
  IndianRupee,
  CalendarDays,
  Activity,
  UserPlus,
  CreditCard
} from 'lucide-react';
import StatCard from '@/features/admin/components/StatCard';
import AttendanceChart from '@/features/admin/components/AttendanceChart';
import RecentActivities from '@/features/admin/components/RecentActivities';
import UpcomingClasses from '@/features/admin/components/UpcomingClasses';
import { studentsService } from '@/services/students.service';
import { teachersService } from '@/services/teachers.service';
import { batchesService } from '@/services/batches.service';

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: { students: 0, teachers: 0, batches: 0, revenue: '2.4L' },
    upcomingClasses: [],
    activities: [],
    loading: true
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true }));
        
        // Fetch stats and batches in parallel
        const [studentCount, teacherCount, batchCount, batches] = await Promise.all([
          studentsService.getCount(),
          teachersService.getCount(),
          batchesService.getCount(),
          batchesService.getAll()
        ]);

        // Mock activities based on real data if needed, but for now we'll use a mix
        const mockActivities = [
          {
            id: 1,
            type: 'enrollment',
            title: 'New Student Enrolled',
            description: 'Latest student joined the system',
            time: 'Just now',
            icon: UserPlus,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            id: 2,
            type: 'payment',
            title: 'Fee Payment',
            description: 'Monthly fee received',
            time: '2 hours ago',
            icon: CreditCard,
            color: 'text-indigo-600 bg-indigo-50',
          }
        ];

        setData({
          stats: {
            students: studentCount,
            teachers: teacherCount,
            batches: batchCount,
            revenue: '2.4L'
          },
          upcomingClasses: batches.slice(0, 3), // Show first 3 batches as upcoming
          activities: mockActivities,
          loading: false
        });
      } catch (error) {
        console.error('[Dashboard] Critical load error:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening with your tuition center today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Students" 
          value={data.stats.students} 
          icon={GraduationCap} 
          trend="up" 
          trendValue="12"
          color="indigo"
          isLoading={data.loading}
        />
        <StatCard 
          title="Total Teachers" 
          value={data.stats.teachers} 
          icon={Users} 
          trend="up" 
          trendValue="5"
          color="violet"
          isLoading={data.loading}
        />
        <StatCard 
          title="Active Batches" 
          value={data.stats.batches} 
          icon={LayoutGrid} 
          color="amber"
          isLoading={data.loading}
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`₹${data.stats.revenue}`} 
          icon={IndianRupee} 
          trend="up" 
          trendValue="8"
          color="emerald"
          isLoading={data.loading}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Activity size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Attendance Analytics</h2>
              </div>
              <select className="text-sm border-none bg-gray-50 rounded-lg focus:ring-0 cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <AttendanceChart />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <CalendarDays size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Upcoming Classes</h2>
              </div>
            <UpcomingClasses classes={data.upcomingClasses} isLoading={data.loading} />
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
            </div>
            <RecentActivities activities={data.activities} isLoading={data.loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
