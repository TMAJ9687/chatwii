// Utility to call the Supabase Edge Function to delete a user account
const EDGE_FUNCTION_URL = 'https://zcssbxidylmunrgaaubp.supabase.co/functions/v1/deleteUser';

import { supabase } from '../supabaseClient';

export async function deleteUserAccount(userId: string) {
  if (!userId) throw new Error('No userId provided');
  // Get current user's access token
  let accessToken;
  if (supabase.auth.getSession) {
    const { data } = await supabase.auth.getSession();
    accessToken = data?.session?.access_token;
  } else {
    accessToken = supabase.auth.session()?.access_token;
  }
  if (!accessToken) throw new Error('No access token found');

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ userId })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error('Failed to delete user: ' + error);
  }
  return response;
}
