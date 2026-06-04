'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/use-auth';
import { 
  Send, Paperclip, Image as ImageIcon, FileText, 
  MoreVertical, Search, Check, CheckCheck, Loader2, Plus, X,
  Users, MessageSquare, Shield, GraduationCap, User
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
    fetchUsers,
    fetchBatchesForChat,
    fetchBatchStudentAuthIds
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
  const [batchesList, setBatchesList] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');

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
    if (['admin', 'teacher'].includes(profile?.role?.toLowerCase())) {
      const batches = await fetchBatchesForChat();
      setBatchesList(batches || []);
    }
  };

  const handleBatchSelect = async (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    if (!batchId) {
      setNewChatTitle('');
      setSelectedUsers([]);
      return;
    }

    const batch = batchesList.find(b => b.id === batchId);
    if (batch) {
      setNewChatTitle(batch.batch_name);
    }

    const authIds = await fetchBatchStudentAuthIds(batchId);
    setSelectedUsers(authIds);
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
      
      const newRoomId = await createChatRoom(newChatType, title, selectedUsers, selectedBatchId || null);
      setActiveRoomId(newRoomId);
      setShowModal(false);
      setNewChatTitle('');
      setSelectedUsers([]);
      setSelectedBatchId('');
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

  // Helper: Get Initials of Name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Helper: Get Avatar Color Style based on Role/Name (Dark Theme)
  const getAvatarStyles = (role, name) => {
    const normalizedRole = role?.toLowerCase() || 'student';
    switch (normalizedRole) {
      case 'admin':
        return { bg: 'bg-violet-950/80 border border-violet-800/60', text: 'text-violet-400' };
      case 'teacher':
        return { bg: 'bg-amber-950/80 border border-amber-800/60', text: 'text-amber-400' };
      case 'student':
      default:
        return { bg: 'bg-emerald-950/80 border border-emerald-800/60', text: 'text-emerald-400' };
    }
  };

  // Helper: Get Room Avatar Color Style deterministically (Dark Theme)
  const getRoomAvatarStyles = (title) => {
    const colors = [
      { bg: 'bg-indigo-950/80 border border-indigo-800/60', text: 'text-indigo-400' },
      { bg: 'bg-violet-950/80 border border-violet-800/60', text: 'text-violet-400' },
      { bg: 'bg-rose-950/80 border border-rose-800/60', text: 'text-rose-400' },
      { bg: 'bg-amber-950/80 border border-amber-800/60', text: 'text-amber-400' },
      { bg: 'bg-emerald-950/80 border border-emerald-800/60', text: 'text-emerald-400' },
      { bg: 'bg-sky-950/80 border border-sky-800/60', text: 'text-sky-400' },
    ];
    const index = title ? title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="flex h-full bg-[#0b0e14] border border-[#1b202e] rounded-3xl overflow-hidden premium-shadow relative">
      {/* Sidebar: Room List */}
      <div className="w-80 border-r border-[#1b202e] flex flex-col bg-[#0b0e14] shrink-0">
        <div className="p-4 border-b border-[#1b202e]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-slate-100 tracking-tight">Messages</h2>
            {['admin', 'teacher'].includes(profile?.role?.toLowerCase()) && (
              <button 
                onClick={openNewChatModal}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all shadow-md shadow-indigo-950/30 hover:scale-105 active:scale-95 flex items-center justify-center"
                title="Start New Chat"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-[#161b26] text-sm text-slate-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-[#22293a] transition-all placeholder:text-slate-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {rooms.map(room => (
            <div 
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`p-3 mx-3 my-1.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                activeRoomId === room.id 
                  ? 'bg-indigo-950/40 border-indigo-800/40 shadow-sm shadow-indigo-950/10' 
                  : 'bg-transparent border-transparent hover:bg-[#11141c]'
              }`}
            >
              {/* Room Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform duration-300 ${
                activeRoomId === room.id ? 'scale-105' : ''
              } ${
                room.type === 'group' 
                  ? 'bg-gradient-to-tr from-indigo-500 to-violet-500 text-white' 
                  : `${getRoomAvatarStyles(room.title).bg} ${getRoomAvatarStyles(room.title).text}`
              }`}>
                {room.type === 'group' ? (
                  <Users size={16} />
                ) : (
                  getInitials(room.title)
                )}
              </div>

              {/* Room Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className={`text-sm truncate font-bold ${activeRoomId === room.id ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {room.title || 'Chat'}
                  </h3>
                  {room.last_message_at && (
                    <span className="text-[10px] text-slate-500 font-bold shrink-0 ml-1.5 mt-0.5">
                      {format(new Date(room.last_message_at), 'HH:mm')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate max-w-[170px] font-semibold">
                    {room.last_message || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {rooms.length === 0 && !loading && (
            <div className="p-8 text-center flex flex-col items-center justify-center mt-8">
              <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-500 text-xs font-bold mb-4">No conversations found.</p>
              {['admin', 'teacher'].includes(profile?.role?.toLowerCase()) && (
                <button 
                  onClick={openNewChatModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950/20 hover:scale-105 active:scale-95"
                >
                  Start New Chat
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#11141c]">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-[#1b202e] flex items-center justify-between px-6 bg-[#0b0e14] shrink-0">
              <div className="flex items-center gap-3">
                {/* Header Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                  activeRoom.type === 'group' 
                    ? 'bg-gradient-to-tr from-indigo-500 to-violet-500 text-white' 
                    : `${getRoomAvatarStyles(activeRoom.title).bg} ${getRoomAvatarStyles(activeRoom.title).text}`
                }`}>
                  {activeRoom.type === 'group' ? <Users size={16} /> : getInitials(activeRoom.title)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-100 text-sm md:text-base leading-none mb-1">
                    {activeRoom.title || 'Chat Room'}
                  </h2>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 capitalize font-extrabold tracking-wide">
                      {activeRoom.type} chat
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-250 p-2 hover:bg-[#161b26] rounded-lg transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0f1219] custom-scrollbar">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id;
                
                return (
                  <div key={msg.id || idx} className={`flex items-start gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm ${
                          getAvatarStyles(msg.sender?.role, msg.sender?.full_name).bg + ' ' + getAvatarStyles(msg.sender?.role, msg.sender?.full_name).text
                        }`}
                        title={`${msg.sender?.full_name} (${msg.sender?.role})`}
                      >
                        {getInitials(msg.sender?.full_name)}
                      </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && (
                        <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1 flex items-center gap-1.5 select-none">
                          {msg.sender?.full_name}
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-md border capitalize font-extrabold tracking-wide ${
                            msg.sender?.role === 'admin' ? 'bg-violet-950/80 border-violet-800/40 text-violet-400' :
                            msg.sender?.role === 'teacher' ? 'bg-amber-950/80 border-amber-800/40 text-amber-400' :
                            'bg-emerald-950/80 border-emerald-800/40 text-emerald-400'
                          }`}>
                            {msg.sender?.role}
                          </span>
                        </span>
                      )}
                      
                      <div 
                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isMine 
                            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-none' 
                            : 'bg-[#161b26] text-slate-100 rounded-tl-none border border-[#22293a]'
                        }`}
                      >
                        {msg.message_type === 'image' && msg.attachment_url ? (
                          <div className="mb-2 rounded-xl overflow-hidden border border-black/5 max-w-sm">
                            <img src={msg.attachment_url} alt="attachment" className="max-h-60 object-contain hover:scale-[1.02] transition-transform duration-300 cursor-pointer" />
                          </div>
                        ) : msg.message_type === 'file' && msg.attachment_url ? (
                          <a 
                            href={msg.attachment_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-sm font-bold border transition-colors ${
                              isMine 
                                ? 'bg-white/15 border-white/10 text-white hover:bg-white/20' 
                                : 'bg-[#0f1219] border-[#22293a] text-indigo-400 hover:text-indigo-300'
                            }`}
                          >
                            <FileText size={16} />
                            <span className="underline truncate max-w-[150px]">{msg.message}</span>
                          </a>
                        ) : null}
                        
                        {msg.message_type === 'text' && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</p>
                        )}
                        
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-indigo-200/90' : 'text-slate-400'}`}>
                          <span className="text-[9px] font-extrabold">
                            {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : 'Sending...'}
                          </span>
                          {isMine && (
                            <CheckCheck size={12} className={msg.id ? 'text-indigo-300' : 'text-indigo-500/50'} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-[#0b0e14] border-t border-[#1b202e] shrink-0">
              <form onSubmit={handleSend} className="flex items-end gap-2.5 max-w-7xl mx-auto">
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
                    className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-[#161b26] rounded-xl transition-all disabled:opacity-50 shrink-0"
                    title="Attach File"
                  >
                    {isUploading ? (
                      <Loader2 size={20} className="animate-spin text-indigo-500" />
                    ) : (
                      <Paperclip size={20} />
                    )}
                  </button>
                </div>
                
                <div className="flex-1 bg-[#161b26] rounded-2xl border border-[#22293a] flex items-center pr-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-[#161b26] transition-all">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-slate-100 px-4 py-3 focus:outline-none text-sm placeholder:text-slate-500 font-medium"
                  />
                  <button 
                    type="submit" 
                    disabled={(!messageText.trim() && !isUploading) || isUploading}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 hover:scale-105 active:scale-95 shrink-0 shadow-sm shadow-indigo-950/20"
                  >
                    <Send size={16} className="ml-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 bg-[#11141c]">
            <div className="h-20 w-20 rounded-3xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center shadow-lg shadow-indigo-950/20 text-indigo-400 transform hover:rotate-12 transition-transform duration-300">
              <Send size={32} className="ml-1" />
            </div>
            <div className="text-center max-w-xs px-4">
              <p className="text-base font-black text-slate-100 mb-1 tracking-tight">TuitionPro Messaging</p>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Select a conversation from the sidebar or start a new chat with your students or class groups.
              </p>
            </div>
            {['admin', 'teacher'].includes(profile?.role?.toLowerCase()) && (
              <button 
                onClick={openNewChatModal}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950/20 hover:scale-105 active:scale-95"
              >
                Start New Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f131a] border border-[#1b202e] rounded-3xl w-full max-w-md premium-shadow flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-[#1b202e] flex justify-between items-center bg-[#0b0e14]/50">
              <h3 className="text-lg font-black text-slate-100 tracking-tight">Start New Chat</h3>
              <button 
                onClick={() => { setShowModal(false); setSelectedBatchId(''); }} 
                className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-[#161b26] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Chat Type</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setNewChatType('private')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      newChatType === 'private' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20' 
                        : 'bg-[#161b26] text-slate-300 hover:bg-[#1d2433]'
                    }`}
                  >
                    Private (1-on-1)
                  </button>
                  <button 
                    onClick={() => setNewChatType('group')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      newChatType === 'group' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20' 
                        : 'bg-[#161b26] text-slate-300 hover:bg-[#1d2433]'
                    }`}
                  >
                    Group Chat
                  </button>
                </div>
              </div>

              {/* Title Input for Group */}
              {newChatType === 'group' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Link to Batch (Optional)</label>
                    <select 
                      value={selectedBatchId}
                      onChange={handleBatchSelect}
                      className="w-full bg-[#161b26] text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-[#22293a] transition-all font-medium text-sm cursor-pointer"
                    >
                      <option value="">-- No Batch Link --</option>
                      {batchesList.map(b => (
                        <option key={b.id} value={b.id}>{b.batch_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="animate-in">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Group Title</label>
                    <input 
                      type="text" 
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      placeholder="e.g. Class 10 Science" 
                      className="w-full bg-[#161b26] text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-[#22293a] transition-all placeholder:text-slate-500 font-medium text-sm"
                    />
                  </div>
                </div>
              )}

              {/* User Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Select {newChatType === 'private' ? 'User' : 'Participants'}
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {availableUsers.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                        selectedUsers.includes(u.id) 
                          ? 'bg-indigo-950/40 border-indigo-850 shadow-sm shadow-indigo-950/30' 
                          : 'bg-[#0f131a] border-[#1b202e] hover:border-indigo-800/60 hover:bg-[#161b26]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        selectedUsers.includes(u.id) 
                          ? 'bg-indigo-600 border-indigo-600 scale-105 shadow-sm shadow-indigo-950/20' 
                          : 'border-slate-600 bg-[#161b26] hover:border-slate-550'
                      }`}>
                        {selectedUsers.includes(u.id) && <Check size={12} className="text-white font-black" />}
                      </div>
                      
                      {/* User Avatar Initials */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        getAvatarStyles(u.role, u.full_name).bg + ' ' + getAvatarStyles(u.role, u.full_name).text
                      }`}>
                        {getInitials(u.full_name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-200 truncate">{u.full_name || 'Unnamed User'}</p>
                        <p className="text-[10px] text-slate-400 font-extrabold capitalize">{u.role}</p>
                      </div>
                    </div>
                  ))}
                  {availableUsers.length === 0 && (
                    <div className="text-center py-6">
                      <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-bold">No users found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1b202e] flex justify-end gap-3 bg-[#0b0e14]/50">
              <button 
                onClick={() => { setShowModal(false); setSelectedBatchId(''); }}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateChat}
                disabled={isCreating || selectedUsers.length === 0 || (newChatType === 'group' && !newChatTitle.trim())}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-indigo-950/20"
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
