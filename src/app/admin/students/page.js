'use client';

import React, { useState, useEffect } from 'react';
import StudentTable from '@/features/students/components/StudentTable';
import { studentsService } from '@/services/students.service';
import toast from 'react-hot-toast';

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to fetch students from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsService.delete(id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all enrolled students in your tuition center.</p>
        </div>
      </div>

      <StudentTable 
        students={students} 
        onDelete={handleDelete} 
        isLoading={loading} 
      />
    </div>
  );
}
