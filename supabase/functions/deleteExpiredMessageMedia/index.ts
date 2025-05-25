import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper: returns true if file is older than 1 hour
function isExpired(createdAt: string): boolean {
  const uploaded = Date.parse(createdAt);
  return Date.now() - uploaded > 60 * 60 * 1000;
}

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // List all files in root of message-media bucket (adjust path if needed)
  const { data: files, error } = await supabase.storage.from('message-media').list('', { limit: 1000 });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const expiredFiles = (files ?? []).filter(file => file.created_at && isExpired(file.created_at));
  let deleted: string[] = [];
  let failed: string[] = [];

  for (const file of expiredFiles) {
    const { error: delError } = await supabase.storage.from('message-media').remove([file.name]);
    if (delError) {
      failed.push(file.name);
    } else {
      deleted.push(file.name);
    }
  }

  return new Response(JSON.stringify({
    checked: files?.length ?? 0,
    deleted,
    failed,
    message: `Deleted ${deleted.length} expired files. ${failed.length ? 'Some deletions failed.' : ''}`
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
