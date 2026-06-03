-- Run this in your Supabase SQL Editor to setup the Chat Module

DROP TABLE IF EXISTS public.typing_status CASCADE;
DROP TABLE IF EXISTS public.message_seen CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;

-- 1. chat_rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('group', 'private')),
    class_id UUID, -- For group chats (references classes/batches)
    created_by UUID, -- No FK constraint due to split users/auth tables
    title VARCHAR(255),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID, -- No FK constraint
    role VARCHAR(50), -- e.g., 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- 3. messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID, -- No FK constraint
    sender_role VARCHAR(50), -- 'admin', 'teacher', 'parent'
    message TEXT,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
    attachment_url TEXT,
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    edited BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. message_seen table
CREATE TABLE IF NOT EXISTS public.message_seen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID, -- No FK constraint
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- 5. typing_status table
CREATE TABLE IF NOT EXISTS public.typing_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID, -- No FK constraint
    is_typing BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_seen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- (The rest of the file)

-- Create a helper function to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_room_participant(check_room_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = check_room_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to check if user created the room
CREATE OR REPLACE FUNCTION public.is_room_creator(check_room_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = check_room_id AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Policies for chat_rooms
DROP POLICY IF EXISTS "Admins have full access to chat_rooms" ON public.chat_rooms;
CREATE POLICY "Admins have full access to chat_rooms" ON public.chat_rooms 
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND LOWER(users.role) = 'admin')
);

DROP POLICY IF EXISTS "Users can view rooms they are part of" ON public.chat_rooms;
CREATE POLICY "Users can view rooms they are part of" ON public.chat_rooms 
FOR SELECT TO authenticated USING (
    public.is_room_participant(id) OR created_by = auth.uid()
);

DROP POLICY IF EXISTS "Users can update rooms they are part of (e.g. last_message)" ON public.chat_rooms;
CREATE POLICY "Users can update rooms they are part of (e.g. last_message)" ON public.chat_rooms 
FOR UPDATE TO authenticated USING (
    public.is_room_participant(id)
);

DROP POLICY IF EXISTS "Users can insert chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can insert chat rooms" ON public.chat_rooms
FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
);


-- 2. Policies for chat_participants
DROP POLICY IF EXISTS "Admins have full access to chat_participants" ON public.chat_participants;
CREATE POLICY "Admins have full access to chat_participants" ON public.chat_participants 
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND LOWER(users.role) = 'admin')
);

DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.chat_participants;
CREATE POLICY "Users can view participants in their rooms" ON public.chat_participants 
FOR SELECT TO authenticated USING (
    public.is_room_participant(room_id)
);

DROP POLICY IF EXISTS "Users can insert participants" ON public.chat_participants;
CREATE POLICY "Users can insert participants" ON public.chat_participants 
FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() OR public.is_room_creator(room_id)
);


-- 3. Policies for messages
DROP POLICY IF EXISTS "Admins have full access to messages" ON public.messages;
CREATE POLICY "Admins have full access to messages" ON public.messages 
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND LOWER(users.role) = 'admin')
);

DROP POLICY IF EXISTS "Admin full access messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.messages;
CREATE POLICY "Users can view messages in their rooms" ON public.messages 
FOR SELECT TO authenticated USING (
    public.is_room_participant(room_id)
);

DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.messages;
CREATE POLICY "Users can send messages to their rooms" ON public.messages 
FOR INSERT TO authenticated WITH CHECK (
    public.is_room_participant(room_id) AND sender_id = auth.uid()
);


-- 4. Policies for message_seen
DROP POLICY IF EXISTS "Users can view seen receipts in their rooms" ON public.message_seen;
CREATE POLICY "Users can view seen receipts in their rooms" ON public.message_seen 
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.messages m 
        WHERE m.id = message_seen.message_id AND public.is_room_participant(m.room_id)
    )
);

DROP POLICY IF EXISTS "Users can insert their own seen receipts" ON public.message_seen;
CREATE POLICY "Users can insert their own seen receipts" ON public.message_seen 
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());


-- 5. Policies for typing_status
DROP POLICY IF EXISTS "Users can view typing status in their rooms" ON public.typing_status;
CREATE POLICY "Users can view typing status in their rooms" ON public.typing_status 
FOR SELECT TO authenticated USING (
    public.is_room_participant(room_id)
);

DROP POLICY IF EXISTS "Users can update their own typing status" ON public.typing_status;
CREATE POLICY "Users can update their own typing status" ON public.typing_status 
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Enable realtime for tables
alter publication supabase_realtime add table chat_rooms;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table typing_status;
alter publication supabase_realtime add table message_seen;

-- Set up storage bucket for chat attachments
insert into storage.buckets (id, name, public) values ('chat-attachments', 'chat-attachments', true) on conflict do nothing;

-- Removed migration block because we are doing a clean wipe at the top.
-- Create storage policy for chat-attachments
DROP POLICY IF EXISTS "Give users authenticated access to folder" ON storage.objects;
CREATE POLICY "Give users authenticated access to folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Give users public access to read files" ON storage.objects;
CREATE POLICY "Give users public access to read files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'chat-attachments');
