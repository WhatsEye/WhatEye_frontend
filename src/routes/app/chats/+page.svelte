<script>
    import RecentChat from '$lib/components/RecentChat.svelte';
    import ChatCard from '$lib/components/ChatCard.svelte';
</script>

<svelte:head>
    <title>WHATSEYE | Messages</title>
</svelte:head>

<div class="app-inner-layout chat-layout mb-4">
    <div class="app-inner-layout__wrapper">
        <div class="app-inner-layout__content card">
            <!-- Auto select first discussion ? -->
            <ChatCard></ChatCard>
        </div>
        <div class="app-inner-layout__sidebar card">
            <div class="app-inner-layout__sidebar-header">
                <ul class="nav flex-column">
                    <li class="nav-item-header nav-item">discussions récentes</li>
                </ul>
            </div>
            <ul class="nav flex-column">
                <RecentChat isActive="1"></RecentChat>
                <RecentChat></RecentChat>
                <RecentChat></RecentChat>
            </ul>
        </div>
    </div>
</div>