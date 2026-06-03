'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/use-auth';
import { 
  Send, Paperclip, Image as ImageIcon, FileText, 
  MoreVertical, Search, Check, CheckCheck, Loader2, Plus, X
} from 'lucide-react';
import { format } from 'date-fns';

export default function ChatInterface() {
  const { user, profile } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState(null);
  const { 
    rooms, 
    messages, 
    loading, 
    fetchRooms, 
    fetchMessages, 
    sendMessage,
    uploadFile,
    createChatRoom,
    fetchUsers
  } = useChat(activeRoomId);

  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // New Chat Modal State
  const [showModal, setShowModal] = useState(false);
  const [newChatType, setNewChatType] = useState('private');
  const [newChatTitle, setNewChatTitle] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
    }
  }, [activeRoomId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !isUploading) return;
    
    const text = messageText;
    setMessageText(''); // Optimistic clear
    await sendMessage(activeRoomId, text, 'text');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      const fileUrl = await uploadFile(file);
      await sendMessage(activeRoomId, file.name, isImage ? 'image' : 'file', fileUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openNewChatModal = async () => {
    setShowModal(true);
    const users = await fetchUsers();
    setAvailableUsers(users);
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return alert('Please select at least one user.');
    if (newChatType === 'group' && !newChatTitle.trim()) return alert('Please enter a group title.');

    setIsCreating(true);
    try {
      let title = newChatTitle;
      if (newChatType === 'private') {
        const otherUser = availableUsers.find(u => u.id === selectedUsers[0]);
        title = `Chat with ${otherUser?.full_name || 'User'}`;
      }
      
      const newRoomId = await createChatRoom(newChatType, title, selectedUsers);
      setActiveRoomId(newRoomId);
      setShowModal(false);
      setNewChatTitle('');
      setSelectedUsers([]);
    } catch (err) {
      console.error(err);
      alert('Failed to create chat room.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserSelection = (userId) => {
    if (newChatType === 'private') {
      setSelectedUsers([userId]); // Only one user for private
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Sidebar: Room List */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-[#121620]">
        <div className="p-4 border-b border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            {['admin', 'teacher'].includes(profile?.role?.toLowerCase()) && (
              <button 
                onClick={openNewChatModal}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
                title="Start New Chat"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-[#1e2330] text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.map(room => (
            <div 
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`p-4 border-b border-slate-800 cursor-pointer transition-colors hover:bg-[#1e2330] ${activeRoomId === room.id ? 'bg-[#1e2330] border-l-4 border-l-indigo-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-white truncate pr-2">{room.title || 'Chat'}</h3>
                {room.last_message_at && (
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {format(new Date(room.last_message_at), 'HH:mm')}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400 truncate max-w-[200px]">
                  {room.last_message || 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
          {rooms.length === 0 && !loading && (
            <div className="p-8 text-center flex flex-col items-center">
              <p className="text-slate-500 mb-4">No conversations found.</p>
              {['admin', 'teacher'].includes(profile?.role?.toLowerCase()) && (
                <button 
                  onClick={openNewChatModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Start New Chat
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b0e14]">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#121620]">
              <div>
                <h2 className="font-bold text-white">{activeRoom.title || 'Chat Room'}</h2>
                <p className="text-xs text-slate-400 capitalize">{activeRoom.type} Chat</p>
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id;
                
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {!isMine && (
                      <span className="text-xs text-slate-400 mb-1 ml-1">{msg.sender?.full_name}</span>
                    )}
                    <div 
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isMine 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-[#1e2330] text-slate-200 rounded-tl-none border border-slate-800'
                      }`}
                    >
                      {msg.message_type === 'image' && msg.attachment_url ? (
                        <div className="mb-2">
                          <img src={msg.attachment_url} alt="attachment" className="rounded-lg max-h-60 object-contain" />
                        </div>
                      ) : msg.message_type === 'file' && msg.attachment_url ? (
                        <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 p-2 bg-black/20 rounded-lg text-indigo-200 hover:text-indigo-100">
                          <FileText size={16} />
                          <span className="text-sm underline">{msg.message}</span>
                        </a>
                      ) : null}
                      
                      {msg.message_type === 'text' && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      )}
                      
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                        <span className="text-[10px]">
                          {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : 'Sending...'}
                        </span>
                        {isMine && (
                          <CheckCheck size={12} className={msg.id ? 'text-indigo-200' : 'text-indigo-400/50'} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-[#121620] border-t border-slate-800">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                  </button>
                </div>
                
                <div className="flex-1 bg-[#1e2330] rounded-2xl border border-slate-700 flex items-center pr-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none text-sm placeholder:text-slate-500"
                  />
                  <button 
                    type="submit" 
                    disabled={(!messageText.trim() && !isUploading) || isUploading}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600"
                  >
                    <Send size={16} className="ml-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="h-20 w-20 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Send size={32} className="text-slate-600 ml-2" />
            </div>
            <p className="text-lg font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Start New Chat</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Chat Type</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setNewChatType('private')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newChatType === 'private' ? 'bg-indigo-600 text-white' : 'bg-[#1e2330] text-slate-300 hover:bg-slate-800'}`}
                  >
                    Private (1-on-1)
                  </button>
                  <button 
                    onClick={() => setNewChatType('group')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newChatType === 'group' ? 'bg-indigo-600 text-white' : 'bg-[#1e2330] text-slate-300 hover:bg-slate-800'}`}
                  >
                    Group Chat
                  </button>
                </div>
              </div>

              {/* Title Input for Group */}
              {newChatType === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Group Title</label>
                  <input 
                    type="text" 
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    placeholder="e.g. Class 10 Science" 
                    className="w-full bg-[#1e2330] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
                  />
                </div>
              )}

              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Select {newChatType === 'private' ? 'User' : 'Participants'}
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {availableUsers.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${selectedUsers.includes(u.id) ? 'bg-indigo-600/20 border-indigo-500' : 'bg-[#1e2330] border-slate-800 hover:border-slate-600'}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedUsers.includes(u.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'}`}>
                        {selectedUsers.includes(u.id) && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.full_name || 'Unnamed User'}</p>
                        <p className="text-xs text-slate-400 capitalize">{u.role}</p>
                      </div>
                    </div>
                  ))}
                  {availableUsers.length === 0 && (
                    <p className="text-sm text-slate-500">No users found.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateChat}
                disabled={isCreating || selectedUsers.length === 0 || (newChatType === 'group' && !newChatTitle.trim())}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating && <Loader2 size={16} className="animate-spin" />}
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
