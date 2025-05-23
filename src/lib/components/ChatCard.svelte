<script>
    import Message from '$lib/components/Message.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let hamburgerActive = false;

    function handleMobileMenuButtonClick() {
        hamburgerActive = !hamburgerActive;
        dispatch('toggleAppMenu');
    }
</script>

<div class="table-responsive">
    <!-- Discussion header -->
    <div class="app-inner-layout__top-pane flex-sm-row">
        <div class="pane-left">
            <div class="mobile-app-menu-btn" on:click={handleMobileMenuButtonClick} role="button" tabindex="0" 
                aria-label="Toggle mobile menu" 
                on:keydown={(e) => e.key === 'Enter' && handleMobileMenuButtonClick()}>
                <button type="button" class="hamburger hamburger--elastic" class:is-active={hamburgerActive}>
                    <span class="hamburger-box">
                        <span class="hamburger-inner"></span>
                    </span>
                </button>
            </div>
            <div class="avatar-icon-wrapper me-2">
                <div class="avatar-icon avatar-icon-xl rounded-3">
                    <img src="https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo" alt="">
                </div>
            </div>
            <h4 class="mb-0 text-nowrap fw-bold">
                Contact name / Group name
                <div class="opacity-7 fw-lighter">
                    something here / 12 Membres
                </div>
            </h4>
        </div>
        <div class="pane-right">
            <button type="button" class="btn btn-outline-secondary mb-2 me-2">Voir les membres</button>
            <button type="button" class="btn btn-outline-warning mb-2 me-2">Blocker l'utilisateur || Quitter le groupe</button>
        </div>
    </div>
    <div class="chat-wrapper">
        <Message></Message>
        <Message></Message>
        <Message></Message>
    </div>
</div>