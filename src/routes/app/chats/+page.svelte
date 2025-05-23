<script>
    import RecentChat from '$lib/components/RecentChat.svelte';
    import ChatCard from '$lib/components/ChatCard.svelte';

    let isMobileMenuOpen = false;
    let hamburgerActive = false;

    let chats = [
        { id: 'chat1', name: 'Alice Wonderland', lastMessage: 'See you soon!', avatar: 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=AW' },
        { id: 'chat2', name: 'Bob The Builder', lastMessage: 'Can we fix it?', avatar: 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=BB' },
        { id: 'chat3', name: 'Charlie Brown', lastMessage: 'Good grief.', avatar: 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=CB' },
        { id: 'chat4', name: 'A Very Long Name Indeed To Test Truncation', lastMessage: 'This is also a very long message to see how the truncation behaves in the UI.', avatar: 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=VL' }
    ];
    let activeChatId = chats.length > 0 ? chats[0].id : null;
    
    function handleToggleAppMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        hamburgerActive = !hamburgerActive;
    }

    function handleChatSelect(chatId) {
        activeChatId = chatId;
        hamburgerActive = false;
        isMobileMenuOpen = false;
    }    
</script>

<svelte:head>
    <title>WHATSEYE | Messages</title>
</svelte:head>

<div class="app-inner-layout chat-layout mb-4" class:open-mobile-menu={isMobileMenuOpen}>
    <div class="app-inner-layout__wrapper">
        <div class="app-inner-layout__content card"  class:d-none={hamburgerActive}>
            <ChatCard on:toggleAppMenu={handleToggleAppMenu}></ChatCard>
        </div>
        <div class="app-inner-layout__sidebar card overflow-hidden" style="z-index: 5;">
            <div class="app-inner-layout__sidebar-header">
                <ul class="nav flex-column">
                    <li class="nav-item-header nav-item">discussions récentes</li>
                </ul>
            </div>
            <ul class="nav flex-column">
                <!-- On click here needs to close the menu -->
                {#each chats as chat (chat.id)}
                    <RecentChat
                        chatData={chat}
                        isActive={chat.id === activeChatId}
                        on:click={() => handleChatSelect(chat.id)}
                    ></RecentChat>
                {/each}
            </ul>
        </div>
    </div>
</div>