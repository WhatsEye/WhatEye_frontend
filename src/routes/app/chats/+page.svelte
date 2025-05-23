<script>
    import RecentChat from '$lib/components/RecentChat.svelte';
    import ChatCard from '$lib/components/ChatCard.svelte';

    let isMobileMenuOpen = false;

    function handleToggleAppMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
    }
</script>

<svelte:head>
    <title>WHATSEYE | Messages</title>
</svelte:head>

<div class="app-inner-layout chat-layout mb-4" class:open-mobile-menu={isMobileMenuOpen}>
    <div class="app-inner-layout__wrapper">
        <div class="app-inner-layout__content card">
            <!-- Auto select first discussion ? -->
            <ChatCard on:toggleAppMenu={handleToggleAppMenu}></ChatCard>
        </div>
        <div class="app-inner-layout__sidebar card">
            <div class="app-inner-layout__sidebar-header">
                <ul class="nav flex-column">
                    <li class="nav-item-header nav-item">discussions récentes</li>
                </ul>
            </div>
            <ul class="nav flex-column">
                <!-- On click here needs to close the menu -->
                <RecentChat isActive="1"></RecentChat>
                <RecentChat></RecentChat>
                <RecentChat></RecentChat>
            </ul>
        </div>
    </div>
</div>