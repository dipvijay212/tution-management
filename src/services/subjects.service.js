import { supabase } from '@/lib/supabase/client';

export const subjectsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  }
};
