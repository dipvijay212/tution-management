'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  GraduationCap, 
  LayoutGrid, 
  IndianRupee,
  CalendarDays,
  Activity,
  UserPlus,
  CreditCard,
  MessageCircle,
  QrCode,
  Smartphone,
  History,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Calendar,
  AlertTriangle,
  Award,
  Palmtree
} from 'lucide-react';
import StatCard from '@/features/admin/components/StatCard';
import AttendanceChart from '@/features/admin/components/AttendanceChart';
import RecentActivities from '@/features/admin/components/RecentActivities';
import UpcomingClasses from '@/features/admin/components/UpcomingClasses';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { studentsService } from '@/services/students.service';
import { teachersService } from '@/services/teachers.service';
import { batchesService } from '@/services/batches.service';

export default function AdminDashboard() {
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview'); // 'overview', 'whatsapp'
  
  // Dashboard Overview States
  const [data, setData] = useState({
    stats: { students: 0, teachers: 0, batches: 0, revenue: '2.4L' },
    upcomingClasses: [],
    activities: [],
    loading: true
  });

  // WhatsApp Feature States
  const [waStatus, setWaStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState(null);
  const [waLoading, setWaLoading] = useState(true);
  const [activeWaTab, setActiveWaTab] = useState('send'); // 'send', 'broadcast', 'logs'
  
  // Database Reference Lists for Templates
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  // Template Type State
  const [msgCategory, setMsgCategory] = useState('custom'); // 'custom', 'fee', 'attendance', 'exam', 'result', 'holiday'
  
  // Custom Template Fields States
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  
  // Specific Form States
  const [singlePhone, setSinglePhone] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDueDate, setFeeDueDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('Absent'); // 'Absent', 'Late'
  const [attendanceDate, setAttendanceDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [holidayReason, setHolidayReason] = useState('');
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');

  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Load Dashboard Data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true }));
        
        const [studentCount, teacherCount, batchCount, batches] = await Promise.all([
          studentsService.getCount(),
          teachersService.getCount(),
          batchesService.getCount(),
          batchesService.getAll()
        ]);

        const mockActivities = [
          {
            id: 1,
            type: 'enrollment',
            title: 'New Student Enrolled',
            description: 'Latest student joined the system',
            time: 'Just now',
            icon: UserPlus,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            id: 2,
            type: 'payment',
            title: 'Fee Payment',
            description: 'Monthly fee received',
            time: '2 hours ago',
            icon: CreditCard,
            color: 'text-indigo-600 bg-indigo-50',
          }
        ];

        setData({
          stats: {
            students: studentCount,
            teachers: teacherCount,
            batches: batchCount,
            revenue: '2.4L'
          },
          upcomingClasses: batches.slice(0, 3),
          activities: mockActivities,
          loading: false
        });
      } catch (error) {
        console.error('[Dashboard] Critical load error:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardData();
  }, []);

  // Fetch WhatsApp Status and dropdown lists
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setWaStatus(data.status);
      setQrCode(data.qr);
    } catch (error) {
      console.error('Failed to fetch WA status:', error);
    } finally {
      setWaLoading(false);
    }
  };

  useEffect(() => {
    if (activeDashboardTab !== 'whatsapp') return;
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    // Fetch database items for templates
    const loadTemplateData = async () => {
      try {
        const [ { data: studentsData }, { data: batchesData } ] = await Promise.all([
          supabase.from('students').select('id, full_name, parent_phone'),
          supabase.from('batches').select('id, batch_name')
        ]);
        setStudents(studentsData || []);
        setBatches(batchesData || []);
      } catch (e) {
        console.error('Failed to load database items for templates:', e);
      }
    };
    loadTemplateData();

    return () => clearInterval(interval);
  }, [activeDashboardTab]);

  // Fetch Message Logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_logs')
        .select(`
          *,
          student:student_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setLogs(data);
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeDashboardTab === 'whatsapp' && activeWaTab === 'logs') {
      fetchLogs();
    }
  }, [activeDashboardTab, activeWaTab]);

  // Handle WhatsApp logout/disconnect
  const handleLogout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/whatsapp/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      toast.success('WhatsApp Disconnected');
      fetchStatus();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Generate Message Body Dynamically in Real-Time
  const getGeneratedMessage = () => {
    const studentObj = students.find(s => s.id === selectedStudentId);
    const studentName = studentObj ? studentObj.full_name : '[Student Name]';
    
    const batchObj = batches.find(b => b.id === selectedBatchId);
    const batchName = batchObj ? batchObj.batch_name : '[Batch Name]';

    switch (msgCategory) {
      case 'fee':
        return `Dear Parent, fee payment of ₹${feeAmount || '0'} for ${studentName} is pending. Due date: ${feeDueDate || '[Due Date]'}. Please pay at the earliest.`;
      case 'attendance':
        if (attendanceStatus === 'Absent') {
          return `Dear Parent, your child ${studentName} was marked absent on ${attendanceDate || '[Date]'}. Please ensure regular attendance.`;
        } else {
          return `Dear Parent, your child ${studentName} arrived late today at ${arrivalTime || '[Arrival Time]'} on ${attendanceDate || '[Date]'}.`;
        }
      case 'exam':
        return `Dear Parent, please note the exam schedule for batch ${batchName}. Exam: ${examName || '[Exam Name]'} on ${examDate || '[Date]'} at ${examTime || '[Time]'}.`;
      case 'result':
        return `Dear Parent, results for ${studentName} in ${subjectName || '[Subject]'} have been declared. Marks obtained: ${marksObtained || '0'}/${totalMarks || '100'}. Keep up the good work!`;
      case 'holiday':
        return `Dear Parents, please note that the tuition center will remain closed from ${holidayStart || '[Start Date]'} to ${holidayEnd || '[End Date]'} due to ${holidayReason || '[Holiday Occasion]'}. Regular classes will resume thereafter.`;
      default:
        return singleMessage || '(Type a message in the custom body field to preview)';
    }
  };

  // Submit and Dispatch Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const finalMessage = getGeneratedMessage();
    if (!finalMessage.trim() || finalMessage.includes('[') || finalMessage.includes('(')) {
      return toast.error('Please fill all template fields before sending.');
    }

    setSendingMessage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Determine if single or broadcast action is required
      const isBroadcast = msgCategory === 'holiday' || msgCategory === 'exam' || activeWaTab === 'broadcast';
      
      if (isBroadcast) {
        let recipients = [];
        
        if (msgCategory === 'exam') {
          // Fetch enrolled students of selected batch
          const { data: enrolled, error } = await supabase
            .from('student_batches')
            .select(`
              student:students(
                id,
                parent_phone
              )
            `)
            .eq('batch_id', selectedBatchId);
            
          if (error) throw error;
          recipients = enrolled
            .filter(e => e.student && e.student.parent_phone)
            .map(e => ({ studentId: e.student.id, parentPhone: e.student.parent_phone }));
        } else {
          // Holiday or general broadcast: Fetch all students
          const { data: studentsList, error } = await supabase
            .from('students')
            .select('id, parent_phone');
            
          if (error) throw error;
          recipients = studentsList
            .filter(s => s.parent_phone)
            .map(s => ({ studentId: s.id, parentPhone: s.parent_phone }));
        }

        if (recipients.length === 0) {
          toast.error('No parent phone numbers found.');
          setSendingMessage(false);
          return;
        }

        const res = await fetch('/api/whatsapp/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            recipients: recipients,
            messageType: msgCategory.toUpperCase() + '_NOTICE',
            messageBody: finalMessage
          })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Broadcast failed');
        
        toast.success(`Broadcast sent successfully to ${recipients.length} parents!`);
      } else {
        // Single message
        let parentPhone = singlePhone;
        let sId = null;

        if (msgCategory !== 'custom') {
          const studentObj = students.find(s => s.id === selectedStudentId);
          if (!studentObj || !studentObj.parent_phone) {
            toast.error('Selected student does not have a parent phone number.');
            setSendingMessage(false);
            return;
          }
          parentPhone = studentObj.parent_phone;
          sId = studentObj.id;
        }

        if (!parentPhone) {
          toast.error('Provide a recipient phone number.');
          setSendingMessage(false);
          return;
        }

        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            parentPhone: parentPhone,
            studentId: sId,
            messageType: msgCategory.toUpperCase() + '_ALERT',
            messageBody: finalMessage
          })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Failed to send message');
        
        toast.success('Message delivered successfully!');
      }

      // Reset specific template forms
      setSinglePhone('');
      setSingleMessage('');
      setFeeAmount('');
      setFeeDueDate('');
      setAttendanceDate('');
      setArrivalTime('');
      setExamName('');
      setExamDate('');
      setExamTime('');
      setSubjectName('');
      setMarksObtained('');
      setHolidayReason('');
      setHolidayStart('');
      setHolidayEnd('');
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Custom Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening with your tuition center today.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-2xl border border-gray-200/30">
          <button
            onClick={() => setActiveDashboardTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeDashboardTab === 'overview'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveDashboardTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
              activeDashboardTab === 'whatsapp'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageCircle size={16} /> WhatsApp Center
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeDashboardTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Students" 
              value={data.stats.students} 
              icon={GraduationCap} 
              trend="up" 
              trendValue="12"
              color="indigo"
              isLoading={data.loading}
            />
            <StatCard 
              title="Total Teachers" 
              value={data.stats.teachers} 
              icon={Users} 
              trend="up" 
              trendValue="5"
              color="violet"
              isLoading={data.loading}
            />
            <StatCard 
              title="Active Batches" 
              value={data.stats.batches} 
              icon={LayoutGrid} 
              color="amber"
              isLoading={data.loading}
            />
            <StatCard 
              title="Monthly Revenue" 
              value={`₹${data.stats.revenue}`} 
              icon={IndianRupee} 
              trend="up" 
              trendValue="8"
              color="emerald"
              isLoading={data.loading}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Analytics Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Activity size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Attendance Analytics</h2>
                  </div>
                  <select className="text-sm border-none bg-gray-50 rounded-lg focus:ring-0 cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <AttendanceChart />
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <CalendarDays size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Upcoming Classes</h2>
                  </div>
                <UpcomingClasses classes={data.upcomingClasses} isLoading={data.loading} />
              </div>
            </div>

            {/* Sidebar Section */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                </div>
                <RecentActivities activities={data.activities} isLoading={data.loading} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* WHATSAPP CENTER TAB CONTENT */}
      {activeDashboardTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-gray-900">WhatsApp Messaging System</h2>
              <p className="text-gray-500 text-sm">Monitor system connection, pair your admin device, and broadcast official announcements.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status:</span>
                {waLoading ? (
                  <Badge variant="gray" className="animate-pulse">Checking...</Badge>
                ) : (
                  <Badge 
                    variant={
                      waStatus === 'CONNECTED' ? 'emerald' :
                      waStatus === 'QR_READY' ? 'amber' :
                      'rose'
                    }
                  >
                    {waStatus}
                  </Badge>
                )}
              </div>
              {waStatus === 'CONNECTED' && (
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-600 hover:bg-rose-50 rounded-xl font-bold py-1.5 px-3">
                  <LogOut className="w-4 h-4 mr-2" /> Disconnect
                </Button>
              )}
            </div>
          </div>

          {waStatus === 'QR_READY' && qrCode && (
            <Card className="border-amber-200 bg-amber-50/50 shadow-md rounded-3xl">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-amber-100/50">
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 rounded-2xl" />
                </div>
                <h3 className="text-xl font-black text-amber-900">Link WhatsApp Device</h3>
                <p className="text-amber-700 text-sm max-w-md font-medium">
                  Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Link a Device. Scan the QR code to connect.
                </p>
              </CardContent>
            </Card>
          )}

          {waStatus === 'DISCONNECTED' && !waLoading && !qrCode && (
            <Card className="border-rose-100 bg-rose-50/30 rounded-3xl">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
                <h3 className="text-xl font-black text-rose-900">Service Disconnected</h3>
                <p className="text-rose-600 text-sm max-w-md font-medium">The WhatsApp service is currently disconnected. Please wait for it to initialize or check the server logs.</p>
              </CardContent>
            </Card>
          )}

          {waStatus === 'CONNECTED' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Tab Navigation Left Bar */}
              <div className="lg:col-span-1 space-y-2">
                <button 
                  onClick={() => { setActiveWaTab('send'); setMsgCategory('custom'); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all duration-200 border ${
                    activeWaTab === 'send' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                      : 'text-gray-600 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <Smartphone className="w-5 h-5" /> Single / Alert Message
                </button>
                <button 
                  onClick={() => { setActiveWaTab('broadcast'); setMsgCategory('holiday'); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all duration-200 border ${
                    activeWaTab === 'broadcast' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                      : 'text-gray-600 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <Users className="w-5 h-5" /> Broadcast Notices
                </button>
                <button 
                  onClick={() => setActiveWaTab('logs')}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all duration-200 border ${
                    activeWaTab === 'logs' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                      : 'text-gray-600 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <History className="w-5 h-5" /> Message Logs
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="lg:col-span-3">
                {activeWaTab !== 'logs' ? (
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    
                    {/* Messaging Form */}
                    <div className="xl:col-span-3 space-y-6">
                      <Card>
                        <CardHeader>
                          <h3 className="text-lg font-black text-gray-900">
                            {activeWaTab === 'send' ? 'Compose Alert / Message' : 'Compose Broadcast Notice'}
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleSendMessage} className="space-y-4">
                            
                            {/* Message Category / Template Selection Selector */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Select Template / Alert Category
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {activeWaTab === 'send' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setMsgCategory('custom')}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        msgCategory === 'custom' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-gray-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      Custom Message
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMsgCategory('fee')}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                                        msgCategory === 'fee' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-gray-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <CreditCard size={12} /> Fee Reminder
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMsgCategory('attendance')}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                                        msgCategory === 'attendance' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-gray-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <AlertTriangle size={12} /> Attendance Alert
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMsgCategory('result')}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                                        msgCategory === 'result' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-gray-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <Award size={12} /> Result Alert
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setMsgCategory('holiday')}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                                        msgCategory === 'holiday' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-gray-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <Palmtree size={12} /> Holiday Notice
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMsgCategory('exam')}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                                        msgCategory === 'exam' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-gray-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <Calendar size={12} /> Exam Schedule
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Template Specific Form Fields */}
                            
                            {/* 1. CUSTOM MESSAGE */}
                            {msgCategory === 'custom' && (
                              <>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Phone Number</label>
                                  <Input 
                                    placeholder="e.g. 9876543210" 
                                    value={singlePhone}
                                    onChange={(e) => setSinglePhone(e.target.value)}
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message Body</label>
                                  <textarea
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px]"
                                    placeholder="Type your custom message here..."
                                    value={singleMessage}
                                    onChange={(e) => setSingleMessage(e.target.value)}
                                    required
                                  />
                                </div>
                              </>
                            )}

                            {/* 2. FEE REMINDER */}
                            {msgCategory === 'fee' && (
                              <>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Student</label>
                                  <select 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    required
                                  >
                                    <option value="">-- Choose Student --</option>
                                    {students.map(s => (
                                      <option key={s.id} value={s.id}>{s.full_name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fee Amount (₹)</label>
                                    <Input
                                      type="number"
                                      placeholder="e.g. 1500"
                                      value={feeAmount}
                                      onChange={(e) => setFeeAmount(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                                    <Input
                                      type="date"
                                      value={feeDueDate}
                                      onChange={(e) => setFeeDueDate(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* 3. ATTENDANCE ALERT */}
                            {msgCategory === 'attendance' && (
                              <>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Student</label>
                                  <select 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    required
                                  >
                                    <option value="">-- Choose Student --</option>
                                    {students.map(s => (
                                      <option key={s.id} value={s.id}>{s.full_name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Attendance Status</label>
                                    <select 
                                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                                      value={attendanceStatus}
                                      onChange={(e) => setAttendanceStatus(e.target.value)}
                                      required
                                    >
                                      <option value="Absent">Absent</option>
                                      <option value="Late">Late Arrival</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                                    <Input
                                      type="date"
                                      value={attendanceDate}
                                      onChange={(e) => setAttendanceDate(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                {attendanceStatus === 'Late' && (
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Arrival Time</label>
                                    <Input
                                      type="time"
                                      value={arrivalTime}
                                      onChange={(e) => setArrivalTime(e.target.value)}
                                      required
                                    />
                                  </div>
                                )}
                              </>
                            )}

                            {/* 4. RESULT ANNOUNCEMENT */}
                            {msgCategory === 'result' && (
                              <>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Student</label>
                                  <select 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    required
                                  >
                                    <option value="">-- Choose Student --</option>
                                    {students.map(s => (
                                      <option key={s.id} value={s.id}>{s.full_name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                  <Input
                                    placeholder="e.g. Mathematics, Science"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Marks Obtained</label>
                                    <Input
                                      type="number"
                                      placeholder="e.g. 85"
                                      value={marksObtained}
                                      onChange={(e) => setMarksObtained(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Total Marks</label>
                                    <Input
                                      type="number"
                                      placeholder="100"
                                      value={totalMarks}
                                      onChange={(e) => setTotalMarks(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* 5. EXAM SCHEDULE */}
                            {msgCategory === 'exam' && (
                              <>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Batch</label>
                                  <select 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:outline-none transition-all"
                                    value={selectedBatchId}
                                    onChange={(e) => setSelectedBatchId(e.target.value)}
                                    required
                                  >
                                    <option value="">-- Choose Batch --</option>
                                    {batches.map(b => (
                                      <option key={b.id} value={b.id}>{b.batch_name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Title</label>
                                  <Input
                                    placeholder="e.g. Science Term Test, Math Finals"
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Date</label>
                                    <Input
                                      type="date"
                                      value={examDate}
                                      onChange={(e) => setExamDate(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                                    <Input
                                      type="time"
                                      value={examTime}
                                      onChange={(e) => setExamTime(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* 6. HOLIDAY NOTICE */}
                            {msgCategory === 'holiday' && (
                              <>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">Occasion / Reason</label>
                                  <Input
                                    placeholder="e.g. Diwali Break, Summer Vacation, Eid"
                                    value={holidayReason}
                                    onChange={(e) => setHolidayReason(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Starts On</label>
                                    <Input
                                      type="date"
                                      value={holidayStart}
                                      onChange={(e) => setHolidayStart(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ends On</label>
                                    <Input
                                      type="date"
                                      value={holidayEnd}
                                      onChange={(e) => setHolidayEnd(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            <Button type="submit" disabled={sendingMessage} className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-lg shadow-indigo-100">
                              {sendingMessage ? 'Processing...' : (
                                activeWaTab === 'send' ? (
                                  <><MessageCircle className="w-4 h-4 mr-2" /> Send Alert</>
                                ) : (
                                  <><Users className="w-4 h-4 mr-2" /> Send Broadcast to Parents</>
                                )
                              )}
                            </Button>

                          </form>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Live Preview Card */}
                    <div className="xl:col-span-2">
                      <div className="sticky top-6 space-y-4">
                        <Card className="border-indigo-100 shadow-sm relative overflow-hidden bg-slate-50/50">
                          {/* Decorative HSL Gradient border on top */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600"></div>
                          
                          <CardHeader className="pb-3 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-indigo-600 font-black uppercase tracking-wider flex items-center gap-1">
                              <FileText size={14} /> WhatsApp Template Live Preview
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-white py-0.5 px-2 rounded-full border border-gray-100">
                              {msgCategory}
                            </span>
                          </CardHeader>
                          <CardContent className="pt-6">
                            
                            {/* Simulate Phone UI Frame */}
                            <div className="bg-white rounded-2xl p-4 shadow-inner border border-gray-100 relative min-h-[140px] flex flex-col justify-between">
                              <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                                {getGeneratedMessage()}
                              </p>
                              
                              <div className="flex items-center justify-between mt-6 text-[10px] text-gray-400 font-bold uppercase border-t border-gray-50 pt-2.5">
                                <span>Preview Context</span>
                                <span className="text-indigo-500">Auto-Generated</span>
                              </div>
                            </div>

                          </CardContent>
                        </Card>
                        
                        <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 text-xs text-gray-500 leading-relaxed font-medium">
                          <p className="font-bold text-gray-800 mb-1">📌 Template Guidelines</p>
                          Verify all fields are populated correctly to auto-generate the content. Placeholder tags in brackets like <span className="font-semibold text-indigo-600">[Student Name]</span> must be fully replaced before sending to avoid delivery disruption.
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <h3 className="text-lg font-black text-gray-900">Recent Messages Log</h3>
                      <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loadingLogs} className="rounded-xl p-2 hover:bg-slate-50 border border-gray-100">
                        <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                      </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-gray-400 font-bold border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 uppercase tracking-wider text-xs">Type</th>
                            <th className="px-6 py-4 uppercase tracking-wider text-xs">Phone</th>
                            <th className="px-6 py-4 uppercase tracking-wider text-xs">Student</th>
                            <th className="px-6 py-4 uppercase tracking-wider text-xs">Status</th>
                            <th className="px-6 py-4 uppercase tracking-wider text-xs">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                          {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <Badge variant="indigo" className="text-[10px]">{log.message_type}</Badge>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-700">{log.parent_phone}</td>
                              <td className="px-6 py-4 text-gray-600 font-semibold">
                                {log.student ? log.student.full_name : '-'}
                              </td>
                              <td className="px-6 py-4">
                                {log.status === 'SENT' ? (
                                  <span className="flex items-center text-emerald-600 text-xs font-bold uppercase">
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Sent
                                  </span>
                                ) : log.status === 'FAILED' ? (
                                  <span className="flex items-center text-rose-600 text-xs font-bold uppercase">
                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Failed
                                  </span>
                                ) : (
                                  <span className="text-amber-600 text-xs font-bold uppercase">{log.status}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap font-medium">
                                {new Date(log.created_at).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                          {logs.length === 0 && !loadingLogs && (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                No messages sent yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
