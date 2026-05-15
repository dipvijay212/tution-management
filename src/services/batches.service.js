import { supabase } from '@/lib/supabase/client';

export const batchesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('batches')
      .select('*, teacher:teachers!batches_teacher_id_fkey(full_name), subject:subjects!batches_subject_id_fkey(name)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[BatchesService] Error fetching batches:', error);
      throw error;
    }
    return data;
  },

  async getCount() {
    try {
      const { count, error } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('[BatchesService] Error fetching batch count:', err);
      return 0;
    }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('batches')
      .select('*, teacher:teachers!batches_teacher_id_fkey(*), subject:subjects!batches_subject_id_fkey(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`[BatchesService] Error fetching batch ${id}:`, error);
      throw error;
    }
    return data;
  },

  async create(batchData) {
    const { data, error } = await supabase
      .from('batches')
      .insert([batchData])
      .select();
    
    if (error) {
      console.error('[BatchesService] Error creating batch:', error);
      throw error;
    }
    return data[0];
  },

  async update(id, batchData) {
    const { data, error } = await supabase
      .from('batches')
      .update(batchData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`[BatchesService] Error updating batch ${id}:`, error);
      throw error;
    }
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`[BatchesService] Error deleting batch ${id}:`, error);
      throw error;
    }
  }
};
