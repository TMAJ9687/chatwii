<script lang="ts">
  // State for selected plan
  let selectedPlan = 'year';
  const plans = [
    {
      id: 'month',
      label: '1 Month',
      price: 4.99,
      priceLabel: '$4.99',
      period: 'Billed monthly',
    },
    {
      id: '6mo',
      label: '6 Months',
      price: 25.95,
      priceLabel: '$25.95',
      period: 'Billed every 6 months',
    },
    {
      id: 'year',
      label: '12 Months',
      price: 35.99,
      priceLabel: '$35.99',
      period: 'Billed annually',
      featured: true,
    },
  ];
  const features = [
    'Send unlimited photos',
    'Send unlimited voice messages',
    'Chat history view',
    'Customer Support',
    'Customized avatars',
    'Appear at the top of the list',
    'Ad free',
    'React, reply, edit, unsend messages',
    'View message status',
    'Hide your own message status',
    'Control your online status',
  ];
  let selectedIndex = plans.findIndex(p => p.id === selectedPlan);
  function selectPlan(id: string) {
    selectedPlan = id;
    selectedIndex = plans.findIndex(p => p.id === selectedPlan);
  }
  function prevPlan() {
    selectedIndex = (selectedIndex - 1 + plans.length) % plans.length;
    selectedPlan = plans[selectedIndex].id;
  }
  function nextPlan() {
    selectedIndex = (selectedIndex + 1) % plans.length;
    selectedPlan = plans[selectedIndex].id;
  }

  // Stepper state: 0 = plan, 1 = auth, 2 = payment, 3 = done
  let step = 0;
  // Auth state (mock, replace with real auth later)
  let isAuthenticated = false;
  let email = '';
  let password = '';
  let authWarning = '';
  // Payment state (mock, replace with Stripe/etc. later)
  let cardNumber = '';
  let expiry = '';
  let cvc = '';
  let paymentWarning = '';

  function startRegistration() {
    step = isAuthenticated ? 2 : 1;
  }
  function handleAuth() {
    authWarning = '';
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      authWarning = 'Please enter a valid email address.';
      return;
    }
    if (password.length < 6) {
      authWarning = 'Password must be at least 6 characters.';
      return;
    }
    // Simulate successful login/register
    isAuthenticated = true;
    step = 2;
  }
  import { supabase } from '$lib/services/supabaseClient';
  let savingProfile = false;
  let saveError = '';

  async function handlePayment() {
    paymentWarning = '';
    saveError = '';
    if (!/^[0-9]{16}$/.test(cardNumber)) {
      paymentWarning = 'Card number must be 16 digits.';
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      paymentWarning = 'Expiry must be in MM/YY format.';
      return;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      paymentWarning = 'CVC must be 3 or 4 digits.';
      return;
    }
    savingProfile = true;
    try {
      // Require Supabase Auth user
      let userId = '';
      if (supabase.auth.getUser) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          saveError = 'You must be logged in to complete VIP registration.';
          return;
        }
        userId = data.user.id;
      } else if (supabase.auth.user) {
        const user = supabase.auth.user();
        if (!user) {
          saveError = 'You must be logged in to complete VIP registration.';
          return;
        }
        userId = user.id;
      } else {
        saveError = 'You must be logged in to complete VIP registration.';
        return;
      }
      // Upsert profile as VIP
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userId,
        email,
        role: 'vip',
        vip_plan: plans[selectedIndex].id,
        vip_since: new Date().toISOString(),
      });
      if (upsertError) {
        saveError = upsertError.message || 'Could not activate VIP. Please try again.';
        return;
      }
      step = 3;
    } catch (e) {
      saveError = e.message || 'Could not activate VIP. Please try again.';
    } finally {
      savingProfile = false;
    }
  }
</script>


