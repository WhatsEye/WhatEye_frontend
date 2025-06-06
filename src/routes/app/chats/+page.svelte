<script>
	import { contactsChatStore, contactsChatArrivedStore, activChatRoom } from './../../../stores/functions.js';
	import { onMount } from 'svelte';
    import RecentChat from '$lib/components/RecentChat.svelte';
    import ChatCard from '$lib/components/ChatCard.svelte';
    import { websocketStore } from '../../../stores/websockets';

    let childId;
    let isMobileMenuOpen = false;
    let hamburgerActive = false;
    let errorMessage = '';
    let isLoading = false;
    let activeChatId  = -1;
    let contactList = []

    $: {
        const contacts = $contactsChatStore
        const countMap = new Map();
        const updatedContacts = contacts.map((item, index) => {
        item.id = index;
        const name = item.name;
        if (countMap.has(name)) {
            const currentCount = countMap.get(name);
            item.pos = currentCount;
            countMap.set(name, currentCount + 1);
        } else {
            item.pos = 0;
            countMap.set(name, 1);
        }

        return item;
        });
        contactList = updatedContacts;
    }
  
    $: if ($contactsChatArrivedStore && $contactsChatStore) {
        isLoading = false;
        errorMessage = 'Contacts reçus avec succès.';
        contactsChatArrivedStore.set(false);
        setTimeout(() => (errorMessage = ''), 5000);
    }
    function handleError(message, duration = 5000) {
        errorMessage = message;
        isLoading = false;
        setTimeout(() => (errorMessage = ''), duration);
    }
    function handleToggleAppMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        hamburgerActive = !hamburgerActive;
    }

    function handleChatSelect(chatId) {
        console.log(chatId)
        activeChatId = chatId;
        hamburgerActive = false;
        isMobileMenuOpen = false;
    }  
      
    onMount(async () => {
        activChatRoom.set({})
        childId = localStorage.getItem('ActiveChild');
        if (!childId) {
            handleError('Aucun enfant sélectionné. Veuillez choisir un profil.');
            return;
        }
        isLoading = true;
        try {
            await websocketStore.requestCurrentChats(childId);
        } catch (error) {
            handleError(`Erreur lors de l'initialisation des contacts: ${error.message || 'Erreur inconnue'}`);
        }
    });
    
</script>

<svelte:head>
    <title>WHATSEYE | Messages</title>
    <link rel="stylesheet" href="/styles/dashboard.css" />
</svelte:head>
<div class="card">
    <div class="card-header-tab card-header">
        <div class="card-header-title font-size-lg text-capitalize fw-normal ">
            <i class="header-icon lnr-bubble icon-gradient bg-amy-crisp"></i>Chats
        </div>
    </div>
    <div class="card-body d-flex flex-column">
        {#if errorMessage}
            <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert" aria-live="assertive">
                {errorMessage}
            </div>
        {/if}</div>
        {#if isLoading}    
            <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Chargement en contacts...
          </div>
        {:else}
<div class="app-inner-layout chat-layout mb-4 contact_room" class:open-mobile-menu={isMobileMenuOpen}>
    <div class="app-inner-layout__wrapper">
        <div class="app-inner-layout__content card"  class:d-none={hamburgerActive}>
            {#if $activChatRoom.name}
            <ChatCard on:toggleAppMenu={handleToggleAppMenu}></ChatCard>
            {/if}
        </div>
        <div class="app-inner-layout__sidebar card overflow-hidden " style="z-index: 5;">
        
            <ul class="nav flex-column ">
                <!-- On click here needs to close the menu -->
                 <div class="contact-list">
                {#each contactList as chat }
                    <RecentChat
                        chatData={chat}
                        isActive={chat.id === activeChatId}
                        on:click={() => handleChatSelect(chat.id)}
                    ></RecentChat>
                {/each}
                </div>
            </ul>
        </div>
    </div>
    </div>
    {/if}
</div>
<style>
    .contact_room{
        max-height: 550px;
        overflow: hidden;
    }
</style>