import { useState, useEffect, useCallback } from 'react';
// lib
import { sendPhysioMessage, fetchPhysioAttemptMessages } from 'src/lib/supabase/queries/physio-simulation';
// types
import type { IPhysioMessage } from 'src/types/physio-simulation';

// ----------------------------------------------------------------------

export function usePhysioAttemptChat(attemptId: string, initialMessages: IPhysioMessage[]) {
  const [messages, setMessages] = useState<IPhysioMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // initialMessages only reflects the opening line at mount time (from
  // start-attempt); re-sync from the server once in case the page was
  // reloaded mid-conversation.
  useEffect(() => {
    setLoading(true);
    fetchPhysioAttemptMessages(attemptId)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load conversation'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const send = useCallback(
    async (content: string) => {
      setSending(true);
      setError(null);
      try {
        const { studentMessage, patientMessage } = await sendPhysioMessage(attemptId, content);
        setMessages((prev) => [...prev, studentMessage, patientMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setSending(false);
      }
    },
    [attemptId]
  );

  return { messages, loading, sending, error, send };
}
