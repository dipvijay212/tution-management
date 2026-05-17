'use client';

import React, { useState, useEffect } from 'react';
import { teacherAttendanceService } from '@/services/teacherAttendance.service';
import { teachersService } from '@/services/teachers.service';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Users, 
  CalendarCheck2, 
  CalendarX2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Loader2
} from 'lucide-react';

export default function AdminTeacherAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: '',
    check_in: '',
    check_out: '',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, [dateFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendanceData, teachersData] = await Promise.all([
        teacherAttendanceService.getAllAttendance({
          date: dateFilter || undefined,
          status: statusFilter || undefined,
        }),
        teachersService.getAll()
      ]);
      
      setAttendanceRecords(attendanceData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Filter records locally by search query
  const filteredRecords = attendanceRecords.filter(record => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const teacherName = record.teachers?.full_name?.toLowerCase() || '';
    return teacherName.includes(searchLower);
  });

  // Calculate statistics based on current filtered records
  const totalTeachers = teachers.length;
  // If date filter is empty, stats might be for all time, but typically we want today's stats if no filter
  const statsDate = dateFilter || new Date().toLocaleDateString('en-CA');
  const todaysRecords = attendanceRecords.filter(r => r.attendance_date === statsDate);
  const presentToday = todaysRecords.filter(r => r.status === 'Present').length;
  const absentToday = todaysRecords.filter(r => r.status === 'Absent').length;
  const lateToday = todaysRecords.filter(r => r.status === 'Late').length;

  const handleEditOpen = (record) => {
    setSelectedRecord(record);
    setEditForm({
      status: record.status || '',
      check_in: record.check_in || '',
      check_out: record.check_out || '',
      remarks: record.remarks || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const updated = await teacherAttendanceService.updateAttendance(selectedRecord.id, editForm);
      setAttendanceRecords(records => records.map(r => r.id === updated.id ? { ...r, ...updated } : r));
      toast.success('Attendance updated successfully');
      setEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update attendance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      await teacherAttendanceService.deleteAttendance(selectedRecord.id);
      setAttendanceRecords(records => records.filter(r => r.id !== selectedRecord.id));
      toast.success('Attendance deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete attendance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = ['Teacher Name', 'Date', 'Status', 'Check In', 'Check Out', 'Remarks'];
    const csvRows = [headers.join(',')];

    for (const record of filteredRecords) {
      const row = [
        `"${record.teachers?.full_name || 'Unknown'}"`,
        `"${record.attendance_date}"`,
        `"${record.status || ''}"`,
        `"${record.check_in || ''}"`,
        `"${record.check_out || ''}"`,
        `"${record.remarks || ''}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `teacher_attendance_${new Date().toLocaleDateString('en-CA')}.csv`);
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage faculty attendance records.</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2 bg-white">
          <Download size={18} />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Teachers</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalTeachers}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CalendarCheck2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <h3 className="text-2xl font-bold text-gray-900">{presentToday}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <CalendarX2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Absent Today</p>
              <h3 className="text-2xl font-bold text-gray-900">{absentToday}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Late Today</p>
              <h3 className="text-2xl font-bold text-gray-900">{lateToday}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search teacher name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-sm">
                  <th className="py-4 px-6 font-semibold text-gray-600">Teacher</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Date</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Status</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Check In</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Check Out</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Remarks</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{record.teachers?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{record.teachers?.specialization || ''}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {new Date(record.attendance_date).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                        record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                        record.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{record.check_in || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{record.check_out || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 max-w-[200px] truncate" title={record.remarks}>
                      {record.remarks || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditOpen(record)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedRecord(record); setDeleteModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              icon={Filter}
              title="No Records Found"
              description="No attendance records match your current filters."
            />
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Attendance Record"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
              <input
                type="time"
                step="1"
                value={editForm.check_in}
                onChange={(e) => setEditForm({...editForm, check_in: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
              <input
                type="time"
                step="1"
                value={editForm.check_out}
                onChange={(e) => setEditForm({...editForm, check_out: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={editForm.remarks}
              onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="Add any remarks or notes..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance"
        description={`Are you sure you want to delete the attendance record for ${selectedRecord?.teachers?.full_name} on ${selectedRecord?.attendance_date}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
}
