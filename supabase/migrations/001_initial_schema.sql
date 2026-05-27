-- =====================================================
-- EXTENSIONS
-- =====================================================

create extension if not exists "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================

create table if not exists users (
  id uuid primary key default gen_random_uuid(),

  auth_id uuid unique,

  full_name text not null,

  email text unique not null,

  phone text,

  role text check (
    role in ('admin', 'teacher', 'student')
  ) not null,

  profile_image text,

  created_at timestamp default now()
);

-- =====================================================
-- TEACHERS TABLE
-- =====================================================

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references users(id) on delete cascade,

  full_name text not null,

  email text unique not null,

  phone text,

  qualification text,

  specialization text,

  experience_years integer default 0,

  salary numeric default 0,

  created_at timestamp default now()
);

-- =====================================================
-- STUDENTS TABLE
-- =====================================================

create table if not exists students (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references users(id) on delete cascade,

  student_code text unique,

  full_name text not null,

  email text unique,

  phone text,

  gender text,

  date_of_birth date,

  class_name text,

  school_name text,

  parent_name text,

  parent_phone text,

  address text,

  created_at timestamp default now()
);

-- =====================================================
-- SUBJECTS TABLE
-- =====================================================

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),

  name text unique not null,

  description text,

  created_at timestamp default now()
);

-- =====================================================
-- BATCHES TABLE
-- =====================================================

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),

  batch_name text not null,

  teacher_id uuid references teachers(id) on delete set null,

  subject_id uuid references subjects(id) on delete set null,

  start_time time,

  end_time time,

  room_number text,

  capacity integer default 0,

  fees numeric default 0,

  days text,

  created_at timestamp default now()
);

-- =====================================================
-- STUDENT BATCH RELATION
-- =====================================================

create table if not exists student_batches (
  id uuid primary key default gen_random_uuid(),

  student_id uuid references students(id) on delete cascade,

  batch_id uuid references batches(id) on delete cascade,

  created_at timestamp default now()
);

-- =====================================================
-- STUDENT ATTENDANCE
-- =====================================================

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),

  student_id uuid references students(id) on delete cascade,

  batch_id uuid references batches(id) on delete cascade,

  attendance_date date not null default current_date,

  status text check (
    status in ('Present', 'Absent', 'Late', 'Leave')
  ) default 'Present',

  remarks text,

  created_at timestamp default now()
);

-- =====================================================
-- TEACHER ATTENDANCE
-- =====================================================

create table if not exists teacher_attendance (
  id uuid primary key default gen_random_uuid(),

  teacher_id uuid references teachers(id) on delete cascade,

  attendance_date date not null default current_date,

  status text check (
    status in (
      'Present',
      'Absent',
      'Half Day',
      'Leave',
      'Late'
    )
  ) default 'Present',

  check_in time,

  check_out time,

  remarks text,

  marked_by uuid references users(id),

  created_at timestamp default now(),

  updated_at timestamp default now(),

  unique (teacher_id, attendance_date)
);

-- =====================================================
-- FEES TABLE
-- =====================================================

create table if not exists fees (
  id uuid primary key default gen_random_uuid(),

  student_id uuid references students(id) on delete cascade,

  amount numeric not null,

  payment_method text,

  transaction_id text,

  due_date date,

  payment_date date,

  status text check (
    status in ('Pending', 'Paid', 'Partial')
  ) default 'Pending',

  created_at timestamp default now()
);

-- =====================================================
-- EXAMS TABLE
-- =====================================================

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  batch_id uuid references batches(id) on delete cascade,

  exam_date date,

  total_marks integer default 100,

  passing_marks integer default 35,

  description text,

  created_at timestamp default now()
);

-- =====================================================
-- EXAM RESULTS TABLE
-- =====================================================

create table if not exists exam_results (
  id uuid primary key default gen_random_uuid(),

  exam_id uuid references exams(id) on delete cascade,

  student_id uuid references students(id) on delete cascade,

  marks_obtained integer,

  total_marks integer,

  remarks text,

  created_at timestamp default now()
);

-- =====================================================
-- ASSIGNMENTS TABLE
-- =====================================================

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),

  batch_id uuid references batches(id) on delete cascade,

  teacher_id uuid references teachers(id) on delete set null,

  title text not null,

  description text,

  due_date date,

  file_url text,

  created_at timestamp default now()
);

-- =====================================================
-- ASSIGNMENT SUBMISSIONS
-- =====================================================

create table if not exists assignment_submissions (
  id uuid primary key default gen_random_uuid(),

  assignment_id uuid references assignments(id) on delete cascade,

  student_id uuid references students(id) on delete cascade,

  submission_url text,

  submitted_at timestamp default now(),

  remarks text
);

-- =====================================================
-- ENABLE RLS
-- =====================================================

alter table users enable row level security;
alter table teachers enable row level security;
alter table students enable row level security;
alter table subjects enable row level security;
alter table batches enable row level security;
alter table student_batches enable row level security;
alter table attendance enable row level security;
alter table teacher_attendance enable row level security;
alter table fees enable row level security;
alter table exams enable row level security;
alter table exam_results enable row level security;
alter table assignments enable row level security;
alter table assignment_submissions enable row level security;

-- =====================================================
-- DEVELOPMENT POLICIES
-- =====================================================

create policy "Full access users"
on users
for all
to authenticated
using (true)
with check (true);

create policy "Full access teachers"
on teachers
for all
to authenticated
using (true)
with check (true);

create policy "Full access students"
on students
for all
to authenticated
using (true)
with check (true);

create policy "Full access subjects"
on subjects
for all
to authenticated
using (true)
with check (true);

create policy "Full access batches"
on batches
for all
to authenticated
using (true)
with check (true);

create policy "Full access student batches"
on student_batches
for all
to authenticated
using (true)
with check (true);

create policy "Full access attendance"
on attendance
for all
to authenticated
using (true)
with check (true);

create policy "Full access teacher attendance"
on teacher_attendance
for all
to authenticated
using (true)
with check (true);

create policy "Full access fees"
on fees
for all
to authenticated
using (true)
with check (true);

create policy "Full access exams"
on exams
for all
to authenticated
using (true)
with check (true);

create policy "Full access exam results"
on exam_results
for all
to authenticated
using (true)
with check (true);

create policy "Full access assignments"
on assignments
for all
to authenticated
using (true)
with check (true);

create policy "Full access assignment submissions"
on assignment_submissions
for all
to authenticated
using (true)
with check (true);