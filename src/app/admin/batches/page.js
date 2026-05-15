'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BatchCard from '@/features/batches/components/BatchCard';
import Button from '@/components/ui/Button';
import { batchesService } from '@/services/batches.service';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchListPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await batchesService.getAll();
      setBatches(data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      toast.error('Failed to load batches from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage student batches, schedules, and assignments.</p>
        </div>
        <Link href="/admin/batches/add">
          <Button className="gap-2 shadow-lg shadow-indigo-200">
            <Plus size={18} /> Create New Batch
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search batches..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2">
            <Filter size={18} /> Filters
          </Button>
        </div>
      </div>

      {/* Batch Grid */}
      {loading && batches.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-white border border-gray-100 p-6 flex flex-col gap-4 animate-pulse">
               <div className="h-12 w-12 rounded-2xl bg-gray-100" />
               <div className="space-y-2">
                  <div className="h-5 w-2/3 bg-gray-100 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
               </div>
               <div className="mt-auto space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-full bg-gray-100 rounded" />
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
          {batches.length === 0 && !loading && (
             <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400">No batches found. Click &quot;Create New Batch&quot; to get started.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
