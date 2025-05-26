<script>
    import { createEventDispatcher } from "svelte";
    import { contactBlockedArrivedStore, contactsChatStore } from "../../stores/functions";
  import { websocketStore } from "../../stores/websockets";
    export let chatData;
    export let isActive = false;
    let childId;
    let isLoading = false;
    let errorMessage  = ''

    const dispatch = createEventDispatcher();

    let showBlockConfirm = false;
    let userToBlock = null;
    let blockedUser = null;

    $: if ($contactBlockedArrivedStore && userToBlock) {
        isLoading = false;
        showBlockConfirm = false; // Explicitly close the confirmation block
        const blockedChatId = userToBlock?.id; 
        userToBlock = null;
        contactBlockedArrivedStore.set(false); // Reset the store
        console.log(chatData.id)
        contactsChatStore.update((items)=>items.filter((item,index)=>index!==chatData.id))
    }
    
    function handleError(message, duration = 5000) {
        errorMessage = message;
        isLoading = false;
        setTimeout(() => (errorMessage = ''), duration);
    }
    function initiateBlockUser() {
        userToBlock = chatData;
        showBlockConfirm = true;
    }

    async function  handleBlockUser() {
        childId = localStorage.getItem('ActiveChild');
        if (!childId) {
            handleError('Aucun enfant sélectionné. Veuillez choisir un profil.');
            return;
        }
        isLoading = true;
        try {
            await websocketStore.requestBlockChat(childId, userToBlock.name, userToBlock.pos);
        } catch (error) {
            handleError(`Erreur lors de l'initialisation des contacts: ${error.message || 'Erreur inconnue'}`);
        }
    }
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div role="button" on:click={handleClick} on:block={handleBlockUser} on:keydown={(e) => (e.key === 'Enter' || e.key === 'Space') && handleClick()} class="chat-item" tabindex="0">
    <div class="divider"></div>
    <li class="nav-item">
        <div class="button-container">
            <button type="button" class="dropdown-item" class:active={isActive}>
                <div class="widget-content">
                    <div class="widget-content-wrapper">
                        <div class="widget-content-left avatar-container">
                            <div class="avatar-icon-wrapper">
                                <div class="avatar-icon">
                                    <img 
                                        src={chatData.icon || "https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo"} 
                                        alt="{chatData.name}'s profile photo"
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="widget-content-right">
                            <div class="chat-header">
                                <div class="widget-heading">{chatData.name}</div>
                                <div class="timestamp">{chatData.timestamp}</div>
                            </div>
                            <div class="chat-subheader">
                                <div class="widget-subheading">{chatData.last_msg}</div>
                                {#if chatData.num_unread}
                                    <span class="unread-count">{chatData.num_unread}</span>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </button>
            <button 
                type="button" 
                class="block-button"
                on:click|stopPropagation={initiateBlockUser}
                title="Block user"
            >
                Block
            </button>
        </div>
    </li>
    <div class="divider"></div>
</div>

{#if showBlockConfirm}
    <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="blockConfirmTitle">
        <h3 id="blockConfirmTitle">Confirmer le blocage</h3>
        <p id="blockConfirmDesc">
            Êtes-vous sûr de vouloir bloquer l'utilisateur "{userToBlock}" ?
        </p>
        <div class="buttons">
            <button
                class="cancel"
                on:click={() => {
                    showBlockConfirm = false;
                    userToBlock = null;
                }}
                aria-label="Annuler le blocage"
            >
                Annuler
            </button>
            <button
                class="confirm"
                on:click={handleBlockUser}
                on:keydown={(e) => e.key === 'Enter' && handleBlockUser()}
                aria-label="Confirmer le blocage"
                disabled={isLoading}
            >
            
            
            <!-- <div class="loading" style="width: 30px; height: 30px;"  role="status" aria-live="polite"> -->
            <div style="display: flex;">
                {#if isLoading}
            <div class="spinner" style=" margin: 0 5px 0 0;  width: 20px; height: 20px;"></div>
            {/if}
            <div> Bloquer</div> 
            </div>
            
                
            </button>
        </div>
    </div>
{/if}

{#if blockedUser}
    <div class="delete-dialog" role="alert">
        <h3>Utilisateur bloqué</h3>
        <p>L'utilisateur "{blockedUser}" a été bloqué.</p>
        <button
            on:click={() => (blockedUser = null)}
            on:keydown={(e) => e.key === 'Enter' && (blockedUser = null)}
            aria-label="Fermer la notification"
        >
            Fermer
        </button>
    </div>
{/if}

<style>
    .divider {
        height: 1px;
        background-color: var(--divider-color, #e6faf0);
        margin: 0;
    }

    .dropdown-item:active,
    .dropdown-item:hover {
        background: #e6faf6;
    }

    .dropdown-item.active {
        background-color: var(--active-bg, #d6f2f0);
    }

    .avatar-container {
        margin: 0 12px 0 -12px;
    }

    .avatar-icon-wrapper {
        width: 54px;
        height: 54px;
        margin-left: 8px;
    }

    .avatar-icon {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
    }

    .widget-content-right {
        flex: 1;
        padding: 10px 5px;
        display: flex;
        flex-direction: column;
    }

    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .widget-heading {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color, #333);
    }

    .timestamp {
        font-size: 12px;
        color: var(--timestamp-color, #888);
    }

    .chat-subheader {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .widget-subheading {
        font-size: 14px;
        color: var(--subtext-color, #666);
        white-space: nowrap;
        overflow: hidden;
        width: 180px;
        text-overflow: ellipsis;
        max-width: 200px;
    }

    .unread-count {
        background-color: var(--unread-bg, #25D366);
        color: #fff;
        font-size: 12px;
        font-weight: bold;
        padding: 2px 8px;
        border-radius: 12px;
        min-width: 20px;
        text-align: center;
    }

    .button-container {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .dropdown-item {
        flex: 1;
        padding: 8px 10px;
    }

    .block-button {
        padding: 4px 8px;
        margin-right: 8px;
        background-color: var(--block-bg, #ff4d4f);
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .block-button:hover {
        background-color: var(--block-hover-bg, #d9363e);
    }

    .confirm-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
    }


    .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    .cancel, .confirm {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .cancel {
        background-color: #ccc;
        color: #333;
    }

    .cancel:hover {
        background-color: #bbb;
    }

    .confirm {
        background-color: var(--block-bg, #ff4d4f);
        color: #fff;
    }

    .confirm:hover {
        background-color: var(--block-hover-bg, #d9363e);
    }

    @media (max-width: 576px) {
        .dropdown-item {
            padding: 8px 10px;
        }

        .widget-heading {
            font-size: 14px;
        }

        .widget-subheading {
            font-size: 12px;
            max-width: 150px;
        }

        .timestamp {
            font-size: 11px;
        }

        .avatar-icon-wrapper {
            width: 48px;
            height: 48px;
            margin-left: 12px;
        }

        .block-button {
            font-size: 11px;
            padding: 3px 6px;
        }


        .cancel, .confirm {
            padding: 6px 12px;
            font-size: 12px;
        }
    }
</style>