<script>
	import { activChatRoom, chatRoomContentArrived } from './../../stores/functions.js';
    import Message from '$lib/components/Message.svelte';
    import { createEventDispatcher } from 'svelte';
    import placeholder from "$lib/icons/placeholde.svg"
    import html2canvas from 'html2canvas';

    export let isHamburgerActive = false; 
    async function takeScreenshot() {
        try {
        // Assuming chat content is in an element with id="chat-content"
        const chatContent = document.querySelector('#chat-content');
        if (!chatContent) {
            console.error('Chat content element not found');
            return;
        }

        const canvas = await html2canvas(chatContent);
        const image = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.href = image;
        link.download = `chat-screenshot-${$activChatRoom.name}-${Date.now()}.png`;
        link.click();
        } catch (error) {
        console.error('Error taking screenshot:', error);
        }
  }

</script>


<div class="flex  h-20 flex-col md:flex-row items-center border-b p-2 bg-white">
  <div class="flex flex-1 items-center gap-4 w-full md:w-auto">

    <!-- Chat room icon -->
    <div class="img-wrapper flex-shrink-0">
      <div class="img-icon rounded-full w-10 h-10 overflow-hidden border border-gray-200">
        <img 
          src={$activChatRoom?.icon || placeholder} 
          alt={$activChatRoom?.name || 'Chat room icon'} 
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- Chat room name and timestamp -->
    <div class="flex flex-col min-w-0">
      <h5 class="mb-0 font-semibold text-base truncate">
        {$activChatRoom?.name || 'Chat Room'}
      </h5>
      <div class="text-sm text-gray-500 truncate">
        {$activChatRoom?.timestamp || 'No messages yet'}
      </div>
    </div>
      <!-- Screenshot button -->
  <div class="ms-auto mt-2 ">
    <button
      type="button"
      class=" text-green-800 p-1 w-10 h-10 hover:text-black hover:bg-green-300 rounded-full transition-colors duration-200"
      on:click={takeScreenshot}
      aria-label="Take screenshot of chat"
    >
      <span class="lnr lnr-camera text-xl"></span> 
    </button>
  </div>
  </div>
</div>

<div class="contact-list" role="region" aria-label="Liste des contacts">

<div class="parent-container">
{#if !$chatRoomContentArrived}
  <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Chargement en contacts...
          </div>
{:else}
<div  id="chat-content">
    <Message icon={$activChatRoom.icon} name={$activChatRoom.name}></Message>
</div>
{/if}
</div>
</div>

<style>
    #chat-content{
        margin-bottom: 100px;
    }
   
    .img-wrapper {
        display: inline-block;
    }

    .img-icon {
        border: #fff solid 3px;
        overflow: hidden;
        height: 44px;
        width: 44px;
        display: block;
    }

    .img-icon img {
        width: 100%;
        height: 100%;
    }
</style>