import { whatsappService } from './baileys.service';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const whatsappAutomation = {
  /**
   * Triggered when a student is marked absent
   */
  async sendAbsentAlert(studentId, date, markedBy) {
    try {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('first_name, parent_phone')
        .eq('id', studentId)
        .single();
        
      if (!student || !student.parent_phone) return;

      const message = `Dear Parent, your child ${student.first_name} was marked absent on ${date}. Please ensure regular attendance.`;
      
      let status = 'PENDING';
      try {
        await whatsappService.sendMessage(student.parent_phone, message);
        status = 'SENT';
      } catch (err) {
        status = 'FAILED';
      }

      await supabaseAdmin.from('whatsapp_logs').insert({
        student_id: studentId,
        parent_phone: student.parent_phone,
        message_type: 'ATTENDANCE_ALERT',
        message_body: message,
        status,
        sent_by: markedBy
      });

    } catch (error) {
      console.error('Automation error (Absent Alert):', error);
    }
  },

  /**
   * Triggered when a student is late
   */
  async sendLateAlert(studentId, arrivalTime, markedBy) {
    try {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('first_name, parent_phone')
        .eq('id', studentId)
        .single();
        
      if (!student || !student.parent_phone) return;

      const message = `Dear Parent, your child ${student.first_name} arrived late today at ${arrivalTime}.`;
      
      let status = 'PENDING';
      try {
        await whatsappService.sendMessage(student.parent_phone, message);
        status = 'SENT';
      } catch (err) {
        status = 'FAILED';
      }

      await supabaseAdmin.from('whatsapp_logs').insert({
        student_id: studentId,
        parent_phone: student.parent_phone,
        message_type: 'LATE_ALERT',
        message_body: message,
        status,
        sent_by: markedBy
      });

    } catch (error) {
      console.error('Automation error (Late Alert):', error);
    }
  },

  /**
   * Triggered when fee is due/pending
   */
  async sendFeeReminder(studentId, amount, dueDate, adminId) {
    try {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('first_name, parent_phone')
        .eq('id', studentId)
        .single();
        
      if (!student || !student.parent_phone) return;

      const message = `Dear Parent, fee payment of ₹${amount} for ${student.first_name} is pending. Due date: ${dueDate}. Please pay at the earliest.`;
      
      let status = 'PENDING';
      try {
        await whatsappService.sendMessage(student.parent_phone, message);
        status = 'SENT';
      } catch (err) {
        status = 'FAILED';
      }

      await supabaseAdmin.from('whatsapp_logs').insert({
        student_id: studentId,
        parent_phone: student.parent_phone,
        message_type: 'FEE_REMINDER',
        message_body: message,
        status,
        sent_by: adminId
      });

    } catch (error) {
      console.error('Automation error (Fee Reminder):', error);
    }
  },
  
  /**
   * Triggered when an exam is scheduled
   */
  async sendExamReminder(studentId, examName, date, time, adminId) {
    try {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('first_name, parent_phone')
        .eq('id', studentId)
        .single();
        
      if (!student || !student.parent_phone) return;

      const message = `Dear Parent, a reminder that ${student.first_name} has an upcoming exam: ${examName} on ${date} at ${time}.`;
      
      let status = 'PENDING';
      try {
        await whatsappService.sendMessage(student.parent_phone, message);
        status = 'SENT';
      } catch (err) {
        status = 'FAILED';
      }

      await supabaseAdmin.from('whatsapp_logs').insert({
        student_id: studentId,
        parent_phone: student.parent_phone,
        message_type: 'EXAM_REMINDER',
        message_body: message,
        status,
        sent_by: adminId
      });

    } catch (error) {
      console.error('Automation error (Exam Reminder):', error);
    }
  }
};
