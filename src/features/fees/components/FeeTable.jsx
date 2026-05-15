'use client';

import React from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Clock, MoreVertical, FileText, Hash, Loader2 } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const FeeTable = ({ records = [], onUpdateStatus, isLoading }) => {
  const statusConfig = {
    paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Paid' },
    pending: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle, label: 'Pending' },
    partial: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Partial' },
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student & Batch</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Method & TXID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((record) => {
              const status = statusConfig[record.status] || statusConfig.pending;
              return (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        {record.student?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{record.student?.full_name}</p>
                        <p className="text-xs text-gray-500">{record.batch?.batch_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <Clock size={12} /> Due: {formatDate(record.due_date)}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Paid on: {formatDate(record.payment_date)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <CreditCard size={14} className="text-gray-400" /> {record.payment_method}
                    </div>
                    {record.transaction_id && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                        <Hash size={10} /> {record.transaction_id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(record.amount)}
                    </div>
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mt-1",
                      status.color
                    )}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Invoice">
                        <FileText size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-gray-500 text-sm font-medium">Fetching fee records...</p>
        </div>
      )}

      {records.length === 0 && !isLoading && (
        <div className="py-20 text-center text-gray-500">
          No fee records found for the selected period.
        </div>
      )}
    </div>
  );
};

export default FeeTable;
