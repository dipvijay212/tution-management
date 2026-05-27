import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    console.log('[Create Teacher API] Request received.');

    // 0. Verify Supabase Service Role Key is configured and not the placeholder
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || serviceRoleKey === 'your_supabase_service_role_key_here') {
      console.error('[Create Teacher API] SUPABASE_SERVICE_ROLE_KEY is not configured in .env');
      return NextResponse.json({ 
        error: 'Supabase Service Role Key is not configured. Please replace the "your_supabase_service_role_key_here" placeholder with your actual Supabase Service Role Key in the .env file.' 
      }, { status: 500 });
    }

    // 1. Verify caller is authenticated and has admin privileges
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.warn('[Create Teacher API] Missing authorization header token.');
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    console.log('[Create Teacher API] Verifying token using anonClient...');
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[Create Teacher API] auth.getUser failed. Error:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    console.log('[Create Teacher API] User authenticated as auth_id:', user.id);

    // Query public.users to check role
    console.log('[Create Teacher API] Querying public.users role...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (profileError) {
      console.error('[Create Teacher API] Error querying public.users role:', profileError);
    }

    if (profileError || !profile || profile.role !== 'admin') {
      console.warn('[Create Teacher API] Access forbidden. Role verified:', profile?.role);
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    console.log('[Create Teacher API] Caller role verified as admin. Parsing request body...');

    // 2. Parse and validate parameters
    const body = await request.json();
    const {
      full_name,
      email,
      password,
      phone,
      qualification,
      specialization,
      experience_years,
      salary,
    } = body;

    console.log('[Create Teacher API] Parameters parsed:', { full_name, email, phone, qualification, specialization, experience_years, salary });

    if (!full_name || !email || !password) {
      console.warn('[Create Teacher API] Missing required parameters.');
      return NextResponse.json({ error: 'Full name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      console.warn('[Create Teacher API] Password too short.');
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // 3. Create the auth user via Admin SDK
    console.log('[Create Teacher API] Invoking supabaseAdmin.auth.admin.createUser...');
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'teacher' },
    });

    if (createAuthError) {
      console.error('[Create Teacher API] supabaseAdmin.auth.admin.createUser error:', createAuthError);
      return NextResponse.json({ error: createAuthError.message }, { status: 400 });
    }

    const authId = authData.user.id;
    console.log('[Create Teacher API] Auth user created successfully with auth_id:', authId);
    let publicUserId = null;

    try {
      // 4. Insert the global profile into public.users
      console.log('[Create Teacher API] Inserting user profile into public.users table...');
      const { data: publicUser, error: publicUserError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: authId,
          full_name,
          email,
          phone: phone || null,
          role: 'teacher',
        })
        .select()
        .single();

      if (publicUserError) {
        console.error('[Create Teacher API] publicUserError inserting profile:', publicUserError);
        throw publicUserError;
      }
      
      publicUserId = publicUser.id;
      console.log('[Create Teacher API] User profile inserted successfully. public.users.id:', publicUserId);

      // 5. Insert teacher-specific metadata into teachers
      console.log('[Create Teacher API] Inserting teacher metadata into teachers table...');
      const { error: teacherError } = await supabaseAdmin
        .from('teachers')
        .insert({
          user_id: publicUserId,
          full_name,
          email,
          phone: phone || null,
          qualification: qualification || null,
          specialization: specialization || null,
          experience_years: parseInt(experience_years) || 0,
          salary: parseFloat(salary) || 0,
        });

      if (teacherError) {
        console.error('[Create Teacher API] teacherError inserting metadata:', teacherError);
        throw teacherError;
      }

      console.log('[Create Teacher API] Teacher record created successfully.');
      return NextResponse.json({
        success: true,
        message: 'Teacher account created successfully',
        teacher: {
          id: publicUserId,
          full_name,
          email,
        },
      });
    } catch (dbError) {
      console.error('[Create Teacher API] DB Error occurred, initiating rollback deletion of auth user:', dbError);
      
      // Rollback auth user creation if db inserts fail to keep schemas synchronized
      await supabaseAdmin.auth.admin.deleteUser(authId);
      console.log('[Create Teacher API] Rollback successful: deleted auth user:', authId);
      
      return NextResponse.json({
        error: dbError.message || 'Failed to populate database records',
      }, { status: 500 });
    }
  } catch (err) {
    console.error('[Create Teacher API] Fatal runtime error:', err);
    return NextResponse.json({ error: 'An unexpected internal server error occurred' }, { status: 500 });
  }
}
