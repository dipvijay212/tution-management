import { supabase } from '@/lib/supabase/client';

export const feesService = {
  async getAllRecords() {
    const { data, error } = await supabase
      .from('fees')
      .select('*, student:students!fees_student_id_fkey(full_name), batch:batches(batch_name)')
      .order('due_date', { ascending: false });
    
    if (error) {
      console.error('[FeesService] Error fetching all fee records:', error);
      throw error;
    }
    return data;
  },

  async recordPayment(paymentData) {
    const { data, error } = await supabase
      .from('fees')
      .insert([paymentData])
      .select();
    
    if (error) {
      console.error('[FeesService] Error recording payment:', error);
      throw error;
    }
    return data[0];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('fees')
      .select('*, student:students!fees_student_id_fkey(id, full_name), batch:batches(id, batch_name)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`[FeesService] Error fetching fee record ${id}:`, error);
      throw error;
    }
    return data;
  },

  async updateRecord(id, paymentData) {
    const { data, error } = await supabase
      .from('fees')
      .update(paymentData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`[FeesService] Error updating fee record ${id}:`, error);
      throw error;
    }
    return data[0];
  },

  async deleteRecord(id) {
    const { error } = await supabase
      .from('fees')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`[FeesService] Error deleting fee record ${id}:`, error);
      throw error;
    }
    return true;
  },

  async getStudentHistory(studentId) {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[FeesService] Error fetching student history for ${studentId}:`, error);
      throw error;
    }
    return data;
  },

  async getMonthlyStats(month, year) {
    const { data, error } = await supabase
      .from('fees')
      .select('amount, status') // updated from total_amount/paid_amount based on schema
      .eq('month', month)
      .eq('year', year);
    
    if (error) {
      console.error(`[FeesService] Error fetching monthly stats for ${month}/${year}:`, error);
      throw error;
    }
    return data;
  }
};
