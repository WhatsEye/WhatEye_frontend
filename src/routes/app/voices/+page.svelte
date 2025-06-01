<script>
	import { num_vo_calls } from './../../../stores/functions.js';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment'; // Import browser check
  import { baseurl } from '../../../stores/functions';

  // State variables
  let records = [];
  let groupedRecords = {};
  let nextUrl = null;
  let isLoading = false;
  let errorMessage = '';
  let loadMoreTrigger;
  let observer;
  let selectedAudio = null;
  let userId;
  let showDeleteConfirm = false;
  let audioIdToDelete = null;
  let deletedAudioTimestamp = null;
  let done_deletion = false;

  // Computed property: Group records by formatted date
  $: groupedRecords = records.reduce((acc, record) => {
    const date = new Date(record.date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    acc[date] = acc[date] || [];
    acc[date].push(record);
    return acc;
  }, {});

  // Fetch audio records from API
  async function fetchRecords(url) {
    if (isLoading || !userId) {
      errorMessage = userId ? errorMessage : 'Utilisateur non défini. Veuillez sélectionner un utilisateur.';
      isLoading = false;
      return;
    }
    isLoading = true;
    errorMessage = '';

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access) {
      errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(url || `${baseurl}/control/records/${userId}/voice/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
      });

      if (res.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        isLoading = false;
        return;
      }

      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

      const json = await res.json();
      const newRecords = json.results.filter(
        (r) => r.id && r.record_file && r.date && r.recording_type === 'voice'
      );
      records = [...records, ...newRecords];
      nextUrl = json.next;
    } catch (error) {
      errorMessage = `Erreur lors de la récupération des audios: ${error.message}`;
    } finally {
      isLoading = false;
      setTimeout(() => (errorMessage = ''), 3000);
    }
  }

  // Initiate audio deletion
  function confirmDeleteAudio(audioId, timestamp) {
    audioIdToDelete = audioId;
    deletedAudioTimestamp = new Date(timestamp).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    showDeleteConfirm = true;
  }

  // Delete audio record
  async function deleteAudio() {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access) {
      errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      showDeleteConfirm = false;
      audioIdToDelete = null;
      deletedAudioTimestamp = null;
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/records/${userId}/update/${audioIdToDelete}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ is_deleted: true }),
      });

      if (res.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        showDeleteConfirm = false;
        audioIdToDelete = null;
        deletedAudioTimestamp = null;
        return;
      }

      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

      if (res.ok) {
        done_deletion = true;
        setTimeout(() => {
          done_deletion = false;
        }, 5000);
      }

      // Remove the deleted audio from records
      records = records.filter((record) => record.id !== audioIdToDelete);
      errorMessage = 'Audio supprimé avec succès.';
    } catch (error) {
      errorMessage = `Erreur lors de la suppression de l'audio: ${error.message}`;
    } finally {
      showDeleteConfirm = false;
      audioIdToDelete = null;
      setTimeout(() => (errorMessage = ''), 3000);
    }
  }

  // Select audio to play and mark as seen
  async function openAudio(audio) {
    selectedAudio = audio;
    if (browser) {
      document.body.style.overflow = 'hidden'; // Only in browser
    }

    // Skip if already read
    if (audio.is_read) return;

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access) {
      errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      setTimeout(() => (errorMessage = ''), 3000);
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/records/${userId}/update/${audio.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ is_read: true }),
      });

      if (res.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        setTimeout(() => (errorMessage = ''), 3000);
        return;
      }

      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

      // Update the local records to reflect the new is_read status
      records = records.map((rec) =>
        rec.id === audio.id ? { ...rec, is_read: true } : rec
      );
      num_vo_calls.update(num=>num-1)

    } catch (error) {
      errorMessage = `Erreur lors du marquage de l'audio comme écouté: ${error.message}`;
      setTimeout(() => (errorMessage = ''), 3000);
    }
  }

  // Close audio modal
  function closeAudio() {
    selectedAudio = null;
    if (browser) {
      document.body.style.overflow = 'auto'; // Only in browser
    }
  }

  // Helper function to format audio duration


  // Lifecycle: Initialize component
  onMount(async () => {
    userId = localStorage.getItem('ActiveChild');
    if (!userId) {
      errorMessage = 'Aucun utilisateur actif sélectionné.';
      return;
    }

    await fetchRecords();

    if (typeof IntersectionObserver !== 'undefined' && loadMoreTrigger) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && nextUrl && !isLoading) {
            fetchRecords(nextUrl);
          }
        },
        { rootMargin: '100px' }
      );
      observer.observe(loadMoreTrigger);
    }

    // Handle Escape key to close modal
    const handleKey = (e) => {
      if (e.key === 'Escape' && (selectedAudio || showDeleteConfirm)) {
        closeAudio();
        showDeleteConfirm = false;
        audioIdToDelete = null;
        deletedAudioTimestamp = null;
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      if (observer) observer.disconnect();
      if (browser) {
      document.body.style.overflow = 'auto'; // Only in browser
    }
    };
  });

  // Lifecycle: Cleanup on destroy
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
     if (browser) {
      document.body.style.overflow = 'auto'; // Only in browser
    }
  });
