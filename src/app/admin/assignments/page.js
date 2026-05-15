'use client';

import React, { useState, useEffect } from 'react';
import AssignmentCard from '@/features/assignments/components/AssignmentCard';
import FileUploader from '@/features/assignments/components/FileUploader';
import { Plus, Search, Filter, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setAssignments([
      { id: '1', title: 'Algebra Worksheet 1', subject: 'Mathematics', batch_name: 'Batch A', due_date: '2024-05-20', file_url: '#' },
      { id: '2', title: 'Physics Lab Report', subject: 'Physics', batch_name: 'Batch C', due_date: '2024-05-15', file_url: '#' },
    ]);
    setLoading(false);
  }, []);

  const handleUploadComplete = (fileData) => {
    // Logic to save metadata to 'assignments' table
    toast.success('Assignment details saved!');
    setShowUpload(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-500 text-sm mt-1">Upload study materials and track student submissions.</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="gap-2 shadow-lg shadow-indigo-100">
          <Plus size={18} /> New Assignment
        </Button>
      </div>

      {showUpload && (
        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Upload Assignment</h2>
            <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="e.g. Chapter 1 Quiz" />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
             </div>
          </div>

          <FileUploader bucket="assignments" onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map(assignment => (
          <AssignmentCard key={assignment.id} assignment={assignment} role="admin" />
        ))}
      </div>
    </div>
  );
}
