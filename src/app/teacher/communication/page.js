import React from 'react';
import ChatInterface from '@/features/chat/ChatInterface';

export const metadata = {
  title: 'Communication | Teacher | TuitionPro',
};

export default function TeacherCommunicationPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">My Communications</h1>
        <p className="text-slate-400 text-sm">
          Chat with parents and manage class groups.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
