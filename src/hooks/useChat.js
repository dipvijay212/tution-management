import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export const useChat = (roomId = null) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch all rooms for the current user
  const fetchRooms = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Admin sees all rooms. Teachers/Parents see rooms they are part of
      let query = supabase.from('chat_rooms').select(`
        *,
        chat_participants!inner(user_id)
      `);

      // If not admin, filter by participant
      if (profile?.role?.toLowerCase() !== 'admin') {
        query = query.eq('chat_participants.user_id', user.id);
      }

      const { data, error: fetchError } = await query.order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRooms(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Fetch messages for a specific room
  const fetchMessages = useCallback(async (roomId) => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      
      let messagesWithSenders = data || [];
      if (messagesWithSenders.length > 0) {
        const userIds = [...new Set(messagesWithSenders.map(m => m.sender_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, full_name, role')
            .in('id', userIds);
            
          messagesWithSenders = messagesWithSenders.map(m => ({
            ...m,
            sender: usersData?.find(u => u.id === m.sender_id) || { id: m.sender_id, full_name: 'Unknown User' }
          }));
        }
      }

      setMessages(messagesWithSenders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = async (roomId, text, type = 'text', attachmentUrl = null) => {
    if (!user || !roomId || (!text && !attachmentUrl)) return;
    
    try {
      const newMessage = {
        room_id: roomId,
        sender_id: user.id,
        sender_role: profile?.role,
        message: text,
        message_type: type,
        attachment_url: attachmentUrl,
      };

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (insertError) throw insertError;

      // Manually attach sender for the UI and notification
      const completeData = {
        ...data,
        sender: { id: user.id, full_name: profile?.full_name || 'Me', role: profile?.role }
      };

      // Update room last_message
      await supabase
        .from('chat_rooms')
        .update({ 
          last_message: type === 'text' ? text : `Sent a ${type}`,
          last_message_at: new Date().toISOString()
        })
        .eq('id', roomId);

      // Append to local state immediately for snappy UI
      setMessages(prev => {
        if (prev.find(m => m.id === completeData.id)) return prev;
        return [...prev, completeData];
      });

      // Trigger WhatsApp Notification
      fetch('/api/chat/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: completeData, roomId }),
      }).catch(console.error); // Fire and forget

      return completeData;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      return null;
    }
  };

  // Upload file to Supabase storage
  const uploadFile = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  // Realtime subscription setup
  useEffect(() => {
    if (!roomId) return;

    const messageSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Fetch sender details to attach to payload since realtime doesn't auto-join
          const { data: senderData } = await supabase
            .from('users')
            .select('id, full_name, role')
            .eq('id', payload.new.sender_id)
            .single();
            
          const completeMessage = {
            ...payload.new,
            sender: senderData || { id: payload.new.sender_id, full_name: 'Unknown User' }
          };

          setMessages((prev) => {
            if (prev.find(m => m.id === completeMessage.id)) return prev;
            return [...prev, completeMessage];
          });
        }
      )
      .subscribe();

    const typingSubscription = supabase
      .channel(`typing:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        // Implement presence for typing
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(typingSubscription);
    };
  }, [roomId]);

  return {
    rooms,
    messages,
    loading,
    error,
    isTyping,
    fetchRooms,
    fetchMessages,
    sendMessage,
    uploadFile,
    createTestRoom: async () => {
      try {
        const { data: room, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({ type: 'private', title: 'Test Chat Room', created_by: user.id })
          .select()
          .single();
          
        if (roomError) throw roomError;

        await supabase
          .from('chat_participants')
          .insert({ room_id: room.id, user_id: user.id, role: 'admin' });
          
        await fetchRooms();
      } catch (err) {
        console.error('Error creating test room:', err);
      }
    },
    createChatRoom: async (type, title, participantIds = []) => {
      try {
        const { data: room, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({ type, title, created_by: user.id })
          .select()
          .single();
          
        if (roomError) throw roomError;

        // Ensure current user is in participantIds
        const participants = new Set(participantIds);
        participants.add(user.id);
        
        const participantRows = Array.from(participants).map(id => ({
           room_id: room.id,
           user_id: id,
           role: id === user.id ? 'admin' : 'member'
        }));

        const { error: partError } = await supabase.from('chat_participants').insert(participantRows);
        if (partError) throw partError;
        
        await fetchRooms();
        return room.id;
      } catch (err) {
        console.error('Error creating room:', err);
        throw err;
      }
    },
    fetchUsers: async () => {
      // Helper to fetch users for the modal dropdown
      const { data } = await supabase.from('users').select('id, full_name, role').neq('id', user?.id);
      return data || [];
    }
  };
};
