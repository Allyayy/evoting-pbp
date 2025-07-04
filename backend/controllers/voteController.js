import { supabase } from '../utils/supabaseClient.js';

export async function vote({ userId, pollId, optionId }) {
  // Cek apakah user sudah voting di polling ini
  const { data: existingVote, error: checkError } = await supabase
    .from('votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .single();

  if (checkError) throw checkError;
  if (existingVote) throw new Error('User sudah voting di polling ini');

  // Insert vote baru
  const { data, error } = await supabase
    .from('votes')
    .insert([{ user_id: userId, poll_id: pollId, option_id: optionId }]);

  if (error) throw error;

  return data;
}
