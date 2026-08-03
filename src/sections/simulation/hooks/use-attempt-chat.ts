import { useMemo, useState, useEffect, useCallback } from 'react';
// lib
import { createClient } from 'src/lib/supabase/client';
import { sendMessage, mapMessageRow, fetchAttemptMessages } from 'src/lib/supabase/queries/simulation';
// types
import type { IMessage } from 'src/types/simulation';

// ----------------------------------------------------------------------

export function useAttemptChat(attemptId: string, initialMessages: IMessage[]) {
  const supabase = useMemo(() => createClient(), []);

  const [messages, setMessages] = useState<IMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // initialMessages only reflects the opening line at mount time (from
  // start-attempt); re-sync from the server once in case the page was
  // reloaded mid-conversation.
  useEffect(() => {
    setLoading(true);
    fetchAttemptMessages(supabase, attemptId)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load conversation'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, supabase]);

  const send = useCallback(
    async (content: string) => {
      setSending(true);
      setError(null);
      try {
        const { studentMessage, patientMessage } = await sendMessage(supabase, attemptId, content);
        setMessages((prev) => [...prev, mapMessageRow(studentMessage), mapMessageRow(patientMessage)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setSending(false);
      }
    },
    [supabase, attemptId]
  );

  return { messages, loading, sending, error, send };
}
