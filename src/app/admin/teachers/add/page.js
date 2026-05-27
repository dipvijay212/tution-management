'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTeacherPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/teachers/create');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-50/50">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 font-semibold text-sm">Redirecting to teacher registration...</p>
      </div>
    </div>
  );
}
