<script lang="ts">
import { supabase } from '$lib/supabaseClient';
import { goto } from '$app/navigation';

let rating: number | null = null;
let comments = '';
let showModal = false;
let modalMessage = '';
let modalActionCallback: (() => void) | null = null;
let submitting = false;

function handleShowModal(message: string, callback: (() => void) | null = null) {
  modalMessage = message;
  modalActionCallback = callback;
  showModal = true;
}

async function handleSubmit() {
  if (rating === null && comments.trim() === '') {
    handleShowModal('Please provide a rating or some comments before submitting.');
    return;
  }
  submitting = true;
  const feedbackData = {
    user_id: supabase.auth.user()?.id,
    rating,
    comments: comments.trim(),
    created_at: new Date().toISOString()
  };
  const { error } = await supabase.from('feedback').insert([feedbackData]);
  submitting = false;
  if (error) {
    handleShowModal('Failed to submit feedback. Please try again.');
  } else {
    handleShowModal('Thank you for your feedback!', () => goto('/'));
  }
}

function handleSkip() {
  goto('/');
}
</script>

<div class="bg-gray-100 flex items-center justify-center min-h-screen font-sans antialiased">
  <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto border border-gray-200">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Your Feedback Matters!</h2>

    <div class="mb-6 text-center">
      <p class="text-gray-600 mb-3">How would you rate your experience?</p>
      <div class="star-rating">
        <input type="radio" id="star5" name="rating" value="5" bind:group={rating} /><label for="star5" title="Amazing">★</label>
        <input type="radio" id="star4" name="rating" value="4" bind:group={rating} /><label for="star4" title="Good">★</label>
        <input type="radio" id="star3" name="rating" value="3" bind:group={rating} /><label for="star3" title="Average">★</label>
        <input type="radio" id="star2" name="rating" value="2" bind:group={rating} /><label for="star2" title="Poor">★</label>
        <input type="radio" id="star1" name="rating" value="1" bind:group={rating} /><label for="star1" title="Terrible">★</label>
      </div>
    </div>

    <div class="mb-6">
      <label for="feedbackText" class="block text-gray-700 text-sm font-medium mb-2">Comments (max 120 chars):</label>
      <textarea id="feedbackText" maxlength="120" rows="3"
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
        placeholder="Share your thoughts..." bind:value={comments}></textarea>
    </div>

    <p class="text-center text-gray-700 text-md mb-6">
      It's sad to see you leave! Tell us how to improve.
    </p>

    <div class="flex flex-col space-y-3">
      <button on:click={handleSubmit}
        class="w-full bg-[#229c90] hover:bg-[#1e8b7e] text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
      <button on:click={handleSkip}
        class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
        Skip
      </button>
    </div>
  </div>

  {#if showModal}
    <div class="modal-overlay show">
      <div class="modal-content">
        <p id="modalMessage" class="text-lg text-gray-800 mb-6">{modalMessage}</p>
        <button on:click={() => { showModal = false; if (modalActionCallback) modalActionCallback(); }}
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
          OK
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
.star-rating input[type="radio"] {
  display: none;
}
.star-rating label {
  font-size: 2.5rem;
  color: #cbd5e0;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0 0.1rem;
}
.star-rating input[type="radio"]:checked ~ label,
.star-rating label:hover,
.star-rating label:hover ~ label {
  color: #fcd34d;
}
.star-rating label:hover ~ label {
  color: #cbd5e0;
}
.star-rating {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 90%;
  width: 400px;
  transform: translateY(-20px);
  transition: transform 0.3s ease;
}
.modal-overlay.show .modal-content {
  transform: translateY(0);
}
</style>
