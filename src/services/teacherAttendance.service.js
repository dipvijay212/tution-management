import { supabase } from '@/lib/supabase/client';

export const teacherAttendanceService = {
  // 1. markAttendance(data)
  async markAttendance(data) {
    try {
      const { data: result, error } = await supabase
        .from('teacher_attendance')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    } catch (err) {
      console.error('[teacherAttendanceService] markAttendance error:', err);
      throw err;
    }
  },

  // 2. getTodayAttendance(teacherId)
  async getTodayAttendance(teacherId) {
    try {
      // Use local date format YYYY-MM-DD
      const today = new Date().toLocaleDateString('en-CA');
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('attendance_date', today)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[teacherAttendanceService] getTodayAttendance error:', err);
      throw err;
    }
  },

  // 3. checkOut(attendanceId, checkOutTime)
  async checkOut(attendanceId, checkOutTime) {
    try {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .update({ check_out: checkOutTime })
        .eq('id', attendanceId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[teacherAttendanceService] checkOut error:', err);
      throw err;
    }
  },

  // 4. getTeacherHistory(teacherId)
  async getTeacherHistory(teacherId) {
    try {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('attendance_date', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[teacherAttendanceService] getTeacherHistory error:', err);
      throw err;
    }
  },

  // 5. getAllAttendance(filters)
  async getAllAttendance(filters = {}) {
    try {
      let query = supabase
        .from('teacher_attendance')
        .select(`
          *,
          teachers:teacher_id (
            id,
            full_name,
            email,
            specialization
          )
        `);

      if (filters.teacherId) {
        query = query.eq('teacher_id', filters.teacherId);
      }
      if (filters.date) {
        query = query.eq('attendance_date', filters.date);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('attendance_date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[teacherAttendanceService] getAllAttendance error:', err);
      throw err;
    }
  },

  // 6. updateAttendance(id, payload)
  async updateAttendance(id, payload) {
    try {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[teacherAttendanceService] updateAttendance error:', err);
      throw err;
    }
  },

  // 7. deleteAttendance(id)
  async deleteAttendance(id) {
    try {
      const { error } = await supabase
        .from('teacher_attendance')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[teacherAttendanceService] deleteAttendance error:', err);
      throw err;
    }
  }
};
