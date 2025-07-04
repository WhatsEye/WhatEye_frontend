<script>
  import { chatRoomContent } from './../../stores/functions.js';
  import placeholder from '$lib/icons/placeholde.svg';
  import { onMount } from 'svelte';

  export let icon = '';
  export let name = '';
  export let isGroup = false;

  let messages = $chatRoomContent;
  console.log(messages);

  // Helper to determine if message is sent
  const isSentMessage = (id) => id.startsWith('true');

  // Helper to determine message type
  const getMessageType = (message) => {
    if (message.image) return 'image';
    if (message.files?.length > 0) return 'file';
    if (message.call?.some((text) => text.includes('Voice call') || text.includes('Missed voice call')))
      return 'voice';
    if (message.call?.some((text) => text.includes('Video call'))) return 'video';
    return 'text';
  };

  // Format file size
  const formatFileInfo = (file) => {
    return `${file.fileName}${file.pages ? ` • ${file.pages}` : ''} • ${file.type} • ${file.size}`;
  };

  // Format timestamp to WhatsApp style (e.g., "10:30 AM")
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Parse reactions from label to extract emojis
  const parseReactions = (reaction) => {
      const emojiPart = reaction.label.split(' in total')[0].replace('Reactions ', '').replace("reaction ", "");
      return emojiPart.split(', ').map((emoji) => emoji.trim());
  };
  const getImageSrc = (base64String) => {
    if (!base64String) return '';
    return `data:image/png;base64,${base64String}`;
  };
</script>

<div
  class="flex flex-col h-full overflow-y-auto p-4 space-y-3 bg-whatsapp-bg bg-repeat bg-[length:100%_100%]"
  style="background-image: url('/path/to/whatsapp-background.png');"
>
  {#each messages as message}
    {#if message.id === ""}
      <div class="flex justify-center">
        <div class="relative text-xs max-w-xs my-1 py-1 px-2 bg-gray-100 rounded-lg shadow-md">
          {message.content}
        </div>
      </div>
    {:else}
      <div
        class="flex {isSentMessage(message.id) ? 'justify-end' : 'justify-start'} mb-3 w-full"
        role="listitem"
        aria-label="{isSentMessage(message.id) ? 'Sent message' : 'Received message'}"
      >
        <div
          class="flex items-end {isSentMessage(message.id) ? 'flex-row-reverse' : ''} relative max-w-[75%]"
        >
          {#if isGroup && !isSentMessage(message.id)}
            <img
              src={icon || placeholder}
              alt="{name}'s profile picture"
              class="w-9 h-9 rounded-full mr-2 object-cover"
              width="36"
              height="36"
            />
          {/if}
          <div
            class=" shadow-sm p-2 relative text-gray-800 {isSentMessage(message.id)
              ? 'bg-whatsapp-sent rounded-l-lg rounded-br-lg'
              : 'bg-whatsapp-received rounded-r-lg rounded-bl-lg'}"
          >
            <!-- Chat bubble tail -->
            <div
              class="{isSentMessage(message.id)
                ? 'bubble-tail-sent'
                : 'bubble-tail-received'} absolute top-0"
            ></div>

            {#if getMessageType(message) === 'image'}
              <div class="message-content">
                <img
                  src={getImageSrc(message.image)}
                  alt="Chat image"
                  class="max-w-full h-auto rounded-lg"
                />
                {#if message.content}
                  <p class="text-sm mt-1">{message.content}</p>
                {/if}
              </div>
            {:else if getMessageType(message) === 'file'}
              <div class="flex items-center space-x-2">
                <span class="lnr lnr-file-empty w-5 h-5"></span>
                <div>
                  {#each message.files as file}
                    <p class="text-sm font-medium">{file.fileName}</p>
                    <p class="text-xs opacity-70">{formatFileInfo(file)}</p>
                  {/each}
                </div>
              </div>
            {:else if getMessageType(message) === 'voice' || getMessageType(message) === 'video'}
              <div class="flex items-center space-x-2">
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
              <div class="message-content">
                <p class="text-sm {message.content.length <= 100 ? 'max-w-96' : 'w-96'}">{message.content}</p>
              </div>
            {/if}
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs opacity-70 w-20">{#if message.reactions.length==0 || message.timestamp.includes(":") }{message.timestamp} {:else} {message.call[1]} {/if}</span>
              {#if message.reactions?.length > 0}
                <div class="flex space-x-1">
                  {#each message.reactions as reaction}
                   
                      <span
                        class="text-xs bg-gray-200 rounded-full px-1.5 py-0.5"
                        aria-label="Reaction"
                      >
                       {#each parseReactions(reaction) as emoji}
                        {emoji}
                        {/each}
                      </span>
                    
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  .bg-whatsapp-bg {
    background-color: #e5ddd5;
  }

  .bg-whatsapp-sent {
    background-color: #d5f6d3;
  }

  .bg-whatsapp-received {
    background-color: #ffffff;
  }

  .bubble-tail-sent {
    width: 0;
    height: 0;
    border-bottom: 13px solid transparent;
    border-left: 10px solid #d5f6d3;
    right: -9px;
  }

  .bubble-tail-received {
    width: 0;
    height: 0;
    border-bottom: 13px solid transparent;
    border-right: 10px solid #ffffff;
    left: -9px;
  }

  .overflow-y-auto::-webkit-scrollbar {
    width: 5px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #25d366;
    border-radius: 5px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background-color: #f0f0f0;
  }

  .message-content {
    max-width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }

  .text-whatsapp-ticks {
    color: #34b7f3;
  }

  .message-content img {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
  }

  .file-message {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .call-message {
    background-color: #f0fdf4;
    border: 1px solid #dcfce7;
    border-radius: 8px;
  }

  .call-message.missed {
    background-color: #fef2f2;
    border: 1px solid #fee2e2;
  }

  .bg-gray-200 {
    background-color: #e5e7eb;
  }
</style>