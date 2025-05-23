<script>
    import Message from '$lib/components/Message.svelte';
    import { createEventDispatcher } from 'svelte';

    export let isHamburgerActive = false; 

    const dispatch = createEventDispatcher();

    function handleMobileMenuButtonClick() {
        dispatch('toggleAppMenu');
    }

</script>

<div class="d-flex flex-column flex-md-row align-items-center border-bottom">
    <div class="p-4 d-flex align-items-center">
        <div class="mobile-app-menu-btn" on:click={handleMobileMenuButtonClick} role="button" tabindex="0" 
                aria-label="Toggle mobile menu" 
                on:keydown={(e) => e.key === 'Enter' && handleMobileMenuButtonClick()}>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button type="button" class="hamburger hamburger--elastic" class:is-active={isHamburgerActive}>
                <span class="hamburger-box">
                    <span class="hamburger-inner"></span>
                </span>
            </button>
        </div>
        <div class="img-wrapper me-2">
            <div class="img-icon rounded-3">
                <img src="https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo" alt="">
            </div>
        </div>
        <h5 class="mb-0 text-nowrap fw-bold ">
            Contact name / Group name
            <div class="opacity-7 fw-lighter h6">
                something here / 12 Membres
            </div>
        </h5>
    </div>
    <div class="p-4 d-flex align-items-center ms-lg-auto">
        <button type="button" class="btn btn-outline-secondary me-2 mb-2">Voir les membres</button>
        <button type="button" class="btn btn-outline-warning mb-2">Blocker l'utilisateur || Quitter le groupe</button>
    </div>
</div>
<div class="chat-wrapper">
    <Message></Message>
</div>

<style>
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