<div class="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col items-center py-12 px-2">
  <h1 class="text-4xl font-black mb-2 text-yellow-700 tracking-tight drop-shadow">Become a VIP</h1>
  <p class="text-lg text-gray-700 mb-10 text-center max-w-xl">Unlock all features and enjoy the best chat experience!</p>
  <div class="flex flex-row items-center justify-center gap-6 mb-8 w-full max-w-2xl">
  <button class="arrow-btn" on:click={prevPlan} aria-label="Previous plan">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
  </button>
  <div class="plan-card-glass shadow-2xl border-2 border-yellow-300 rounded-3xl p-8 w-full animate-fadeIn flex flex-col items-center relative bg-white/80 backdrop-blur-md max-w-md">
    {#if plans[selectedIndex].featured}
      <div class="absolute top-4 right-6 px-3 py-1 text-xs rounded-full bg-yellow-400 text-yellow-900 font-extrabold shadow">Best Value</div>
    {/if}
    <div class="text-4xl font-extrabold text-yellow-700 mb-1 tracking-tight">{plans[selectedIndex].priceLabel}</div>
    <div class="text-base text-gray-600 mb-4">{plans[selectedIndex].period}</div>
    <ul class="mb-8 text-left space-y-3 w-full">
      {#each features as feature}
        <li class="flex items-center text-green-700 font-medium text-base"><svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>{feature}</li>
      {/each}
    </ul>
    {#if step === 0}
      <button class="get-started-btn w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-extrabold text-lg shadow-xl transition focus:outline-none focus:ring-4 focus:ring-yellow-300" on:click={startRegistration}>
        Get Started
      </button>
    {/if}
    {#if step === 1}
      <form class="w-full flex flex-col gap-4 mt-2" on:submit|preventDefault={handleAuth}>
        <input class="input" type="email" bind:value={email} placeholder="Email" autocomplete="email" required />
        <input class="input" type="password" bind:value={password} placeholder="Password" autocomplete="current-password" required />
        {#if authWarning}
          <div class="warning">{authWarning}</div>
        {/if}
        <button class="get-started-btn w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-extrabold text-lg shadow-xl transition focus:outline-none focus:ring-4 focus:ring-yellow-300" type="submit">Continue</button>
      </form>
    {/if}
    {#if step === 2}
      <form class="w-full flex flex-col gap-4 mt-2" on:submit|preventDefault={handlePayment}>
        <input class="input" type="text" bind:value={cardNumber} placeholder="Card Number (mock)" maxlength="16" required />
        <input class="input" type="text" bind:value={expiry} placeholder="MM/YY" maxlength="5" required />
        <input class="input" type="text" bind:value={cvc} placeholder="CVC" maxlength="4" required />
        {#if paymentWarning}
          <div class="warning">{paymentWarning}</div>
        {/if}
        {#if saveError}
          <div class="warning">{saveError}</div>
        {/if}
        <button class="get-started-btn w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-extrabold text-lg shadow-xl transition focus:outline-none focus:ring-4 focus:ring-yellow-300" type="submit" disabled={savingProfile}>
          {#if savingProfile}
            <svg class="animate-spin h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Saving…
          {:else}
            Pay {plans[selectedIndex].priceLabel}
          {/if}
        </button>
      </form>
    {/if}
    {#if step === 3 && !saveError}
      <div class="success-message flex flex-col items-center gap-2 mt-4">
        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        <div class="text-green-700 font-bold text-xl">VIP Registration Complete!</div>
        <div class="text-gray-600">Your profile is now upgraded. Enjoy all VIP features!</div>
      </div>
    {/if}
  </div>
  <button class="arrow-btn" on:click={nextPlan} aria-label="Next plan">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
  </button>
</div>
  <p class="text-gray-400 text-sm mt-2">All plans include the same VIP features. Cancel anytime.</p>
</div>

<style>
  .plan-card-glass {
    box-shadow: 0 8px 32px 0 rgba(255, 193, 7, 0.2), 0 1.5px 4px 0 rgba(0,0,0,0.08);
    border-radius: 2rem;
    border: 2px solid #fde68a;
    background: rgba(255,255,255,0.82);
    transition: box-shadow 0.18s, border 0.18s;
    animation: fadeIn 0.25s cubic-bezier(.4,0,.2,1);
  }
  .arrow-btn {
    background: white;
    border-radius: 999px;
    border: 2px solid #fde68a;
    box-shadow: 0 2px 8px 0 rgba(255, 193, 7, 0.08);
    padding: 0.5rem 0.7rem;
    transition: background 0.15s, border 0.15s;
    color: #f59e0b;
    cursor: pointer;
    outline: none;
  }
  .arrow-btn:hover, .arrow-btn:focus {
    background: #fffbe8;
    border-color: #fbbf24;
  }
  .get-started-btn {
    letter-spacing: 0.01em;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
