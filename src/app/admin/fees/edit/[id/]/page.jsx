'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  total_amount: z.string().min(1, 'Total fees expected is required'),
  paid_amount: z.string().min(1, 'Amount paid is required'),
  payment_method: z.string().min(1, 'Select a payment method'),
  transaction_id: z.string().optional().nullable(),
  due_date: z.string().min(1, 'Next due date is required'),
  payment_status: z.enum(['paid', 'partial', 'pending']),
});

export default function EditFeeRecordPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setInitialLoading(true);
        console.log(`[Edit Fee] Loading support data and record for ID: ${id}`);
        
        // Fetch students, batches, and the fee record in parallel
        const [studentsData, batchesData, recordData] = await Promise.all([
          studentsService.getAll(),
          batchesService.getAll(),
          feesService.getById(id)
        ]);

        setStudents(studentsData || []);
        setBatches(batchesData || []);

        if (recordData) {
          // Pre-populate all form fields
          setValue('student_id', recordData.student_id);
          setValue('batch_id', recordData.batch_id);
          setValue('total_amount', String(recordData.total_amount || 0));
          setValue('paid_amount', String(recordData.paid_amount || 0));
          setValue('payment_status', recordData.payment_status || 'paid');
          setValue('payment_method', recordData.payment_method || 'Cash');
          setValue('transaction_id', recordData.transaction_id || '');
          setValue('due_date', recordData.due_date || '');
        }

      } catch (error) {
        console.error('[Edit Fee] Failed to load data:', error);
        toast.error('Failed to load fee record details');
        router.push('/admin/fees');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      loadAllData();
    }
  }, [id, router, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      console.log(`[Edit Fee] Submitting fee update for ID: ${id}`, data);
      
      const payload = {
        student_id: data.student_id,
        batch_id: data.batch_id,
        total_amount: parseFloat(data.total_amount),
        paid_amount: parseFloat(data.paid_amount),
        payment_method: data.payment_method,
        transaction_id: data.transaction_id || null,
        due_date: data.due_date,
        payment_status: data.payment_status,
      };

      await feesService.updateRecord(id, payload);
      toast.success('Fee record updated successfully!');
      router.push('/admin/fees');
      router.refresh();
    } catch (error) {
      console.error('[Edit Fee] Update failed:', error);
      toast.error('Failed to update fee record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">Loading fee details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/fees" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all group">
          <ArrowLeft size={20} className="transform group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Fee Record</h1>
          <p className="text-gray-500 text-sm mt-0.5">Modify the recorded payment or status details for this invoice.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Student</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <select
                  {...register('student_id')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none font-medium text-slate-700"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              {errors.student_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.student_id.message}</p>}
            </div>

            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Batch</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LayoutGrid size={18} className="text-gray-400" />
                </div>
                <select
                  {...register('batch_id')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none font-medium text-slate-700"
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
                </select>
              </div>
              {errors.batch_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.batch_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Total Fees expected */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Total Fees Expected (INR)</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <IndianRupee size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  {...register('total_amount')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                  placeholder="3000"
                />
              </div>
              {errors.total_amount && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.total_amount.message}</p>}
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Amount Paid (INR)</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <IndianRupee size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  {...register('paid_amount')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                  placeholder="2500"
                />
              </div>
              {errors.paid_amount && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.paid_amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Payment Method</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CreditCard size={18} className="text-gray-400" />
                </div>
                <select
                  {...register('payment_method')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none font-medium text-slate-700"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / Google Pay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Payment Status</label>
              <div className="mt-1.5 relative">
                <select
                  {...register('payment_status')}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none font-medium text-slate-700"
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Transaction ID (Ref)</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Hash size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('transaction_id')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                  placeholder="TXN123456789"
                />
              </div>
            </div>

            {/* Next Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Next Due Date</label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  {...register('due_date')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
            <Button variant="ghost" type="button" onClick={() => router.push('/admin/fees')}>Cancel</Button>
            <Button type="submit" disabled={loading} className="px-10 bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
