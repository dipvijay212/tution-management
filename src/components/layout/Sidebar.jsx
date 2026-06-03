'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Calendar, 
  ClipboardCheck, 
  IndianRupee, 
  BookOpen, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutGrid,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const Sidebar = ({ role }) => {
  const pathname = usePathname();
  const { logout, profile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { name: 'Teachers', icon: Users, path: '/admin/teachers' },
      { name: 'Students', icon: GraduationCap, path: '/admin/students' },
      { name: 'Batches', icon: LayoutGrid, path: '/admin/batches' },
      { name: 'Attendance', icon: ClipboardCheck, path: '/admin/attendance' },
      { name: 'Teacher Attendance', icon: UserCheck, path: '/admin/teacher-attendance' },
      { name: 'Fees', icon: IndianRupee, path: '/admin/fees' },
      { name: 'Exams', icon: BookOpen, path: '/admin/exams' },
      { name: 'Assignments', icon: Calendar, path: '/admin/assignments' },
      { name: 'Communication', icon: MessageSquare, path: '/admin/communication' },
    ],
    teacher: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
      { name: 'My Classes', icon: LayoutGrid, path: '/teacher/classes' },
      { name: 'Students', icon: GraduationCap, path: '/teacher/students' },
      { name: 'Attendance', icon: ClipboardCheck, path: '/teacher/attendance' },
      { name: 'Assignments', icon: Calendar, path: '/teacher/assignments' },
      { name: 'Communication', icon: MessageSquare, path: '/teacher/communication' },
    ],
    student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
      { name: 'My Courses', icon: BookOpen, path: '/student/courses' },
      { name: 'Attendance', icon: ClipboardCheck, path: '/student/attendance' },
      { name: 'Assignments', icon: Calendar, path: '/student/assignments' },
      { name: 'Billing', icon: IndianRupee, path: '/student/billing' },
      { name: 'Communication', icon: MessageSquare, path: '/student/communication' },
    ]
  };

  const currentMenu = menuItems[role] || menuItems.student;

  return (
    <aside 
      className={cn(
        "relative flex flex-col bg-[#0b0e14] text-slate-300 transition-all duration-300 border-r border-slate-800",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            T
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-white tracking-tight">TuitionPro</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {currentMenu.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} className={cn("flex-shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {!isCollapsed && isActive && (
                 <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-3 mt-auto space-y-1 border-t border-slate-800 bg-[#0b0e14]/50 backdrop-blur-xl">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white transition-all group"
        >
          <Settings size={18} className="text-slate-500 group-hover:text-indigo-400" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors shadow-xl z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;
