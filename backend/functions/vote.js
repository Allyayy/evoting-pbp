import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function vote({ userId, pollId, optionId }) {
  // Cek apakah user sudah voting di polling ini
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .single();

  if (existingVote) throw new Error('User sudah voting di polling ini');

  // Insert vote baru
  const { data, error } = await supabase
    .from('votes')
    .insert([{ user_id: userId, poll_id: pollId, option_id: optionId }]);

  if (error) throw error;

  return data;
}
