'use client';

import React from 'react';
import { User, Trophy, AlertCircle, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

const MarksEntryTable = ({ students = [], marks = {}, onMarkChange, onSave, maxMarks, isLoading }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Marks Obtained</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Percentage</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((student, index) => {
              const currentMarks = marks[student.id] || '';
              const percentage = currentMarks ? ((parseFloat(currentMarks) / maxMarks) * 100).toFixed(1) : 0;
              const isPass = percentage >= 40;

              return (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-amber-100 text-amber-700 ring-2 ring-amber-200" :
                      index === 1 ? "bg-slate-200 text-slate-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                    )}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {student.full_name?.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                       <input 
                        type="number" 
                        max={maxMarks}
                        value={currentMarks}
                        onChange={(e) => onMarkChange(student.id, e.target.value)}
                        className="w-20 text-center px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="text-xs text-gray-400 font-medium">/ {maxMarks}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={cn(
                      "text-sm font-bold",
                      isPass ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      isPass ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {isPass ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 bg-slate-50 flex justify-between items-center">
         <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Trophy size={18} className="text-amber-500" />
            Top performer: <span className="text-gray-900 font-bold">{students[0]?.full_name || 'N/A'}</span>
         </div>
         <Button onClick={onSave} disabled={isLoading} className="gap-2 shadow-lg shadow-indigo-100">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Results
         </Button>
      </div>
    </div>
  );
};

export default MarksEntryTable;
