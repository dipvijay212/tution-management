import { supabase } from '@/lib/supabase/client';

export const attendanceService = {
  async getByBatchAndDate(batchId, date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('batch_id', batchId)
      .eq('attendance_date', date);
    if (error) throw error;
    return data;
  },

  async markAttendance(attendanceRecords) {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];
    
    const batchId = attendanceRecords[0].batch_id;
    const date = attendanceRecords[0].attendance_date;

    // Delete existing records for this batch and date
    const { error: delError } = await supabase
      .from('attendance')
      .delete()
      .eq('batch_id', batchId)
      .eq('attendance_date', date);
    
    if (delError) throw delError;

    // Insert new records
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendanceRecords)
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
