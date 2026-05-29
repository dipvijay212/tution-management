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
  Loader2,
  IndianRupee,
  Printer,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Percent,
  Calculator,
  FileDown
} from 'lucide-react';

const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window is not defined'));
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export default function AdminTeacherAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'salary'
  
  // Attendance Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Salary Month & Year Selector
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Salary Penalty & Policy Weights
  const [lateWeight, setLateWeight] = useState(1.0); // 1.0 (No penalty), 0.9, 0.8, 0.5 (Half Day)
  const [leaveWeight, setLeaveWeight] = useState(0.0); // 0.0 (Unpaid), 0.5 (Half pay), 1.0 (Paid)
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Detailed Payslip Modal state
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [selectedSalaryTeacher, setSelectedSalaryTeacher] = useState(null);
  const [modalView, setModalView] = useState('pdf'); // 'pdf' or 'standard'
  const [pdfUrl, setPdfUrl] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

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
  const statsDate = dateFilter || new Date().toLocaleDateString('en-CA');
  const todaysRecords = attendanceRecords.filter(r => r.attendance_date === statsDate);
  const presentToday = todaysRecords.filter(r => r.status === 'Present').length;
  const absentToday = todaysRecords.filter(r => r.status === 'Absent').length;
  const lateToday = todaysRecords.filter(r => r.status === 'Late').length;

  // Real-time Salary Calculator Engine
  const calculateTeacherSalary = (teacher) => {
    if (!teacher) return null;
    
    // 1. Filter attendance for this teacher in selected month and year
    const teacherRecords = attendanceRecords.filter(r => {
      if (r.teacher_id !== teacher.id) return false;
      const d = new Date(r.attendance_date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // 2. Count statuses
    const presentCount = teacherRecords.filter(r => r.status === 'Present').length;
    const absentCount = teacherRecords.filter(r => r.status === 'Absent').length;
    const lateCount = teacherRecords.filter(r => r.status === 'Late').length;
    const halfDayCount = teacherRecords.filter(r => r.status === 'Half Day').length;
    const leaveCount = teacherRecords.filter(r => r.status === 'Leave').length;

    // 3. Compute Payable Days
    const payableDays = presentCount + 
                        (lateCount * Number(lateWeight)) + 
                        (halfDayCount * 0.5) + 
                        (leaveCount * Number(leaveWeight));

    // 4. Days in Month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // 5. Daily Rate
    const baseSalary = teacher.salary || 0;
    const dailyRate = baseSalary > 0 ? (baseSalary / daysInMonth) : 0;

    // 6. Earned Salary
    const earnedSalary = Math.round(dailyRate * payableDays);

    return {
      teacherRecords,
      presentCount,
      absentCount,
      lateCount,
      halfDayCount,
      leaveCount,
      payableDays,
      daysInMonth,
      dailyRate,
      earnedSalary,
      baseSalary
    };
  };

  // Precompile premium vector PDF using jsPDF
  useEffect(() => {
    if (salaryModalOpen && selectedSalaryTeacher) {
      setGeneratingPdf(true);
      setPdfUrl(null);
      
      const timer = setTimeout(() => {
        generatePdfBlob();
      }, 300); // Super fast compile buffer
      return () => clearTimeout(timer);
    } else {
      setPdfUrl(null);
    }
  }, [salaryModalOpen, selectedSalaryTeacher, selectedMonth, selectedYear, lateWeight, leaveWeight]);

  const generatePdfBlob = async () => {
    try {
      const jspdfLib = await loadJsPDF();
      const { jsPDF } = jspdfLib;
      
      // Initialize premium vector A4 document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const calc = calculateTeacherSalary(selectedSalaryTeacher);
      if (!calc) return;

      const monthName = monthsList[selectedMonth];
      const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

      // 1. SOLID ACCENT BAR (Indigo)
      doc.setFillColor(79, 70, 229);
      doc.rect(15, 15, 180, 2.5, 'F');

      // 2. INSTITUTION TITLE & HEADER
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("TUITIONPRO ERP ACADEMY", 15, 26);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("FACULTY STATEMENT & MONTHLY EARNINGS SLIP", 15, 31);

      // 3. STATEMENT PERIOD PERIOD BADGE
      doc.setFillColor(245, 243, 255); // purple-50
      doc.setDrawColor(224, 231, 255); // indigo-100
      doc.roundedRect(138, 20, 57, 10, 1.5, 1.5, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(`${monthName.toUpperCase()} ${selectedYear}`, 166.5, 26.5, { align: "center" });

      // 4. DIVIDER LINE
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(15, 36, 195, 36);

      // 5. FACULTY & STATEMENT METADATA GRID CARDS
      // Left Card (Faculty Profile)
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.roundedRect(15, 42, 85, 30, 2, 2, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("FACULTY MEMBER", 20, 48);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(selectedSalaryTeacher.full_name, 20, 54);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(selectedSalaryTeacher.email, 20, 60);
      doc.text(selectedSalaryTeacher.specialization || "General Faculty Department", 20, 66);

      // Right Card (Payroll Details)
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(241, 245, 249);
      doc.roundedRect(110, 42, 85, 30, 2, 2, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("STATEMENT DETAILS", 115, 48);

      // Row details in Card
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      
      doc.text("Compile Date:", 115, 54);
      doc.setFont("helvetica", "bold");
      doc.text(dateStr, 190, 54, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.text("Base Salary:", 115, 60);
      doc.setFont("helvetica", "bold");
      doc.text(`Rs. ${(calc.baseSalary).toLocaleString('en-IN')}`, 190, 60, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.text("Daily Rate:", 115, 66);
      doc.setFont("helvetica", "bold");
      doc.text(`Rs. ${Math.round(calc.dailyRate).toLocaleString('en-IN')} / Day`, 190, 66, { align: "right" });

      // 6. ATTENDANCE METRICS SECTION
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("ATTENDANCE METRICS SUMMARY", 15, 80);

      // Render 5 beautiful color-coordinated rounded columns
      const colWidth = 33.5;
      const colSpacing = 3.1;
      const startX = 15;
      
      const metrics = [
        { label: "PRESENT", val: calc.presentCount, bg: [240, 253, 244], border: [187, 247, 208], text: [22, 163, 74] }, // green
        { label: "LATE ARRIVE", val: calc.lateCount, bg: [255, 251, 235], border: [254, 243, 199], text: [217, 119, 6] }, // amber
        { label: "HALF DAY", val: calc.halfDayCount, bg: [255, 247, 237], border: [255, 237, 213], text: [234, 88, 12] }, // orange
        { label: "APPROVED LV", val: calc.leaveCount, bg: [239, 246, 255], border: [219, 234, 254], text: [37, 99, 235] }, // blue
        { label: "ABSENT", val: calc.absentCount, bg: [254, 242, 242], border: [254, 226, 226], text: [220, 38, 38] } // red
      ];

      metrics.forEach((m, idx) => {
        const x = startX + (idx * (colWidth + colSpacing));
        
        // Draw card background & border
        doc.setFillColor(m.bg[0], m.bg[1], m.bg[2]);
        doc.setDrawColor(m.border[0], m.border[1], m.border[2]);
        doc.roundedRect(x, 83, colWidth, 20, 1.5, 1.5, 'FD');

        // Draw Metric Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(m.text[0], m.text[1], m.text[2]);
        doc.text(m.label, x + (colWidth / 2), 88, { align: "center" });

        // Draw Metric Count
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(String(m.val), x + (colWidth / 2), 97, { align: "center" });
      });

      // 7. CALCULATION DETAILS & TABLE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("PAYROLL STATEMENT CALCULATION BREAKDOWN", 15, 111);

      // Table Header Row
      doc.setFillColor(241, 245, 249); // slate-100 background
      doc.rect(15, 114, 180, 7.5, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("CALCULATION PARAMETER / DESCRIPTION", 18, 119);
      doc.text("MULTIPLIER / METRIC", 110, 119);
      doc.text("SUBTOTAL AMOUNT", 190, 119, { align: "right" });

      let currentY = 127;
      const rows = [
        { desc: "Base Monthly Roster Salary", metric: "-", val: `Rs. ${calc.baseSalary.toLocaleString('en-IN')}` },
        { desc: "Total Days in Calendar Month", metric: `${calc.daysInMonth} Days`, val: "-" },
        { desc: "Calculated Daily Pro-Rata Rate", metric: "-", val: `Rs. ${calc.dailyRate.toFixed(2)} / Day` },
        { desc: "Net Payable Attendance Work Days", metric: `${calc.payableDays.toFixed(2)} Days`, val: "-", isBold: true },
        { desc: "  * Policy Penalty Weights Applied", metric: `Late: ${lateWeight}x | Leave: ${leaveWeight}x`, val: "-", isItalic: true }
      ];

      rows.forEach(r => {
        // Draw bottom row divider line
        doc.setDrawColor(241, 245, 249);
        doc.line(15, currentY + 2, 195, currentY + 2);

        if (r.isItalic) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
        } else {
          doc.setFont("helvetica", r.isBold ? "bold" : "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
        }

        doc.text(r.desc, 18, currentY);

        if (!r.isItalic) {
          doc.setFont("helvetica", r.isBold ? "bold" : "normal");
          doc.text(r.metric, 110, currentY);
          doc.setFont("helvetica", "bold");
          doc.text(r.val, 190, currentY, { align: "right" });
        }

        currentY += 7.5;
      });

      // 8. TOTAL PAYROLL BANNER CARD (Green accent)
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(167, 243, 208); // emerald-200
      doc.roundedRect(15, 172, 180, 18, 2, 2, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(6, 95, 70); // emerald-800
      doc.text("TOTAL NET PAYROLL EARNED", 22, 179);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("Automatic attendance-based net payable salary", 22, 184);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(4, 120, 87); // emerald-700
      const earnedStr = `Rs. ${calc.earnedSalary.toLocaleString('en-IN')}`;
      doc.text(earnedStr, 188, 183.5, { align: "right" });

      // 9. SIGNATURE BLOCKS
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.line(15, 218, 65, 218);
      doc.line(145, 218, 195, 218);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("FACULTY MEMBER SIGNATURE", 15, 223);
      
      const adminSigText = "ADMINISTRATOR AUTHORIZATION";
      doc.text(adminSigText, 195, 223, { align: "right" });

      // 10. SYSTEM FOOTER
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("This is a system-generated electronic payroll receipt statement compiled dynamically by TuitionPro ERP.", 105, 260, { align: "center" });

      // Generate Blob URL and hold in component state
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to compile PDF. Please switch to Standard View.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Download compiled PDF blob URL directly
  const handleDownloadPDF = () => {
    if (!pdfUrl || !selectedSalaryTeacher) {
      toast.error('PDF is not ready yet!');
      return;
    }
    const cleanName = selectedSalaryTeacher.full_name.replace(/\s+/g, '_');
    const monthName = monthsList[selectedMonth];
    
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `payslip_${cleanName}_${monthName}_${selectedYear}.pdf`;
    a.click();
    toast.success('PDF statement downloaded successfully!');
  };

  // Summarize payroll for all teachers
  const getPayrollSummary = () => {
    let totalPayroll = 0;
    let totalEarnedDays = 0;
    teachers.forEach(t => {
      const calc = calculateTeacherSalary(t);
      if (calc) {
        totalPayroll += calc.earnedSalary;
        totalEarnedDays += calc.payableDays;
      }
    });
    return {
      totalPayroll,
      totalEarnedDays,
      averageSalary: teachers.length > 0 ? Math.round(totalPayroll / teachers.length) : 0
    };
  };

  const payrollStats = getPayrollSummary();

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

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Faculty Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track teacher attendance logs and automate monthly salary payroll calculations.</p>
        </div>
        
        {/* Tab Controls with gorgeous pill design */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-gray-100 shadow-inner">
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'attendance' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Attendance Logs
          </button>
          <button 
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'salary' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calculator size={14} /> Salary & Payroll
          </button>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <>
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 border-indigo-55 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Teachers</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalTeachers}</h3>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-emerald-55 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <CalendarCheck2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Present Today</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">{presentToday}</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-rose-55 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <CalendarX2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Absent Today</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">{absentToday}</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-amber-55 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Late Today</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">{lateToday}</h3>
                </div>
              </div>
            </Card>
          </div>

          {/* TABLE CARD */}
          <Card className="p-0 overflow-hidden border-indigo-50/50 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search teacher name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
                />
              </div>
              
              <div className="flex w-full md:w-auto gap-3 items-center justify-end">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium transition-all"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-semibold transition-all min-w-[140px]"
                >
                  <option value="">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">Leave</option>
                </select>
                <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 text-xs font-bold uppercase tracking-wider py-2">
                  <Download size={14} /> CSV
                </Button>
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
                    <tr className="bg-slate-50/50 text-gray-400 font-bold border-b border-gray-100 text-xs uppercase tracking-wider">
                      <th className="py-4 px-6">Teacher</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Check In</th>
                      <th className="py-4 px-6">Check Out</th>
                      <th className="py-4 px-6">Remarks</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/30 transition-colors bg-white">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{record.teachers?.full_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 font-medium">{record.teachers?.specialization || ''}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-800 font-semibold">
                          {new Date(record.attendance_date).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            record.status === 'Present' ? 'bg-green-50 text-green-700 border border-green-100' :
                            record.status === 'Absent' ? 'bg-red-50 text-red-700 border border-red-100' :
                            record.status === 'Late' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                            record.status === 'Half Day' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                            'bg-slate-50 text-gray-700 border border-slate-100'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-semibold">{record.check_in || '-'}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-semibold">{record.check_out || '-'}</td>
                        <td className="py-4 px-6 text-xs text-gray-500 max-w-[200px] truncate font-medium" title={record.remarks}>
                          {record.remarks || '-'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditOpen(record)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => { setSelectedRecord(record); setDeleteModalOpen(true); }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
        </>
      ) : (
        // AUTOMATIC SALARY & PAYROLL VIEW
        <>
          {/* SALARY STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-purple-50/20 shadow-sm relative overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-100">
                  <IndianRupee size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Monthly Payroll</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    ₹{payrollStats.totalPayroll.toLocaleString('en-IN')}
                  </h3>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-indigo-600">
                <Percent size={96} />
              </div>
            </Card>

            <Card className="p-6 border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 shadow-sm relative overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-100">
                  <Briefcase size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Paid Salary</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    ₹{payrollStats.averageSalary.toLocaleString('en-IN')}
                  </h3>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-emerald-600">
                <IndianRupee size={96} />
              </div>
            </Card>

            <Card className="p-6 border-violet-100 bg-gradient-to-br from-violet-50/30 to-fuchsia-50/20 shadow-sm relative overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-violet-600 text-white rounded-2xl shadow-md shadow-violet-100">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accumulated Paid Days</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    {payrollStats.totalEarnedDays.toFixed(1)} Days
                  </h3>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-violet-600">
                <CalendarCheck2 size={96} />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* POLICY CONFIGURATION PANEL */}
            <div className="xl:col-span-1 space-y-4">
              <Card className="border-indigo-100 p-5 shadow-sm relative overflow-hidden sticky top-6 bg-slate-50/50">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                  <Filter size={14} /> Payroll Configurations
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Statement Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-semibold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      {monthsList.map((m, idx) => (
                        <option key={m} value={idx}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Statement Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-semibold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>

                  <hr className="border-gray-200 my-2" />

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Late Day Weight</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">{Math.round(lateWeight * 100)}% Pay</span>
                    </label>
                    <select
                      value={lateWeight}
                      onChange={(e) => setLateWeight(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value={1.0}>1.0 (Full Day Pay - No Penalty)</option>
                      <option value={0.9}>0.9 (10% Penalty)</option>
                      <option value={0.8}>0.8 (20% Penalty)</option>
                      <option value={0.5}>0.5 (Half Day Pay Penalty)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Leave Day Weight</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">{Math.round(leaveWeight * 100)}% Pay</span>
                    </label>
                    <select
                      value={leaveWeight}
                      onChange={(e) => setLeaveWeight(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value={0.0}>0.0 (Unpaid Leave)</option>
                      <option value={0.5}>0.5 (Half Pay Approved Leave)</option>
                      <option value={1.0}>1.0 (Fully Paid Leave)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl text-[11px] text-gray-500 leading-relaxed font-medium">
                  <p className="font-bold text-indigo-950 mb-0.5">📌 Auto-Calculation Formula:</p>
                  Daily Rate = (Base Salary / Total Days in Month)
                  <br />
                  Payable Days = Present + (Late * LateWt) + (HalfDay * 0.5) + (Leave * LeaveWt)
                  <br />
                  Net Earn = Daily Rate * Payable Days
                </div>
              </Card>
            </div>

            {/* PAYROLL DIRECTORY ROSTER */}
            <div className="xl:col-span-3">
              <Card className="p-0 overflow-hidden border-indigo-50/50 shadow-sm bg-white">
                <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">Faculty Earnings Directory</h3>
                    <p className="text-xs text-gray-400 font-medium">Computed salary ledger for {monthsList[selectedMonth]} {selectedYear}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-white border border-gray-200 rounded-full shadow-inner text-indigo-600">
                    {teachers.length} Faculty Members
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-gray-400 font-bold border-b border-gray-100 text-xs uppercase tracking-wider">
                        <th className="py-4 px-6">Faculty Member</th>
                        <th className="py-4 px-6">Base Salary</th>
                        <th className="py-4 px-6">Attendance Summary</th>
                        <th className="py-4 px-6">Payable Days</th>
                        <th className="py-4 px-6">Earned Salary</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {teachers.map((teacher) => {
                        const salaryDetails = calculateTeacherSalary(teacher);
                        if (!salaryDetails) return null;
                        return (
                          <tr key={teacher.id} className="hover:bg-slate-50/30 transition-colors bg-white">
                            <td className="py-4 px-6">
                              <div className="font-bold text-gray-900">{teacher.full_name}</div>
                              <div className="text-xs text-gray-500 font-semibold">{teacher.specialization || 'General Faculty'}</div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-700 font-bold">
                              ₹{teacher.salary ? teacher.salary.toLocaleString('en-IN') : '0'}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap gap-1.5 max-w-xs">
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-[10px] font-bold">
                                  P: {salaryDetails.presentCount}
                                </span>
                                {salaryDetails.lateCount > 0 && (
                                  <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded text-[10px] font-bold">
                                    L: {salaryDetails.lateCount}
                                  </span>
                                )}
                                {salaryDetails.halfDayCount > 0 && (
                                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded text-[10px] font-bold">
                                    HD: {salaryDetails.halfDayCount}
                                  </span>
                                )}
                                {salaryDetails.leaveCount > 0 && (
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                                    Lv: {salaryDetails.leaveCount}
                                  </span>
                                )}
                                {salaryDetails.absentCount > 0 && (
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[10px] font-bold">
                                    A: {salaryDetails.absentCount}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-800 font-black">
                              {salaryDetails.payableDays.toFixed(1)} / {salaryDetails.daysInMonth} Days
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1.5 text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 shadow-sm">
                                <IndianRupee size={12} />
                                {salaryDetails.earnedSalary.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Button 
                                onClick={() => {
                                  setSelectedSalaryTeacher(teacher);
                                  setSalaryModalOpen(true);
                                  setModalView('pdf'); // default to PDF view directly
                                }}
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold transition-all text-xs"
                              >
                                <Calculator size={12} className="mr-1" /> Pay Slip
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      {teachers.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-gray-500">
                            No registered teachers found in database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Edit Attendance Modal */}
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
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
              <input
                type="time"
                step="1"
                value={editForm.check_out}
                onChange={(e) => setEditForm({...editForm, check_out: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
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

      {/* Detailed Pay Slip / Interactive PDF Statement Modal (Width is expanded to max-w-3xl for beautiful spacing) */}
      <Modal
        isOpen={salaryModalOpen}
        onClose={() => setSalaryModalOpen(false)}
        title="Detailed Faculty Statement"
        className="max-w-3xl"
      >
        {selectedSalaryTeacher && (() => {
          const calc = calculateTeacherSalary(selectedSalaryTeacher);
          if (!calc) return null;
          
          return (
            <div className="space-y-4">
              {/* Modern View Selection Pill Header */}
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-xl border border-gray-100/50">
                <span className="text-xs font-bold text-gray-500 pl-2">Statement Format:</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setModalView('pdf')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      modalView === 'pdf' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-indigo-600 bg-white border border-gray-100'
                    }`}
                  >
                    PDF Document View
                  </button>
                  <button 
                    onClick={() => setModalView('standard')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      modalView === 'standard' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-indigo-600 bg-white border border-gray-100'
                    }`}
                  >
                    Standard HTML View
                  </button>
                </div>
              </div>

              {/* Dynamic View Loader */}
              {modalView === 'pdf' ? (
                <div className="bg-slate-100 rounded-2xl p-2 border border-slate-200/50">
                  {generatingPdf ? (
                    <div className="flex flex-col items-center justify-center py-28 space-y-4 bg-white rounded-xl border border-gray-100/50 shadow-inner">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                      <div className="text-center">
                        <p className="text-sm font-extrabold text-gray-800">Compiling Statement PDF...</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Generating high-definition vector preview</p>
                      </div>
                    </div>
                  ) : pdfUrl ? (
                    <iframe 
                      src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                      className="w-full h-[580px] rounded-xl border-0 bg-white shadow-inner"
                      title="Salary Statement PDF Document"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-xl">
                      <Calculator size={36} className="text-indigo-600 animate-bounce mb-2" />
                      <span>Preparing statement template...</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Original Highly Interactive HTML statement card view */
                <div id="printable-payslip" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600"></div>
                  
                  {/* School Roster Banner */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-indigo-950 uppercase tracking-tight">Tution Management Academy</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Faculty Statement & Earnings Slip</p>
                    </div>
                    <span className="text-[10px] font-black bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider">
                      {monthsList[selectedMonth]} {selectedYear}
                    </span>
                  </div>

                  {/* Faculty & Statement Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Faculty Member</p>
                      <p className="font-black text-gray-900 text-sm mt-0.5">{selectedSalaryTeacher.full_name}</p>
                      <p className="text-gray-500 font-medium mt-0.5">{selectedSalaryTeacher.email}</p>
                      <p className="text-gray-400 font-semibold mt-0.5">{selectedSalaryTeacher.specialization || 'General Faculty'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Payable Statement Date</p>
                      <p className="font-bold text-gray-800 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px] mt-2.5">Daily Pro-rata Rate</p>
                      <p className="font-black text-gray-900 mt-0.5">₹{Math.round(calc.dailyRate).toLocaleString('en-IN')} / Day</p>
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2.5">Attendance Ledger breakdown</h4>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div className="bg-white border border-gray-100/50 rounded-lg p-2">
                        <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Present</p>
                        <p className="font-black text-gray-800 mt-0.5 text-base">{calc.presentCount}</p>
                      </div>
                      <div className="bg-white border border-gray-100/50 rounded-lg p-2">
                        <p className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider">Late</p>
                        <p className="font-black text-gray-800 mt-0.5 text-base">{calc.lateCount}</p>
                      </div>
                      <div className="bg-white border border-gray-100/50 rounded-lg p-2">
                        <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wider">Half Day</p>
                        <p className="font-black text-gray-800 mt-0.5 text-base">{calc.halfDayCount}</p>
                      </div>
                      <div className="bg-white border border-gray-100/50 rounded-lg p-2">
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Leave</p>
                        <p className="font-black text-gray-800 mt-0.5 text-base">{calc.leaveCount}</p>
                      </div>
                      <div className="bg-white border border-gray-100/50 rounded-lg p-2">
                        <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Absent</p>
                        <p className="font-black text-gray-800 mt-0.5 text-base">{calc.absentCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Calculation breakdown */}
                  <div className="space-y-2 border-t border-b border-gray-100 py-4 text-xs font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Base Monthly Contract Salary:</span>
                      <span className="text-gray-900 font-bold">₹{calc.baseSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Days in Month:</span>
                      <span className="text-gray-900 font-bold">{calc.daysInMonth} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Rate (Base Salary / {calc.daysInMonth}):</span>
                      <span className="text-gray-900 font-bold">₹{calc.dailyRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Payable Work Days:</span>
                      <span className="text-gray-900 font-black text-indigo-600">{calc.payableDays.toFixed(2)} Days</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 italic font-medium pl-2">
                      <span>(Present: {calc.presentCount} + Late: {calc.lateCount * lateWeight} + Half: {calc.halfDayCount * 0.5} + Leave: {calc.leaveCount * leaveWeight})</span>
                    </div>
                  </div>

                  {/* Net Earnings Roster */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-[9px] font-black text-emerald-800 uppercase tracking-wider">Net Earned Payroll</h4>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">Computed attendance-based salary</p>
                    </div>
                    <span className="text-2xl font-black text-emerald-700 flex items-center gap-1">
                      <IndianRupee size={20} />
                      {calc.earnedSalary.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Statement signature area */}
                  <div className="flex justify-between items-end pt-8 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    <div>
                      <div className="w-32 border-b border-gray-200 mb-1.5"></div>
                      <span>Faculty Signature</span>
                    </div>
                    <div className="text-right">
                      <div className="w-32 border-b border-gray-200 mb-1.5 ml-auto"></div>
                      <span>Administrator Signature</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <Button variant="ghost" onClick={() => setSalaryModalOpen(false)} className="rounded-xl font-bold">Close</Button>
                <Button 
                  onClick={handleDownloadPDF}
                  disabled={generatingPdf || !pdfUrl}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed font-bold text-white rounded-xl shadow-lg shadow-emerald-100 flex items-center gap-1.5 transition-all"
                >
                  <FileDown size={16} /> Download PDF
                </Button>
                <Button 
                  onClick={() => {
                    // Trigger native page print styling for isolated payslip printing
                    window.print();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-1.5"
                >
                  <Printer size={16} /> Print Pay Slip
                </Button>
              </div>

              {/* Print styling injected globally */}
              <style jsx global>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-payslip, #printable-payslip * {
                    visibility: visible !important;
                  }
                  #printable-payslip {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                  }
                }
              `}</style>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
