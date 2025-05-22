<script>
  import { createEventDispatcher } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { fly, fade } from 'svelte/transition';

  export let show = false; 

  let passwordInputValue = '';
  let errorMessage = ''; 

  const dispatch = createEventDispatcher();

  function handleConfirm() {
    if (!passwordInputValue) {
      errorMessage = 'Ce champ est obligatoire';
      return;
    }
    
    errorMessage = ''; 
    
    dispatch('confirm', { password: passwordInputValue });
  }

  function handleCancel() {
    resetModalState();
    dispatch('cancel');
  }
  
  function resetModalState() {
    passwordInputValue = '';
    errorMessage = '';
  }

  
  $: if (!show && (passwordInputValue || errorMessage)) {
    resetModalState();
  }

  
  function handleKeydown(event) {
    if (event.key === 'Escape' && show) {
      handleCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-backdrop" on:click={handleCancel} transition:fade={{ duration: 200 }}></div>
  <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title" transition:fly={{ y: -50, duration: 300, easing: quintOut }}>
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="modal-title" class="modal-title-text">Confirmer votre identitée</h2>
        <button class="close-button" on:click={handleCancel} aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Pour continuer, inserer votre mot de passe.</p>
        <div class="form-group">
          <input
            type="password"
            class="form-control {errorMessage ? 'is-invalid' : ''}"
            bind:value={passwordInputValue}
            placeholder="Mot de passe"
            class:invalid={errorMessage}
            aria-describedby={errorMessage ? "password-error-modal" : ""}
            on:input={() => { if (errorMessage) errorMessage = ''; }}
            on:keydown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
          />
          {#if errorMessage}
            <em class="error invalid-feedback">{errorMessage}</em>
          {/if}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary mb-2 me-2" on:click={handleCancel}>Cancel</button>
        <button class="btn btn-primary mb-2" on:click={handleConfirm}>Confirm & Save</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
  }

  .modal-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    width: 90%;
    max-width: 450px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .modal-title-text {
    font-size: 1.25rem;
    font-weight: 500;
    color: #343a40;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.75rem;
    font-weight: bold;
    color: #6c757d;
    cursor: pointer;
    padding: 0.5rem;
    line-height: 1;
  }
  .close-button:hover {
    color: #343a40;
  }
</style>
