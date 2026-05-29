'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Loader2, 
  IndianRupee, 
  Calendar as CalendarIcon,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentBillingPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feeRecords, setFeeRecords] = useState([]);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalRecords: 0
  });

  useEffect(() => {
    if (profile) {
      fetchBillingHistory();
    }
  }, [profile]);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);

      // 1. Fetch student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) {
        setFeeRecords([]);
        return;
      }

      // 2. Fetch fees records
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentData.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      setFeeRecords(data || []);

      // 3. Compute billing statistics summary
      if (data && data.length > 0) {
        let paid = 0;
        let pending = 0;
        data.forEach(rec => {
          const amt = parseFloat(rec.amount) || 0;
          if (rec.status === 'Paid') {
            paid += amt;
          } else if (rec.status === 'Pending') {
            pending += amt;
          } else if (rec.status === 'Partial') {
            paid += amt * 0.5; // Estimated breakdown, or we can customize
            pending += amt * 0.5;
          }
        });
        setSummary({
          totalPaid: paid,
          totalPending: pending,
          totalRecords: data.length
        });
      }
    } catch (err) {
      console.error('Error fetching billing history:', err);
      toast.error('Failed to load billing statements.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="emerald">Paid</Badge>;
      case 'Pending':
        return <Badge variant="rose">Pending</Badge>;
      case 'Partial':
        return <Badge variant="amber">Partial</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'Pending':
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case 'Partial':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Billing & Fees</h1>
        <p className="text-gray-500 text-sm">Track your tuition fees ledger, review outstanding pending invoices, and browse past receipt logs.</p>
      </div>

      {feeRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 overflow-hidden relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-100 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-100">Total Fees Paid</h3>
              <p className="text-4xl font-black">₹{summary.totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </Card>

          <Card className="p-6 overflow-hidden relative bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 shadow-lg shadow-indigo-100 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100">Outstanding Balance</h3>
              <p className="text-4xl font-black">₹{summary.totalPending.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <Clock className="h-8 w-8 text-white" />
            </div>
          </Card>
        </div>
      )}

      {feeRecords.length > 0 ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <h3 className="text-lg font-black text-gray-900">Ledger Statements</h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-400 font-bold border-b border-gray-100">
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Due Date</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Amount</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Status</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Payment Date</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {feeRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                        {record.due_date ? new Date(record.due_date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-black text-gray-900 text-md">
                      ₹{record.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-600">
                      {record.payment_date ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          {new Date(record.payment_date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic font-medium">Unpaid</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {record.transaction_id || record.payment_method ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-800 flex items-center gap-1 text-xs">
                            <CreditCard size={12} className="text-indigo-400" />
                            {record.payment_method || 'Digital Payment'}
                          </span>
                          {record.transaction_id && (
                            <span className="text-[10px] text-gray-400 font-mono select-all">
                              Txn: {record.transaction_id}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No txn history</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="bg-white p-12 text-center">
          <EmptyState
            icon={IndianRupee}
            title="No Fee Records Found"
            description="There are currently no invoice or payment ledger entries issued for your account."
          />
        </Card>
      )}
    </div>
  );
}
