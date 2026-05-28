'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { MessageCircle, QrCode, Smartphone, Users, History, LogOut, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminWhatsAppPage() {
  const [waStatus, setWaStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('send'); // 'send', 'broadcast', 'logs'
  
  // Single Message State
  const [singlePhone, setSinglePhone] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  const [sendingSingle, setSendingSingle] = useState(false);
  
  // Broadcast State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  
  // Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setWaStatus(data.status);
      setQrCode(data.qr);
    } catch (error) {
      console.error('Failed to fetch WA status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSendSingle = async (e) => {
    e.preventDefault();
    if (!singlePhone || !singleMessage) return toast.error('Fill all fields');
    
    setSendingSingle(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          parentPhone: singlePhone,
          messageType: 'CUSTOM',
          messageBody: singleMessage
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      
      toast.success('Message sent successfully!');
      setSinglePhone('');
      setSingleMessage('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingSingle(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage) return toast.error('Enter a message');
    
    // In a real app, you would fetch selected students/parents here.
    // For demo, we will simulate fetching students from the database.
    setSendingBroadcast(true);
    try {
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, parent_phone');
        
      if (studentError) throw studentError;
      
      const recipients = students
        .filter(s => s.parent_phone)
        .map(s => ({ studentId: s.id, parentPhone: s.parent_phone }));
        
      if (recipients.length === 0) {
         toast.error('No valid parent phone numbers found.');
         setSendingBroadcast(false);
         return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          recipients: recipients,
          messageType: 'BROADCAST',
          messageBody: broadcastMessage
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed');
      
      toast.success(`Broadcast sent to ${recipients.length} parents!`);
      setBroadcastMessage('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingBroadcast(false);
    }
  };
  
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_logs')
        .select(`
          *,
          student:student_id (first_name, last_name)
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
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Messaging System</h1>
          <p className="text-gray-500">Manage WhatsApp connection and send messages.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Status:</span>
            {loading ? (
              <Badge className="bg-gray-100 text-gray-600 animate-pulse">Checking...</Badge>
            ) : (
              <Badge 
                className={
                  waStatus === 'CONNECTED' ? 'bg-emerald-100 text-emerald-700' :
                  waStatus === 'QR_READY' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }
              >
                {waStatus}
              </Badge>
            )}
          </div>
          {waStatus === 'CONNECTED' && (
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" /> Disconnect
            </Button>
          )}
        </div>
      </div>

      {waStatus === 'QR_READY' && qrCode && (
        <Card className="border-amber-200 bg-amber-50 shadow-md">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900">Link WhatsApp Device</h3>
            <p className="text-amber-700 max-w-md">
              Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Link a Device. Scan the QR code to connect.
            </p>
          </CardContent>
        </Card>
      )}

      {waStatus === 'DISCONNECTED' && !loading && !qrCode && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-semibold text-red-900">Service Disconnected</h3>
            <p className="text-red-700">The WhatsApp service is currently disconnected. Please wait for it to initialize or check the server logs.</p>
          </CardContent>
        </Card>
      )}

      {waStatus === 'CONNECTED' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('send')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'send' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Smartphone className="w-5 h-5" /> Single Message
            </button>
            <button 
              onClick={() => setActiveTab('broadcast')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'broadcast' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" /> Broadcast
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'logs' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5" /> Message Logs
            </button>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'send' && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Send Custom Message</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendSingle} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone Number</label>
                      <Input 
                        placeholder="e.g. 9876543210" 
                        value={singlePhone}
                        onChange={(e) => setSinglePhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                        placeholder="Type your message here..."
                        value={singleMessage}
                        onChange={(e) => setSingleMessage(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={sendingSingle} className="w-full">
                      {sendingSingle ? 'Sending...' : (
                        <><MessageCircle className="w-4 h-4 mr-2" /> Send Message</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'broadcast' && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Send Broadcast Announcement</h2>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-md flex gap-3 text-sm border border-blue-100">
                    <alertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>This will send a message to ALL active students' parents. Use carefully.</p>
                  </div>
                  <form onSubmit={handleBroadcast} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Broadcast Message</label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                        placeholder="Dear Parents, tomorrow is a holiday..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={sendingBroadcast} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      {sendingBroadcast ? 'Broadcasting...' : (
                        <><Users className="w-4 h-4 mr-2" /> Send to All Parents</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'logs' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Messages</h2>
                  <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loadingLogs}>
                    <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Type</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 rounded-tr-lg">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs">{log.message_type}</Badge>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-700">{log.parent_phone}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {log.student ? `${log.student.first_name} ${log.student.last_name}` : '-'}
                            </td>
                            <td className="px-4 py-3">
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
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                        {logs.length === 0 && !loadingLogs && (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                              No messages sent yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
