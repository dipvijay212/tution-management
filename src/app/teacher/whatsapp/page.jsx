'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { MessageCircle, History, CheckCircle, XCircle, Clock, BookOpen, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useSelector } from 'react-redux';

export default function TeacherWhatsAppPage() {
  const { user } = useSelector(state => state.auth);
  const [waStatus, setWaStatus] = useState('LOADING');
  const [activeTab, setActiveTab] = useState('send');
  
  const [phone, setPhone] = useState('');
  const [messageType, setMessageType] = useState('ABSENT_ALERT');
  const [messageBody, setMessageBody] = useState('');
  const [sending, setSending] = useState(false);
  
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setWaStatus(data.status);
    } catch (error) {
      setWaStatus('ERROR');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const templates = {
    ABSENT_ALERT: "Dear Parent, your child was absent from class today. Please ensure they attend regularly.",
    LATE_ALERT: "Dear Parent, your child arrived late to class today.",
    HOMEWORK: "Dear Parent, this is a reminder for your child to complete their assigned homework.",
    EXAM_REMINDER: "Dear Parent, a reminder that your child has an upcoming exam tomorrow.",
    CUSTOM: ""
  };

  // Set initial template
  useEffect(() => {
    setMessageBody(templates[messageType]);
  }, [messageType]);

  const handleTemplateChange = (type) => {
    setMessageType(type);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!phone || !messageBody) return toast.error('Phone and message are required');
    if (waStatus !== 'CONNECTED') return toast.error('WhatsApp is not connected.');
    
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          parentPhone: phone,
          messageType: messageType,
          messageBody: messageBody,
          teacherId: user?.id
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      
      toast.success('Message sent successfully!');
      setPhone('');
      if (messageType === 'CUSTOM') setMessageBody('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const fetchLogs = async () => {
    if (!user?.id) return;
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_logs')
        .select(`
          *,
          student:student_id (first_name, last_name)
        `)
        .eq('sent_by', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, user?.id]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent Communication</h1>
          <p className="text-gray-500">Send WhatsApp updates and reminders to parents.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500 font-medium">System Status:</span>
          <Badge 
            className={
              waStatus === 'CONNECTED' ? 'bg-emerald-100 text-emerald-700' :
              'bg-amber-100 text-amber-700'
            }
          >
            {waStatus === 'CONNECTED' ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('send')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'send' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Send className="w-5 h-5" /> Send Alert
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'logs' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History className="w-5 h-5" /> My History
          </button>
        </div>

        <div className="md:col-span-2">
          {activeTab === 'send' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Send Notification</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone Number</label>
                    <Input 
                      placeholder="e.g. 9876543210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'ABSENT_ALERT', label: 'Absent', icon: AlertCircle },
                        { id: 'LATE_ALERT', label: 'Late', icon: Clock },
                        { id: 'HOMEWORK', label: 'Homework', icon: BookOpen },
                        { id: 'EXAM_REMINDER', label: 'Exam', icon: History },
                        { id: 'CUSTOM', label: 'Custom', icon: MessageCircle }
                      ].map(type => (
                        <div 
                          key={type.id}
                          onClick={() => handleTemplateChange(type.id)}
                          className={`cursor-pointer p-3 rounded border text-sm flex items-center gap-2 transition-colors ${
                            messageType === type.id 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' 
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                      placeholder="Message..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      readOnly={messageType !== 'CUSTOM'}
                      required
                    />
                    {messageType !== 'CUSTOM' && (
                      <p className="text-xs text-gray-500 mt-1">Select 'Custom' to write your own message.</p>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={sending || waStatus !== 'CONNECTED'} className="w-full">
                    {sending ? 'Sending...' : (
                      <><Send className="w-4 h-4 mr-2" /> Send Notification</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'logs' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Sent History</h2>
                <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loadingLogs}>
                  <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs.map(log => (
                    <div key={log.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{log.message_type}</Badge>
                          <span className="text-sm font-medium text-gray-800">{log.parent_phone}</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate max-w-[200px] md:max-w-[300px]">
                          {log.message_body}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {log.status === 'SENT' ? (
                          <span className="flex items-center text-emerald-600 text-xs font-medium">
                            <CheckCircle className="w-3 h-3 mr-1" /> Sent
                          </span>
                        ) : log.status === 'FAILED' ? (
                          <span className="flex items-center text-red-600 text-xs font-medium">
                            <XCircle className="w-3 h-3 mr-1" /> Failed
                          </span>
                        ) : (
                          <span className="text-amber-600 text-xs font-medium">{log.status}</span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {logs.length === 0 && !loadingLogs && (
                    <div className="text-center py-8 text-gray-500">
                      No notifications sent yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
