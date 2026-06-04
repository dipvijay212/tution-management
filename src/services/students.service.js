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
  },

  async getStudentBatches(studentId) {
    try {
      const { data, error } = await supabase
        .from('student_batches')
        .select('batch_id, batches(*, subject:subjects!batches_subject_id_fkey(name), teacher:teachers!batches_teacher_id_fkey(full_name))')
        .eq('student_id', studentId);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`[StudentsService] Error getting student batches for ${studentId}:`, err);
      throw err;
    }
  },

  async updateStudentBatches(studentId, newBatchIds) {
    try {
      // 1. Fetch current batches
      const { data: currentAssignments, error: fetchError } = await supabase
        .from('student_batches')
        .select('batch_id')
        .eq('student_id', studentId);
      
      if (fetchError) throw fetchError;
      
      const currentBatchIds = currentAssignments?.map(a => a.batch_id) || [];
      
      // Determine insertions and deletions
      const toDelete = currentBatchIds.filter(id => !newBatchIds.includes(id));
      const toInsert = newBatchIds.filter(id => !currentBatchIds.includes(id));
      
      // 2. Perform deletions
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('student_batches')
          .delete()
          .eq('student_id', studentId)
          .in('batch_id', toDelete);
        
        if (deleteError) throw deleteError;
      }
      
      // 3. Perform insertions
      if (toInsert.length > 0) {
        const enrollments = toInsert.map(batchId => ({
          student_id: studentId,
          batch_id: batchId
        }));
        
        const { error: insertError } = await supabase
          .from('student_batches')
          .insert(enrollments);
        
        if (insertError) throw insertError;
      }

      // --- CHAT ROOMS SYNCHRONIZATION ---
      const { data: studentData, error: sError } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .single();
        
      if (sError) throw sError;
      const userId = studentData?.user_id;
      
      if (userId) {
        const { data: userData, error: uError } = await supabase
          .from('users')
          .select('auth_id')
          .eq('id', userId)
          .single();
          
        if (uError) throw uError;
        const authId = userData?.auth_id;
        
        if (authId) {
          // A. For deleted batches: remove from chat participants
          if (toDelete.length > 0) {
            const { data: roomsToDeleteFrom } = await supabase
              .from('chat_rooms')
              .select('id')
              .in('class_id', toDelete);
              
            if (roomsToDeleteFrom && roomsToDeleteFrom.length > 0) {
              const roomIds = roomsToDeleteFrom.map(r => r.id);
              await supabase
                .from('chat_participants')
                .delete()
                .eq('user_id', authId)
                .in('room_id', roomIds);
            }
          }
          
          // B. For inserted batches: add to chat participants
          if (toInsert.length > 0) {
            const { data: roomsToInsertTo } = await supabase
              .from('chat_rooms')
              .select('id')
              .in('class_id', toInsert);
              
            if (roomsToInsertTo && roomsToInsertTo.length > 0) {
              const participantRows = roomsToInsertTo.map(r => ({
                room_id: r.id,
                user_id: authId,
                role: 'member'
              }));
              
              await supabase
                .from('chat_participants')
                .insert(participantRows);
            }
          }
        }
      }
      // --- END CHAT ROOMS SYNCHRONIZATION ---
    } catch (err) {
      console.error(`[StudentsService] Error updating batches for student ${studentId}:`, err);
      throw err;
    }
  }
};
