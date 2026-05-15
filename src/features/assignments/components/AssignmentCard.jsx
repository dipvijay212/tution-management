'use client';

import React from 'react';
import { FileText, Calendar, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

const AssignmentCard = ({ assignment, role = 'student', onAction }) => {
  const isExpired = new Date(assignment.due_date) < new Date();
  
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          <FileText size={24} />
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          isExpired ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
        )}>
          {isExpired ? 'Expired' : 'Active'}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{assignment.title}</h3>
      <p className="text-xs text-gray-500 font-medium uppercase mt-1">{assignment.subject} • {assignment.batch_name}</p>
      
      <p className="mt-4 text-sm text-gray-600 line-clamp-2">
        {assignment.description || 'No description provided for this assignment.'}
      </p>

      <div className="mt-6 flex items-center gap-6 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Calendar size={14} className="text-gray-400" />
          {formatDate(assignment.due_date)}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Clock size={14} className="text-gray-400" />
          {assignment.due_time || '11:59 PM'}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <a 
          href={assignment.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="secondary" size="sm" className="w-full gap-2">
            <Download size={16} /> Download
          </Button>
        </a>
        {role === 'student' && !isExpired && (
          <Button size="sm" className="flex-1" onClick={() => onAction(assignment)}>
            Submit
          </Button>
        )}
        {role === 'admin' && (
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-indigo-600">
            Submissions
          </Button>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
