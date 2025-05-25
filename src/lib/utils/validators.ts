export function validateNickname(nickname: string): string {
    if (!nickname) return 'Nickname required';
    if (nickname.length > 16) return 'Max 16 characters';
    if ((nickname.match(/\d/g) || []).length > 2) return 'At most 2 digits';
    if ((nickname.match(/ /g) || []).length > 1) return 'Only one space allowed';
    if (/(.)\1\1/.test(nickname)) return 'No more than 3 identical letters in a row';
    // Stub profanity check:
    // if (isProfane(nickname)) return 'Inappropriate nickname';
    return '';
}

// Async uniqueness check for nickname
import { supabase } from '$lib/services/supabaseClient';
export async function isNicknameTaken(nickname: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('nickname', nickname.trim())
    .limit(1);
  if (error) return false; // Don't block on error, just allow
  return !!(data && data.length > 0);
}