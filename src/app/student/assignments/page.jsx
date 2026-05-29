'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { 
  Loader2, 
  Calendar as CalendarIcon,
  BookOpen,
  ArrowRight,
  ExternalLink,
  UploadCloud,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAssignmentsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [studentId, setStudentId] = useState(null);
  
  // Submit modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      loadAssignmentsData();
    }
  }, [profile]);

  const loadAssignmentsData = async () => {
    try {
      setLoading(true);

      // 1. Fetch student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) return;
      setStudentId(studentData.id);

      // 2. Fetch student enrolled batches
      const { data: batchData, error: batchError } = await supabase
        .from('student_batches')
        .select('batch_id')
        .eq('student_id', studentData.id);
      
      if (batchError) throw batchError;
      const batchIds = batchData?.map(b => b.batch_id) || [];

      if (batchIds.length === 0) {
        setAssignments([]);
        return;
      }

      // 3. Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          batch:batches(
            batch_name
          ),
          teacher:teachers(
            full_name
          )
        `)
        .in('batch_id', batchIds)
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // 4. Fetch student's submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentData.id);

      if (submissionsError) throw submissionsError;

      // 5. Merge assignments with submissions
      const merged = (assignmentsData || []).map(asm => {
        const sub = (submissionsData || []).find(s => s.assignment_id === asm.id);
        return {
          ...asm,
          submission: sub || null
        };
      });

      setAssignments(merged);
    } catch (err) {
      console.error('Error loading assignments:', err);
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (asm) => {
    setSelectedAssignment(asm);
    setSubmissionUrl(asm.submission?.submission_url || '');
    setSubmissionRemarks(asm.submission?.remarks || '');
    setIsSubmitModalOpen(true);
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
    setSelectedAssignment(null);
    setSubmissionUrl('');
    setSubmissionRemarks('');
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionUrl.trim()) {
      toast.error('Please enter a valid submission URL.');
      return;
    }

    try {
      setSubmitting(true);

      const existingSubmission = selectedAssignment.submission;

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('assignment_submissions')
          .update({
            submission_url: submissionUrl,
            remarks: submissionRemarks,
            submitted_at: new Date().toISOString()
          })
          .eq('id', existingSubmission.id);

        if (error) throw error;
        toast.success('Submission updated successfully!');
      } else {
        // Create new submission
        const { error } = await supabase
          .from('assignment_submissions')
          .insert({
            assignment_id: selectedAssignment.id,
            student_id: studentId,
            submission_url: submissionUrl,
            remarks: submissionRemarks,
            submitted_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Assignment submitted successfully!');
      }

      closeSubmitModal();
      loadAssignmentsData();
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error('Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Assignments & Submissions</h1>
        <p className="text-gray-500 text-sm">Access pending coursework materials, check deadlines, and submit your project links here.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assignments.map((asm) => {
          const isSubmitted = !!asm.submission;
          const isOverdue = new Date(asm.due_date) < new Date() && !isSubmitted;

          return (
            <Card key={asm.id} className="p-6 relative hover:shadow-md transition-all group border-indigo-50/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant={isSubmitted ? 'emerald' : isOverdue ? 'rose' : 'amber'}>
                      {isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                    </Badge>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      {asm.batch?.batch_name || 'General Batch'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {asm.title}
                  </h3>

                  <p className="text-sm text-gray-500 max-w-2xl">
                    {asm.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-indigo-500" />
                      Due: {new Date(asm.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {asm.teacher && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                        Instructor: {asm.teacher.full_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 flex-shrink-0">
                  {asm.file_url && (
                    <a 
                      href={asm.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-slate-50 text-slate-700 hover:text-indigo-600 border border-gray-100 hover:border-indigo-100 rounded-xl transition-all shadow-sm"
                    >
                      Download Material <ExternalLink size={14} />
                    </a>
                  )}

                  <Button 
                    className="gap-2 shadow-lg shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl"
                    onClick={() => openSubmitModal(asm)}
                  >
                    {isSubmitted ? 'Edit Submission' : 'Submit Work'} <ArrowRight size={16} />
                  </Button>
                </div>

              </div>

              {/* Submitted Content Detail Block */}
              {isSubmitted && (
                <div className="mt-6 pt-6 border-t border-gray-100 bg-slate-50/50 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle size={14} /> Submitted on {new Date(asm.submission.submitted_at).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <a 
                      href={asm.submission.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                    >
                      View Submitted Link <ExternalLink size={12} />
                    </a>
                  </div>
                  {asm.submission.remarks && (
                    <p className="text-xs text-gray-500 italic flex items-start gap-1">
                      <MessageSquare size={12} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                      <span>&ldquo;{asm.submission.remarks}&rdquo;</span>
                    </p>
                  )}
                </div>
              )}

            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <Card className="bg-white p-12 text-center">
          <EmptyState
            icon={BookOpen}
            title="No Assignments Assigned"
            description="You don't have any assigned tasks or coursework at the moment. Keep learning and check back later!"
          />
        </Card>
      )}

      {/* Submission Modal */}
      {isSubmitModalOpen && selectedAssignment && (
        <Modal 
          isOpen={isSubmitModalOpen} 
          onClose={closeSubmitModal}
          title={selectedAssignment.submission ? 'Update Submission' : 'Submit Assignment'}
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Assignment</p>
              <h4 className="text-md font-bold text-gray-800">{selectedAssignment.title}</h4>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Submission URL <span className="text-rose-500">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://drive.google.com/..., https://github.com/..."
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">Provide a public link to your project document, folder, or repository.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Remarks / Notes
              </label>
              <textarea
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[100px]"
                placeholder="Add any details or instructions for your teacher..."
                value={submissionRemarks}
                onChange={(e) => setSubmissionRemarks(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={closeSubmitModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : selectedAssignment.submission ? (
                  'Update Work'
                ) : (
                  'Submit Work'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
