'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Edit2, Trash2, Search, Filter, Phone, MapPin, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

const StudentTable = ({ students = [], onDelete, isLoading }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header / Filters */}
      <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" className="flex-1 sm:flex-none gap-2">
            <Filter size={16} /> Filter
          </Button>
          <Link href="/admin/students/create" className="flex-1 sm:flex-none">
            <Button size="sm" className="w-full">Add Student</Button>
          </Link>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Class & School</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Parent Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.length > 0 ? students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                      {student.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{student.full_name}</p>
                      <p className="text-xs text-gray-500">{student.student_code || 'No Code'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-700">{student.class_name}</p>
                  <p className="text-xs text-gray-500">{student.school_name}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-700">{student.parent_name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={12} /> {student.parent_phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" /> {student.phone}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[150px]">
                    <MapPin size={12} className="text-gray-400" /> {student.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/students/${student.id}`}>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Profile">
                        <Eye size={18} />
                      </button>
                    </Link>
                    <Link href={`/admin/students/edit/${student.id}`}>
                      <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                        <Edit2 size={18} />
                      </button>
                    </Link>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                      title="Delete"
                      onClick={() => onDelete(student.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-indigo-600" size={20} />
                      <span>Loading students...</span>
                    </div>
                  ) : 'No students found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">Showing {students.length} students</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="h-8 px-3" disabled>Previous</Button>
          <Button variant="secondary" size="sm" className="h-8 px-3" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
