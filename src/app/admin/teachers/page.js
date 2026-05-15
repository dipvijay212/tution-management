'use client';

import React, { useState, useEffect } from 'react';
import TeacherTable from '@/features/teachers/components/TeacherTable';
import { teachersService } from '@/services/teachers.service';
import toast from 'react-hot-toast';

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teachersService.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to fetch teachers from database');
      // Fallback removed for production readiness
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this teacher?')) {
      try {
        await teachersService.delete(id);
        toast.success('Teacher removed successfully');
        fetchTeachers();
      } catch (error) {
        toast.error('Failed to remove teacher');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your faculty, their specializations, and credentials.</p>
        </div>
      </div>

      <TeacherTable 
        teachers={teachers} 
        onDelete={handleDelete} 
        isLoading={loading} 
      />
    </div>
  );
}
