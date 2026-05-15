'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Clock, Calendar, ArrowRight, User, MapPin } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const BatchCard = ({ batch }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
          <Calendar size={24} />
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
          Active
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{batch.batch_name}</h3>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter mt-1">{batch.subject?.name || 'N/A'}</p>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <User size={16} className="text-gray-400" />
            <span className="font-medium text-gray-700">{batch.teacher?.full_name || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400" />
            <span>{batch.start_time} - {batch.end_time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span>Room: {batch.room_number || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Users size={16} className="text-gray-400" />
            <span>{batch.student_count || 0} / {batch.capacity} Students</span>
          </div>
        </div>


      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
        <div className="text-sm font-bold text-indigo-600">
          {formatCurrency(batch.fees)}<span className="text-xs text-gray-400 font-normal"> / mo</span>
        </div>
        <Link href={`/admin/batches/${batch.id}`}>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-indigo-600 transition-all">
            Manage <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default BatchCard;
