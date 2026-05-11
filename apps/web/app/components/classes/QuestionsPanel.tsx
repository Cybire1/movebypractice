'use client';

import { useState, useEffect } from 'react';
import { useLocalParticipant, useRoomInfo } from '@livekit/components-react';
import { ClassMetadata } from '@/app/lib/livekit/controller';
import { createClient } from '@/app/lib/supabase/client';
import { Database } from '@/app/lib/supabase/database.types';

type ClassMessage = Database['public']['Tables']['class_messages']['Row'];

interface QuestionsPanelProps {
  classId: string;
  isInstructor?: boolean;
}

export function QuestionsPanel({ classId, isInstructor = false }: QuestionsPanelProps) {
  const [questions, setQuestions] = useState<ClassMessage[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const { localParticipant } = useLocalParticipant();
  const { metadata } = useRoomInfo();
  const supabase = createClient();

  const { qa_enabled } = (metadata ? JSON.parse(metadata) : {}) as ClassMetadata;

  // Fetch questions
  useEffect(() => {
    fetchQuestions();

    // Subscribe to new questions
    const channel = supabase
      .channel(`class_messages:${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_messages',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('class_messages')
      .select('*')
      .eq('class_id', classId)
      .in('message_type', ['question', 'answer'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }

    setQuestions(data || []);
  };

  const askQuestion = async () => {
    if (!newQuestion.trim() || !qa_enabled) return;

    setLoading(true);
    // @ts-expect-error Supabase types mismatch
    const { error } = await supabase.from('class_messages').insert({
      class_id: classId,
      user_id: localParticipant.identity,
      message_type: 'question',
      content: newQuestion,
    });

    if (error) {
      console.error('Error asking question:', error);
    } else {
      setNewQuestion('');
    }
    setLoading(false);
  };

  const answerQuestion = async (questionId: string) => {
    if (!replyText.trim()) return;

    setLoading(true);
    // @ts-expect-error Supabase types mismatch
    const { error } = await supabase.from('class_messages').insert({
      class_id: classId,
      user_id: localParticipant.identity,
      message_type: 'answer',
      content: replyText,
      parent_id: questionId,
      is_instructor_reply: isInstructor,
    });

    if (error) {
      console.error('Error answering question:', error);
    } else {
      setReplyText('');
      setReplyingTo(null);
    }
    setLoading(false);
  };

  const upvoteQuestion = async (questionId: string, currentUpvotes: number) => {
    const { error } = await supabase
      .from('class_messages')
      // @ts-expect-error Supabase types mismatch
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', questionId);

    if (error) {
      console.error('Error upvoting question:', error);
    }
  };

  // Group questions with their answers
  const questionsWithAnswers = questions
    .filter((q) => q.message_type === 'question')
    .map((question) => ({
      question,
      answers: questions.filter((a) => a.parent_id === question.id),
    }));

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Q&A</h3>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {questionsWithAnswers.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No questions yet</p>
            <p className="text-sm">Be the first to ask!</p>
          </div>
        ) : (
          questionsWithAnswers.map(({ question, answers }) => (
            <div key={question.id} className="bg-gray-800 rounded-lg p-4">
              {/* Question */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <button
                    onClick={() => upvoteQuestion(question.id, question.upvotes)}
                    className="text-zinc-500 hover:text-sui-accent transition-colors"
                  >
                    ▲
                  </button>
                  <span className="text-sm font-semibold text-gray-300">
                    {question.upvotes}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white mb-2">{question.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Asked by User {question.user_id.slice(0, 8)}</span>
                    {isInstructor && (
                      <button
                        onClick={() => setReplyingTo(question.id)}
                        className="text-sui-accent hover:text-sui-accent-light font-bold text-xs uppercase tracking-wider"
                      >
                        Answer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Answers */}
              {answers.length > 0 && (
                <div className="ml-8 space-y-2 border-l-2 border-gray-700 pl-4">
                  {answers.map((answer) => (
                    <div key={answer.id} className="bg-gray-700 rounded p-3">
                      <p className="text-white text-sm mb-1">{answer.content}</p>
                      <span className="text-xs text-gray-400">
                        {answer.is_instructor_reply && '✓ '}
                        Answered by User {answer.user_id.slice(0, 8)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              {replyingTo === question.id && (
                <div className="ml-8 mt-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your answer..."
                    className="w-full bg-zinc-800 text-white rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sui-accent/50"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => answerQuestion(question.id)}
                      disabled={!replyText.trim() || loading}
                      className="px-3 py-1 bg-sui-accent hover:bg-sui-accent-dim disabled:bg-zinc-700 text-zinc-900 font-bold text-sm rounded transition-colors"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ask question input */}
      {!isInstructor && qa_enabled && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex flex-col gap-2">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="bg-zinc-800 text-white rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sui-accent/50 placeholder:text-zinc-500"
              rows={2}
            />
            <button
              onClick={askQuestion}
              disabled={!newQuestion.trim() || loading}
              className="px-4 py-2 bg-sui-accent hover:bg-sui-accent-dim disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 rounded font-bold transition-colors"
            >
              Ask Question
            </button>
          </div>
        </div>
      )}

      {!qa_enabled && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">Q&A is disabled</p>
        </div>
      )}
    </div>
  );
}
