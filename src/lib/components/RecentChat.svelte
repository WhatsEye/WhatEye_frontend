<script>
    import { createEventDispatcher } from "svelte";
    export let chatData;
    export let isActive = false;

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('click');
    }
</script>


<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div role="button" on:click={handleClick}>
    <div class="row divider m-0 border"></div>
    <li class="nav-item">
        <button type="button" class="dropdown-item" class:active={isActive}>
            <!-- TODO: add class active for selected discussion -->
            <div class="widget-content p-0">
                <div class="widget-content-wrapper">
                    <div class="widget-content-left me-3">
                        <div class="avatar-icon-wrapper">
                            <div class="avatar-icon">
                                <img src={chatData.avatar || "https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo"} 
                                    alt="{chatData.name}'s profile photo">
                            </div>
                        </div>
                    </div>
                    <div class="widget-content-left">
                        <div class="widget-heading">{chatData.name}</div>
                        <div class="widget-subheading">{chatData.lastMessage}</div>
                    </div>
                </div>
            </div>
        </button>
    </li>
    <div class="row divider m-0 border"></div>
</div>