</script>

<svelte:head>
  <title>WHATSEYE | Enregistrements Vocaux</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />
</svelte:head>

<main class="main-card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-mic icon-gradient bg-amy-crisp"></i>
      Enregistrements Vocaux
    </div>
  </div>
  <div class="p-0 m-3 card-body d-flex flex-column">
    <div class="description">
      Consultez les enregistrements vocaux associés à votre enfant, organisés par date. Cliquez sur une carte pour écouter l’audio correspondant ou sur supprimer pour le retirer.
    </div>

    {#if errorMessage}
      <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert">
        {errorMessage}
      </div>
    {/if}

    <div class="video-grid-container">
      {#if isLoading && records.length === 0}
        <div class="loading" role="status" aria-live="polite">
          <div class="spinner"></div>
          Chargement des audios...
        </div>
      {:else if records.length === 0}
        <div class="placeholder" role="status" aria-live="polite">
          <i class="placeholder-icon lnr-mic"></i>
          <p>Aucun audio disponible pour le moment.</p>
        </div>
      {:else}
        {#each Object.entries(groupedRecords) as [date, audios]}
          <div class="video-group" role="group" aria-label={`Audios du ${date}`}>
            <h3 class="date-header">{date}</h3>
            <div class="video-grid">
              {#each audios as audio (audio.id)}
                <div
                  class="video-card"
                  role="option"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && openAudio(audio)}
                >
                  <div class="video-thumbnail" on:click={() => openAudio(audio)}>
                    <div class="audio-placeholder">
                      <i class="lnr-mic"></i>
                    </div>
                    <div class="play-icon"><i class="lnr-play-circle"></i></div>
                    
                  </div>
                  <div class="video-card-info">
                    <span class="video-timestamp">
                      {new Date(audio.timestamp).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div class="video-info-actions">
                      {#if !audio.is_read}
                        <span class="unread-badge">Non lu</span>
                      {/if}
                      <button
                        class="delete-button"
                        on:click={() => confirmDeleteAudio(audio.id, audio.timestamp)}
                        on:keydown={(e) => e.key === 'Enter' && confirmDeleteAudio(audio.id, audio.timestamp)}
                        aria-label={`Supprimer l'audio du ${new Date(audio.timestamp).toLocaleString('fr-FR')}`}
                      >
                        <i class="lnr-trash"></i> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
        {#if nextUrl}
          <div bind:this={loadMoreTrigger} class="load-more"></div>
        {/if}
      {/if}
    </div>

    {#if showDeleteConfirm}
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle">Confirmer la suppression</h3>
        <p id="confirmDesc">
          Êtes-vous sûr de vouloir supprimer l’audio enregistré le {deletedAudioTimestamp} ?
        </p>
        <div class="buttons">
          <button
            class="cancel"
            on:click={() => {
              showDeleteConfirm = false;
              audioIdToDelete = null;
              deletedAudioTimestamp = null;
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </button>
          <button
            class="confirm"
            on:click={deleteAudio}
            on:keydown={(e) => e.key === 'Enter' && deleteAudio()}
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </button>
        </div>
      </div>
    {/if}

    {#if deletedAudioTimestamp && done_deletion}
      <div class="delete-dialog" role="alert">
        <h3>Audio supprimé</h3>
        <p>L’audio enregistré le {deletedAudioTimestamp} a été supprimé.</p>
        <button
          on:click={() => {
            deletedAudioTimestamp = null;
            done_deletion = false;
          }}
          on:keydown={(e) => e.key === 'Enter' && (deletedAudioTimestamp = null, done_deletion = false)}
          aria-label="Fermer la notification"
        >
          Fermer
        </button>
      </div>
    {/if}

    {#if selectedAudio}
      <div class="video-popup" role="dialog" aria-modal="true" aria-labelledby="audioTitle">
        <div class="video-popup-content">
          <h3 id="audioTitle" class="video-popup-title">
            Audio enregistré le {new Date(selectedAudio.timestamp).toLocaleString('fr-FR')}
          </h3>
          <audio
            controls
            autoplay
            src={selectedAudio.record_file}
            class="popup-audio-player"
            aria-label={`Audio enregistré le ${new Date(selectedAudio.timestamp).toLocaleString('fr-FR')}`}
          >
            Votre navigateur ne supporte pas la lecture d’audio.
          </audio>
          <div class="video-popup-buttons">
            <button
              class="close-button"
              on:click={closeAudio}
              on:keydown={(e) => e.key === 'Enter' && closeAudio()}
              aria-label="Fermer l’audio"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>


<style>
  .popup-audio-player{
    width: 100%;
  }
</style>
