'use client';

import React from 'react';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

const AttendanceMarker = ({ students = [], attendanceData = {}, onMark, isLoading }) => {
  const statusColors = {
    present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    absent: 'bg-rose-100 text-rose-700 border-rose-200',
    leave: 'bg-amber-100 text-amber-700 border-amber-200',
    unmarked: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Quick Mark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((student) => {
              const currentStatus = attendanceData[student.id] || 'unmarked';
              
              return (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                        {student.full_name?.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider",
                      statusColors[currentStatus]
                    )}>
                      {currentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onMark(student.id, 'present')}
                        className={cn(
                          "p-2 rounded-xl border transition-all",
                          currentStatus === 'present' ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-400 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                        )}
                        title="Mark Present"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => onMark(student.id, 'absent')}
                        className={cn(
                          "p-2 rounded-xl border transition-all",
                          currentStatus === 'absent' ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-400 border-gray-200 hover:border-rose-500 hover:text-rose-600"
                        )}
                        title="Mark Absent"
                      >
                        <X size={18} />
                      </button>
                      <button 
                        onClick={() => onMark(student.id, 'leave')}
                        className={cn(
                          "p-2 rounded-xl border transition-all",
                          currentStatus === 'leave' ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-400 border-gray-200 hover:border-amber-500 hover:text-amber-500"
                        )}
                        title="Mark Leave"
                      >
                        <Clock size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {students.length === 0 && !isLoading && (
        <div className="py-20 text-center text-gray-500">
          No students found in this batch.
        </div>
      )}
    </div>
  );
};

export default AttendanceMarker;
