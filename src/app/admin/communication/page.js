import React from 'react';
import ChatInterface from '@/features/chat/ChatInterface';

export const metadata = {
  title: 'Communication | Admin | TuitionPro',
};

export default function AdminCommunicationPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Communication Hub</h1>
        <p className="text-slate-400 text-sm">
          Monitor group and private chats across all classes. Admin has full visibility.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
