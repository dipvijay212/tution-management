import React from 'react';
import ChatInterface from '@/features/chat/ChatInterface';

export const metadata = {
  title: 'Communication | Student/Parent | TuitionPro',
};

export default function StudentCommunicationPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Messages</h1>
        <p className="text-slate-400 text-sm">
          Communicate with your teachers and view class announcements.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
