import { supabase } from '@/lib/supabase/client';

export const teachersService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[TeachersService] Error fetching teachers:', err);
      throw err;
    }
  },

  async getCount() {
    try {
      const { count, error } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('[TeachersService] Error fetching teacher count:', err);
      return 0;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`[TeachersService] Error fetching teacher ${id}:`, err);
      throw err;
    }
  },

  async create(teacherData) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert([teacherData])
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error('[TeachersService] Error creating teacher:', err);
      throw err;
    }
  },

  async update(id, teacherData) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update(teacherData)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error(`[TeachersService] Error updating teacher ${id}:`, err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error(`[TeachersService] Error deleting teacher ${id}:`, err);
      throw err;
    }
  }
};
