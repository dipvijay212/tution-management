import React from 'react';
import ChatInterface from '@/features/chat/ChatInterface';

export const metadata = {
  title: 'Communication | Student/Parent | TuitionPro',
};

export default function StudentCommunicationPage() {
  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] lg:h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Messages</h1>
        <p className="text-slate-500 text-sm">
          Communicate with your teachers and view class announcements.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}

