import { supabase } from '@/lib/supabase/client';

export const assignmentsService = {
  async getAll(batchId = null) {
    try {
      let query = supabase.from('assignments').select('*');
      if (batchId) {
        query = query.eq('batch_id', batchId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('[AssignmentsService] Error fetching assignments:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('[AssignmentsService] Exception in getAll:', err);
      throw err;
    }
  },

  async uploadFile(bucket, file, folder = '') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        console.error('[AssignmentsService] Error uploading file:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { path: filePath, url: publicUrl, name: file.name };
    } catch (err) {
      console.error('[AssignmentsService] Exception in uploadFile:', err);
      throw err;
    }
  },

  async createAssignment(assignmentData) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select();
      
      if (error) {
        console.error('[AssignmentsService] Error creating assignment:', error);
        throw error;
      }
      return data[0];
    } catch (err) {
      console.error('[AssignmentsService] Exception in createAssignment:', err);
      throw err;
    }
  },

  async submitHomework(submissionData) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert([submissionData])
        .select();
      
      if (error) {
        console.error('[AssignmentsService] Error submitting homework:', error);
        throw error;
      }
      return data[0];
    } catch (err) {
      console.error('[AssignmentsService] Exception in submitHomework:', err);
      throw err;
    }
  },

  async getSubmissions(assignmentId) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, student:students(full_name)')
        .eq('assignment_id', assignmentId);
      
      if (error) {
        console.error(`[AssignmentsService] Error fetching submissions for ${assignmentId}:`, error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('[AssignmentsService] Exception in getSubmissions:', err);
      throw err;
    }
  }
};
