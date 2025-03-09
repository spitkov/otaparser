<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let url = '';
  let isLoading = false;
  let error = '';
  
  function handleSubmit() {
    error = '';
    
    if (!url) {
      error = 'Please enter a URL';
      return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      error = 'URL must start with http:// or https://';
      return;
    }
    
    isLoading = true;
    dispatch('submit', url);
  }
  
  export function setLoading(loading) {
    isLoading = loading;
  }
  
  export function setError(errorMessage) {
    error = errorMessage;
    isLoading = false;
  }
</script>

<div class="w-full max-w-3xl mx-auto mt-8 px-4">
  <form on:submit|preventDefault={handleSubmit} class="bg-[#1a1a1a] rounded-lg shadow-lg p-6 border border-[#333]">
    <div class="mb-4">
      <label for="url" class="block text-sm font-medium text-gray-300 mb-2">Enter OTA JSON URL</label>
      <div class="flex gap-2">
        <input
          type="text"
          id="url"
          bind:value={url}
          placeholder="https://example.com/ota.json or API endpoint"
          class="flex-1 bg-[#2a2a2a] text-white border border-[#444] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading}
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
            <span class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          {:else}
            Parse
          {/if}
        </button>
      </div>
    </div>
    
    {#if error}
      <div class="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-md text-sm">
        {error}
      </div>
    {/if}
    
    <div class="mt-4 text-sm text-gray-400">
      <p>Enter a URL to an OTA JSON file or API endpoint to parse and display its contents.</p>
    </div>
  </form>
</div> 