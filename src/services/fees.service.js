import { supabase } from '@/lib/supabase/client';

export const feesService = {
  async getAllRecords() {
    const { data, error } = await supabase
      .from('fees')
      .select('*, student:students(full_name), batch:batches(batch_name)')
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

  async getStudentHistory(studentId) {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('payment_date', { ascending: false });
    
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
