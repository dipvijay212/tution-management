-- Create the whatsapp_logs table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    parent_phone TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'ATTENDANCE', 'FEE_REMINDER', 'BROADCAST', 'EXAM', 'HOMEWORK', 'CUSTOM'
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
-- Admins can view all logs
DROP POLICY IF EXISTS "Admins can view all whatsapp logs" ON whatsapp_logs;
CREATE POLICY "Admins can view all whatsapp logs" ON whatsapp_logs
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
      )
    );

-- Admins can insert logs
DROP POLICY IF EXISTS "Admins can insert whatsapp logs" ON whatsapp_logs;
CREATE POLICY "Admins can insert whatsapp logs" ON whatsapp_logs
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
      )
    );

-- Teachers can view logs where they are the teacher_id or sent_by
DROP POLICY IF EXISTS "Teachers can view their own whatsapp logs" ON whatsapp_logs;
CREATE POLICY "Teachers can view their own whatsapp logs" ON whatsapp_logs
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'teacher'
      )
    );

-- Teachers can insert logs
DROP POLICY IF EXISTS "Teachers can insert whatsapp logs" ON whatsapp_logs;
CREATE POLICY "Teachers can insert whatsapp logs" ON whatsapp_logs
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'teacher'
      )
    );
