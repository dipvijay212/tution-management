import { supabase } from '@/lib/supabase/client';

export const attendanceService = {
  async getByBatchAndDate(batchId, date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('batch_id', batchId)
      .eq('date', date);
    if (error) throw error;
    return data;
  },

  async markAttendance(attendanceRecords) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, { onConflict: 'student_id,batch_id,date' })
      .select();
    if (error) throw error;
    return data;
  },

  async subscribeToChanges(batchId, date, callback) {
    return supabase
      .channel(`attendance-${batchId}-${date}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'attendance',
          filter: `batch_id=eq.${batchId}` 
        },
        (payload) => callback(payload)
      )
      .subscribe();
  }
};
