-- Run this in your Supabase SQL Editor

-- 1. Create the teacher_attendance table
CREATE TABLE IF NOT EXISTS public.teacher_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Half Day', 'Leave')),
    check_in TIME,
    check_out TIME,
    remarks TEXT,
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one attendance record per teacher per day
    UNIQUE(teacher_id, attendance_date)
);

-- 2. Enable Row Level Security
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Admins can do everything
CREATE POLICY "Admins have full access to teacher_attendance" 
ON public.teacher_attendance 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Teachers can view their own attendance
CREATE POLICY "Teachers can view their own attendance" 
ON public.teacher_attendance 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.teachers 
        WHERE teachers.id = teacher_attendance.teacher_id 
        AND teachers.email = (SELECT email FROM public.users WHERE users.id = auth.uid())
    )
);

-- Teachers can insert their own attendance
CREATE POLICY "Teachers can mark their own attendance" 
ON public.teacher_attendance 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.teachers 
        WHERE teachers.id = teacher_attendance.teacher_id 
        AND teachers.email = (SELECT email FROM public.users WHERE users.id = auth.uid())
    )
);

-- Teachers can update their own attendance (for check-out)
CREATE POLICY "Teachers can update their own attendance" 
ON public.teacher_attendance 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.teachers 
        WHERE teachers.id = teacher_attendance.teacher_id 
        AND teachers.email = (SELECT email FROM public.users WHERE users.id = auth.uid())
    )
);

-- 4. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Only create the trigger if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_teacher_attendance_modtime') THEN
        CREATE TRIGGER update_teacher_attendance_modtime
        BEFORE UPDATE ON public.teacher_attendance
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;
