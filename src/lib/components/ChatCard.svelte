<script>
    import Message from '$lib/components/Message.svelte';
</script>

<div class="table-responsive">
    <!-- Discussion header -->
    <div class="app-inner-layout__top-pane">
        <div class="pane-left">
            <div class="mobile-app-menu-btn">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button type="button" class="hamburger hamburger--elastic">
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
                    something here
                </div>
            </h4>
        </div>
        <div class="pane-right">
            <button type="button" class="btn btn-outline-warning mb-2 me-2">Blocker l'utilisateur / Quitter le groupe</button>
        </div>
    </div>
    <div class="chat-wrapper">
        <Message></Message>
        <Message></Message>
        <Message></Message>
    </div>
</div>