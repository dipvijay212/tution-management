import { supabase } from '@/lib/supabase/client';

export const studentsService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[StudentsService] Error fetching students:', err);
      throw err;
    }
  },

  async getCount() {
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('[StudentsService] Error fetching student count:', err);
      return 0;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`[StudentsService] Error fetching student ${id}:`, err);
      throw err;
    }
  },

  async create(studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error('[StudentsService] Error creating student:', err);
      throw err;
    }
  },

  async update(id, studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error(`[StudentsService] Error updating student ${id}:`, err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error(`[StudentsService] Error deleting student ${id}:`, err);
      throw err;
    }
  }
};
