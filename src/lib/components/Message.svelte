<script>
	import { chatRoomContent } from './../../stores/functions.js';
  import placeholder from '$lib/icons/placeholde.svg';
  import { onMount } from 'svelte';
  export let icon = '';
  export let name = '';
  export let isGroup = false;
    
  let messages = $chatRoomContent

  const isSentMessage = (id) => id.startsWith('true');

  // Helper to determine message type
  const getMessageType = (message) => {
    if (message.files?.length > 0) return 'file';
    if (message.call?.some(text => text.includes('Voice call') || text.includes('Missed voice call'))) return 'voice';
    if (message.call?.some(text => text.includes('Video call'))) return 'video';
    return 'text';
  };

  // Format file size
  const formatFileInfo = (file) => {
    return `${file.fileName}${file.pages ? ` • ${file.pages}` : ''} • ${file.type} • ${file.size}`;
  };
</script>

<div  class="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-gray-100">
  {#each messages as message}
    <div
      class="flex {isSentMessage(message.id) ? 'justify-end' : 'justify-start'} mb-2 w-full"
      role="listitem"
      aria-label="{isSentMessage(message.id) ? 'Sent message' : 'Received message'}"
    >
      <div class="flex items-end {isSentMessage(message.id) ? 'flex-row-reverse' : ''}">
        {#if isGroup && !isSentMessage(message.id)}
          <img
            src={icon || placeholder}
            alt="{name}'s profile picture"
            class="w-8 h-8 rounded-full mr-2 object-cover"
            width="32"
            height="32"
          />
        {/if}
        <div
          class="{message.content.length<=100 ? "max-w-[80%]" : "max-w-[70%]" } rounded-lg shadow-sm {isSentMessage(message.id)
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-800'}"
        >
          {#if getMessageType(message) === 'file'}
            <div class="p-3 flex items-center space-x-2 w-full">
              <span class="lnr lnr-file-empty w-5 h-5"></span>
              <div>
                {#each message.files as file}
                  <p class="text-sm font-medium">{file.fileName}</p>
                  <p class="text-xs opacity-70">{formatFileInfo(file)}</p>
                {/each}
              </div>
            </div>
          {:else if getMessageType(message) === 'voice' || getMessageType(message) === 'video'}
            <div class="p-3 flex items-center space-x-2">
              {#if getMessageType(message) === 'voice'}
                <span class="lnr lnr-phone-handset w-5 h-5"></span>
              {:else}
                <span class="lnr lnr-camera-video w-5 h-5"></span>
              {/if}
              <div>
                <p class="text-sm font-medium">{message.call[0]}</p>
                {#if message.call[1]}
                  <p class="text-xs opacity-70">{message.call[1]}</p>
                {/if}
              </div>
            </div>
          {:else}
            <div class="p-3 message-content">
              {#if isGroup && !isSentMessage(message.id)}
                <p class="text-xs font-semibold text-gray-600">{name}</p>
              {/if}
              <p class="text-sm">{message.content}</p>
            </div>
          {/if}
          <span class="text-xs opacity-70 px-3 pb-2 block">{message.timestamp}</span>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #a0aec0;
    border-radius: 3px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background-color: #edf2f7;
  }

  /* File message styles */
  .file-message {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  /* Call message styles */
  .call-message {
    background-color: #f0fdf4;
    border: 1px solid #dcfce7;
    border-radius: 8px;
  }

  .call-message.missed {
    background-color: #fef2f2;
    border: 1px solid #fee2e2;
  }

  /* Message content styles */
  .message-content {
    max-width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }

  /* Ensure message container doesn't stretch too wide */
  .max-w-\[70\%\] {
    max-width: 70%;
    min-width: 100px; /* Optional: ensures a minimum width for short messages */
  }
</style>


