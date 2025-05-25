import { writable, derived, get, readable } from 'svelte/store';
import { supabase } from '$lib/services/supabaseClient';

export type ChatMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  expires_at: string;
  role: 'standard' | 'VIP' | 'admin';
  read: boolean;
};

export type UserPresence = {
  id: string;
  nickname: string;
  role: 'standard' | 'VIP' | 'admin';
  last_seen: string;
  online: boolean;
};

function createChatStore() {
  const messages = writable<ChatMessage[]>([]);
  const users = writable<UserPresence[]>([]);
  const currentUserId = writable<string | null>(null);
  let currentUserRole: 'standard' | 'VIP' | 'admin' = 'standard';
  let messageSubscription: any = null;
  let profilesSubscription: any = null;
  let presenceInterval: any = null;

  async function init(userId: string) {
    currentUserId.set(userId);
    if (!userId || !/^[0-9a-fA-F-]{36}$/.test(userId)) {
      throw new Error('Invalid userId: must be a UUID');
    }
    await fetchUserRole();
    await fetchBlockedUsers();
    await fetchMessages();
    await fetchUsers();
    subscribeMessages();
    subscribeProfiles();
    startPresenceUpdates();
  }

  async function fetchUserRole() {
    const userId = get(currentUserId);
    if (!userId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (data && data.role) currentUserRole = data.role;
  }

  async function fetchMessages() {
    const userId = get(currentUserId);
    if (!userId) return;
    
    // Get blocked user IDs first
    const blockedUserIds = get(blockedUsers);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    
    if (data) {
      // Filter out messages from/to blocked users on client side as well
      const filteredMessages = data.filter(msg => 
        !blockedUserIds.includes(msg.sender_id) && 
        !blockedUserIds.includes(msg.receiver_id)
      );
      messages.set(filteredMessages);
    }
  }

  async function fetchUsers() {
    const userId = get(currentUserId);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, role, last_seen, gender, age, country_code, interests');
    if (data) {
      const now = Date.now();
      // Import countries data for user mapping
      const { countries } = await import('$lib/data/countries');
      
      // Only include users with a valid UUID and completed profiles
      users.set(
        data
          .filter((u: any) => u.id && /^[0-9a-fA-F-]{36}$/.test(u.id) && u.nickname)
          .map((u: any) => ({
            ...u,
            name: u.nickname || 'Anonymous',
            gender: u.gender || 'male',
            age: u.age || 18,
            country: countries.find(c => c.code === (u.country_code || '').toUpperCase()) || { code: 'US', name: 'United States' },
            interests: Array.isArray(u.interests) ? u.interests : [],
            avatar: `/avatars/standard/${u.gender || 'male'}.png`,
            online: u.last_seen && (now - new Date(u.last_seen).getTime() < 35000),
          }))
      );
    }
  }

  function subscribeMessages() {
    if (messageSubscription) messageSubscription.unsubscribe();
    messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const userId = get(currentUserId);
        const blockedUserIds = get(blockedUsers);
        
        // Only update for relevant messages that aren't from blocked users
        if (payload.new) {
          const isRelevant = payload.new.sender_id === userId || payload.new.receiver_id === userId;
          const isFromBlocked = blockedUserIds.includes(payload.new.sender_id) || blockedUserIds.includes(payload.new.receiver_id);
          
          if (isRelevant && !isFromBlocked) {
            fetchMessages();
          }
        }
        if (payload.eventType === 'DELETE') {
          fetchMessages();
        }
      })
      .subscribe();
  }

  function startPresenceUpdates() {
    if (presenceInterval) clearInterval(presenceInterval);
    
    // Update presence immediately when starting
    updatePresence();
    
    // Then update every 15 seconds
    presenceInterval = setInterval(updatePresence, 15000);
  }

  async function updatePresence() {
    const userId = get(currentUserId);
    if (!userId) return;
    await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', userId);
    fetchUsers(); // Refresh user list to update online status
  }

  async function sendMessage(receiver_id: string, content: string) {
    const userId = get(currentUserId);
    if (!userId || !content.trim()) return;
    if (!/^[0-9a-fA-F-]{36}$/.test(receiver_id)) {
      throw new Error('Invalid receiver_id: must be a UUID');
    }
    
    // Check if receiver is blocked by current user
    const blockedUserIds = get(blockedUsers);
    if (blockedUserIds.includes(receiver_id)) {
      throw new Error('Cannot send message to blocked user');
    }
    
    // Check if current user is blocked by receiver (server-side check)
    const { data: isBlockedByReceiver, error: blockCheckError } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', receiver_id)
      .eq('blocked_id', userId)
      .limit(1);
    
    if (isBlockedByReceiver && isBlockedByReceiver.length > 0) {
      throw new Error('You are blocked by this user');
    }
    
    let hours = 1;
    if (currentUserRole === 'VIP' || currentUserRole === 'admin') hours = 8;
    const expires_at = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    
    try {
      await supabase.from('messages').insert({
        sender_id: userId,
        receiver_id,
        content,
        expires_at,
        role: currentUserRole,
        read: false,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  function reset() {
    messages.set([]);
    users.set([]);
    currentUserId.set(null);
    currentUserRole = 'standard';
    blockedUsers.set([]);
    if (messageSubscription) messageSubscription.unsubscribe();
    if (profilesSubscription) profilesSubscription.unsubscribe();
    if (presenceInterval) clearInterval(presenceInterval);
  }

  function subscribeProfiles() {
    if (profilesSubscription) profilesSubscription.unsubscribe();
    profilesSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        // Refresh users whenever profiles change
        fetchUsers();
      })
      .subscribe();
  }

  async function markMessagesAsRead(senderId: string) {
    const userId = get(currentUserId);
    if (!userId) return;
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', userId)
      .eq('read', false);
    fetchMessages();
  }

  // Blocked users store
  const blockedUsers = writable<string[]>([]);

  async function fetchBlockedUsers() {
    const userId = get(currentUserId);
    if (!userId) return;
    
    console.log('Fetching blocked users for:', userId);
    
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);
    
    if (error) {
      console.error('Error fetching blocked users:', error);
      return;
    }
    
    const blockedIds = data ? data.map((b) => b.blocked_id) : [];
    console.log('Fetched blocked users:', blockedIds);
    
    blockedUsers.set(blockedIds);
  }

  async function blockUser(blockedId: string) {
    const userId = get(currentUserId);
    if (!userId || userId === blockedId) return;
    
    try {
      // Check if user is already blocked to avoid 409 conflict
      const { data: existingBlock, error: checkError } = await supabase
        .from('blocks')
        .select('id')
        .eq('blocker_id', userId)
        .eq('blocked_id', blockedId)
        .limit(1);
      
      if (!existingBlock || existingBlock.length === 0) {
        await supabase.from('blocks').insert({ blocker_id: userId, blocked_id: blockedId });
      }
      
      await fetchBlockedUsers();
      await fetchMessages(); // Refresh messages to hide blocked user's messages
      await fetchUsers(); // Refresh users to update UI
    } catch (error) {
      // Only log if it's not a "not found" error (which is expected when checking for existing block)
      if (error.code !== 'PGRST116') {
        console.error('Error blocking user:', error);
      }
    }
  }

  async function unblockUser(blockedId: string) {
    const userId = get(currentUserId);
    if (!userId) return;
    
    console.log('Starting unblock process for:', blockedId);
    console.log('Current user ID:', userId);
    console.log('Current blocked users before:', get(blockedUsers));
    
    try {
      // First, let's check if the record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', userId)
        .eq('blocked_id', blockedId);
      
      console.log('Existing block record:', existingRecord);
      
      if (!existingRecord || existingRecord.length === 0) {
        console.log('No block record found to delete');
        return;
      }
      
      // Now delete the record
      const { data, error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', userId)
        .eq('blocked_id', blockedId);
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Delete operation completed, data:', data);
      
      // Verify the record was actually deleted
      const { data: verifyRecord, error: verifyError } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', userId)
        .eq('blocked_id', blockedId);
      
      console.log('Verification after delete:', verifyRecord);
      
      // Force refresh blocked users
      await fetchBlockedUsers();
      console.log('Blocked users after fetch:', get(blockedUsers));
      
      // Then refresh other data
      await fetchMessages();
      await fetchUsers();
      
      console.log('All data refreshed successfully');
      
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  async function reportUser(reportedId: string, reason: string) {
    const userId = get(currentUserId);
    if (!userId || userId === reportedId) return;
    await supabase.from('reports').insert({
      reporter_id: userId,
      reported_id: reportedId,
      reason
    });
  }

  return {
    messages,
    users,
    init,
    sendMessage,
    fetchMessages,
    fetchUsers,
    updatePresence,
    reset,
    currentUserId,
    markMessagesAsRead,
    blockedUsers,
    fetchBlockedUsers,
    blockUser,
    unblockUser,
    reportUser,
  };
}

export const chatStore = createChatStore();

// Derived store: count of unique users with unread messages for the current user
export const unreadSendersCount = derived(
  [chatStore.messages, chatStore.currentUserId],
  ([$messages, $currentUserId]: [ChatMessage[], string | null], set) => {
    if (!$currentUserId) {
      set(0);
      return;
    }
    const unreadFrom = new Set<string>();
    $messages.forEach((msg: ChatMessage) => {
      if (
        msg.receiver_id === $currentUserId &&
        msg.read === false &&
        msg.sender_id !== $currentUserId
      ) {
        unreadFrom.add(msg.sender_id);
      }
    });
    set(unreadFrom.size);
  },
  0
);