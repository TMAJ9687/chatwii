<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/services/supabaseClient';
  import NicknameInput from '$lib/components/landing/NicknameInput.svelte';
  import StartChatButton from '$lib/components/landing/StartChatButton.svelte';
  import VipButton from '$lib/components/landing/VipButton.svelte';
  import ThemeToggle from '$lib/components/landing/ThemeToggle.svelte';
  import AdPlaceholder from '$lib/components/landing/AdPlaceholder.svelte';
  import { validateNickname, isNicknameTaken } from '$lib/utils/validators';
  let nickname = '';
  let error = '';
  let loading = false;
  let charCount = 0;
  let friendlyNames = [
    'SunnyLion', 'ChillBear', 'HappyFox', 'WiseOwl', 'BraveWolf', 'LuckyCat', 'SwiftHawk', 'MightyDuck',
    'PixelPenguin', 'JazzKoala', 'FunkyFerret', 'CosmicOtter', 'BreezyMoose', 'TwinklePanda', 'ZippyZebra',
    'RocketRaccoon', 'SnazzyGoose', 'GroovyGiraffe', 'NebulaNewt', 'MochiMarmoset', 'TurboTurtle', 'DizzyDingo',
    'BubbleBison', 'CometCoyote', 'WaffleWalrus', 'PuzzleParrot', 'GadgetGull', 'NoodleNarwhal', 'PeppyPuffin',
    'MirthyMole', 'GlimmerGoat', 'TangoTapir', 'BopBison', 'QuokkaQuest', 'MemeMink', 'DiscoDuck', 'FableFennec',
    'OrbitOcelot', 'SproutSwan', 'MirthyMole', 'PogoPenguin', 'VividVole', 'JollyJackal', 'RiffRabbit', 'PixelPika',
    'SnickerSeal', 'KeenKangaroo', 'DoodleDog', 'GizmoGator', 'TwistTamarin', 'WittyWombat', 'JesterJay', 'BopBat',
    'MirthyMole', 'FlickerFrog', 'DandyDove', 'RascalRaven', 'NiftyNewt', 'PipPanda', 'DizzyDove', 'PuzzlePika',
    'WobbleWolf', 'SnuggleStoat', 'BingoBison', 'MirthyMole', 'PogoPika', 'SonicSeal', 'FunkyFox', 'TwirlTortoise',
    'SnazzySwan', 'PeppyPenguin', 'BopBear', 'CosmoCat', 'JiveJackal', 'GrooveGoose', 'GiddyGiraffe', 'TangoTiger',
    'MemeMole', 'OrbitOtter', 'DoodleDuck', 'ZippyZebra', 'JazzJaguar', 'BopBison', 'TwinkleTapir', 'RocketRabbit',
    'PixelPuffin', 'FableFox', 'DiscoDog', 'PuzzlePenguin', 'NebulaNarwhal', 'GadgetGoat', 'SnickerSwan', 'MochiMole',
    'TurboTiger', 'WaffleWolf', 'QuokkaQuip', 'SproutSeal', 'TwistTiger', 'GlimmerGull', 'DandyDuck', 'RiffRaccoon'
  ];
  function onInput(value: string) {
    nickname = value;
    charCount = value.length;
    error = validateNickname(value);
  }
  function onRandom() {
    const random = friendlyNames[Math.floor(Math.random() * friendlyNames.length)];
    const number = Math.floor(10 + Math.random() * 90); // 2-digit number 10-99
    const nick = `${random}${number}`;
    nickname = nick;
    charCount = nick.length;
    error = validateNickname(nick);
  }
  async function startChat() {
    loading = true;
    error = '';
    try {
      // Validate nickname uniqueness
      if (await isNicknameTaken(nickname.trim())) {
        error = 'Nickname is taken. Please choose another.';
        loading = false;
        return;
      }
      // 1. Sign in anonymously
      const { data, error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;
      const user = data?.user;
      if (!user) throw new Error('Anonymous sign-in failed.');
      // 2. Save nickname to user_metadata
      const { error: updateError } = await supabase.auth.updateUser({ data: { nickname: nickname.trim() } });
      if (updateError) throw updateError;
      // 3. Upsert user into 'profiles' table
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: user.id, // Supabase Auth UUID
        nickname: nickname.trim(),
        role: 'standard',
        last_seen: new Date().toISOString(),
      });
      if (upsertError) throw upsertError;
      // 4. Redirect to profile
      goto('/profile');
    } catch (e) {
      error = e.message || 'Something went wrong.';
    } finally {
      loading = false;
    }
  }
  onMount(() => {
    supabase.auth.onAuthStateChange((_event, _session) => {});
  });
</script>
<div class="min-h-screen flex flex-col items-center justify-center bg-[#fff8f1] relative">
  <VipButton />
  <AdPlaceholder />
  <div class="relative flex flex-col items-center w-full max-w-md bg-white/80 rounded-3xl shadow-xl px-8 py-10" style="backdrop-filter: blur(2px);">
    <NicknameInput
      {nickname}
      {error}
      {charCount}
      onInput={onInput}
      onRandom={onRandom}
      disabled={loading}
    />
    <StartChatButton
      loading={loading}
      disabled={!!error || !nickname.trim()}
      onClick={startChat}
    />
    <div class="mt-3 text-center text-gray-500 text-sm">
      Chat one-on-one with<br />people around the world
    </div>
  </div>
  <AdPlaceholder />
</div>
