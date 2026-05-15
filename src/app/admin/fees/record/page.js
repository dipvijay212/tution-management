'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '@/components/ui/Button';
import { 
  Loader2, 
  ArrowLeft, 
  User, 
  IndianRupee, 
  Calendar, 
  CreditCard, 
  Hash, 
  LayoutGrid 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { studentsService } from '@/services/students.service';
import { batchesService } from '@/services/batches.service';
import { feesService } from '@/services/fees.service';

const paymentSchema = z.object({
  student_id: z.string().min(1, 'Please select a student'),
  batch_id: z.string().min(1, 'Please select a batch'),
  amount: z.string().min(1, 'Amount is required'),
  payment_method: z.string().min(1, 'Select a payment method'),
  transaction_id: z.string().optional(),
  payment_date: z.string().min(1, 'Payment date is required'),
  due_date: z.string().min(1, 'Next due date is required'),
  status: z.enum(['paid', 'partial', 'pending']),
  remarks: z.string().optional(),
});

export default function RecordPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        const [studentsData, batchesData] = await Promise.all([
          studentsService.getAll(),
          batchesService.getAll()
        ]);
        setStudents(studentsData);
        setBatches(batchesData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load students or batches');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_date: new Date().toISOString().split('T')[0],
      due_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      payment_method: 'Cash',
      status: 'paid',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await feesService.recordPayment({
        ...data,
        amount: parseFloat(data.amount)
      });
      toast.success('Payment recorded successfully!');
      router.push('/admin/fees');
    } catch (error) {
      toast.error('Failed to record payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/fees" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Fee Payment</h1>
          <p className="text-gray-500 text-sm mt-0.5">Enter payment details for a student to update their fee record.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Student</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <select
                  {...register('student_id')}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              {errors.student_id && <p className="mt-1 text-xs text-red-500">{errors.student_id.message}</p>}
            </div>

            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Batch</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LayoutGrid size={18} className="text-gray-400" />
                </div>
                <select
                  {...register('batch_id')}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
                </select>
              </div>
              {errors.batch_id && <p className="mt-1 text-xs text-red-500">{errors.batch_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Amount Paid (INR)</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  {...register('amount')}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  placeholder="2500"
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Payment Status</label>
              <div className="mt-1 relative">
                <select
                  {...register('status')}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Payment Method</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard size={18} className="text-gray-400" />
                </div>
                <select
                  {...register('payment_method')}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / Google Pay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Transaction ID (Ref)</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('transaction_id')}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  placeholder="TXN123456789"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Payment Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Payment Date</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  {...register('payment_date')}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Next Due Date</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  {...register('due_date')}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Remarks (Optional)</label>
            <textarea
              {...register('remarks')}
              rows={2}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              placeholder="e.g. Paid in full for May"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button variant="ghost" type="button" onClick={() => router.push('/admin/fees')}>Cancel</Button>
            <Button type="submit" disabled={loading} className="px-10 bg-emerald-600 hover:bg-emerald-700">
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              Submit Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
