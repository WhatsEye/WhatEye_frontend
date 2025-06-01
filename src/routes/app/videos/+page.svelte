<script>
	import { num_vd_calls } from './../../../stores/functions.js';
  import { onMount, onDestroy } from 'svelte';
  import { baseurl } from '../../../stores/functions';

  // State variables
  let records = [];
  let groupedRecords = {};
  let nextUrl = null;
  let isLoading = false;
  let errorMessage = '';
  let loadMoreTrigger;
  let observer;
  let selectedVideo = null;
  let userId;
  let showDeleteConfirm = false;
  let videoIdToDelete = null;
  let deletedVideoTimestamp = null;
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

  // Fetch video records from API
  async function fetchRecords(url) {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access) {
      errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(url || `${baseurl}/control/records/${userId}/video/`, {
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
        (record) => record.id && record.record_file && record.date && record.recording_type === 'video'
      );
      records = [...records, ...newRecords];
      nextUrl = json.next;
    } catch (error) {
      errorMessage = `Erreur lors de la récupération des vidéos: ${error.message}`;
    } finally {
      isLoading = false;
      setTimeout(() => (errorMessage = ''), 3000);
    }
  }

  // Initiate video deletion
  function confirmDeleteVideo(videoId, timestamp) {
    videoIdToDelete = videoId;
    deletedVideoTimestamp = new Date(timestamp).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    showDeleteConfirm = true;
  }

  // Delete video record
  async function deleteVideo() {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access) {
      errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      showDeleteConfirm = false;
      videoIdToDelete = null;
      deletedVideoTimestamp = null;
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/records/${userId}/update/${videoIdToDelete}/`, {
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
        videoIdToDelete = null;
        deletedVideoTimestamp = null;
        return;
      }

      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

      if (res.ok) {
        done_deletion = true;
        setTimeout(() => {
          done_deletion = false;
        }, 5000);
      }

      // Remove the deleted video from records
      records = records.filter((record) => record.id !== videoIdToDelete);
      errorMessage = 'Vidéo supprimée avec succès.';
    } catch (error) {
      errorMessage = `Erreur lors de la suppression de la vidéo: ${error.message}`;
    } finally {
      showDeleteConfirm = false;
      videoIdToDelete = null;
      setTimeout(() => (errorMessage = ''), 3000);
    }
  }

  // Select video to play
  async function selectVideo(video) {
    selectedVideo = video;

    // Skip if already read
    if (video.is_read) return;

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access) {
      errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      setTimeout(() => (errorMessage = ''), 3000);
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/records/${userId}/update/${video.id}/`, {
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
        rec.id === video.id ? { ...rec, is_read: true } : rec
      );
      num_vd_calls.update(num=>num-1)
    } catch (error) {
      errorMessage = `Erreur lors du marquage de la vidéo comme vue: ${error.message}`;
      setTimeout(() => (errorMessage = ''), 3000);
    }
  }
  // Close video popup
  function closeVideo() {
    selectedVideo = null;
  }

  // Lifecycle: Initialize component
  onMount(async () => {
    userId = localStorage.getItem('ActiveChild');
    if (!userId) {
      errorMessage = 'Aucun utilisateur actif sélectionné.';
      return;
    }

    try {
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
    } catch (error) {
      errorMessage = `Erreur lors de l'initialisation: ${error.message}`;
    }
  });

  // Helper function to format video duration


  // Lifecycle: Cleanup on destroy
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });
</script>

<svelte:head>
  <title>WHATSEYE | Vidéos</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />
</svelte:head>

<main class="main-card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-camera-video icon-gradient bg-amy-crisp"></i>
      Enregistrements Vidéos
    </div>
  </div>
  <div class="p-0 m-3 card-body d-flex flex-column">
    <div class="description">
      Consultez les enregistrements vidéo associés à votre enfant, organisés par date. Cliquez sur une vignette pour visionner la vidéo correspondante ou sur supprimer pour la retirer.
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
          Chargement des vidéos...
        </div>
      {:else if records.length === 0}
        <div class="placeholder" role="status" aria-live="polite">
          <i class="placeholder-icon lnr-camera-video"></i>
          <p>Aucune vidéo disponible pour le moment.</p>
        </div>
      {:else}
        {#each Object.entries(groupedRecords) as [date, videos]}
          <div class="video-group" role="group" aria-label={`Vidéos du ${date}`}>
            <h3 class="date-header">{date}</h3>
            <div class="video-grid">
              {#each videos as video (video.id)}
                <div
                  class="video-card"
                  role="option"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && selectVideo(video)}
                >
                  <div class="video-thumbnail" on:click={() => selectVideo(video)}>
                    <video
                      src={video.record_file}
                      muted
                      preload="metadata"
                      class="thumbnail-video"
                      aria-hidden="true"
                    ></video>
                    <div class="play-icon"><i class="lnr-play-circle"></i></div>
                  
                  </div>
                  <div class="video-card-info">
                    <span class="video-timestamp">
                      {new Date(video.timestamp).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div class="video-info-actions">
                      {#if !video.is_read}
                        <span class="unread-badge">Non lu</span>
                      {/if}
                      <button
                        class="delete-button"
                        on:click={() => confirmDeleteVideo(video.id, video.timestamp)}
                        on:keydown={(e) => e.key === 'Enter' && confirmDeleteVideo(video.id, video.timestamp)}
                        aria-label={`Supprimer la vidéo du ${new Date(video.timestamp).toLocaleString('fr-FR')}`}
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
          Êtes-vous sûr de vouloir supprimer la vidéo enregistrée le {deletedVideoTimestamp} ?
        </p>
        <div class="buttons">
          <button
            class="cancel"
            on:click={() => {
              showDeleteConfirm = false;
              videoIdToDelete = null;
              deletedVideoTimestamp = null;
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </button>
          <button
            class="confirm"
            on:click={deleteVideo}
            on:keydown={(e) => e.key === 'Enter' && deleteVideo()}
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </button>
        </div>
      </div>
    {/if}

    {#if deletedVideoTimestamp && done_deletion}
      <div class="delete-dialog" role="alert">
        <h3>Vidéo supprimée</h3>
        <p>La vidéo enregistrée le {deletedVideoTimestamp} a été supprimée.</p>
        <button
          on:click={() => {
            deletedVideoTimestamp = null;
            done_deletion = false;
          }}
          on:keydown={(e) => e.key === 'Enter' && (deletedVideoTimestamp = null, done_deletion = false)}
          aria-label="Fermer la notification"
        >
          Fermer
        </button>
      </div>
    {/if}

    {#if selectedVideo}
      <div class="video-popup" role="dialog" aria-modal="true" aria-labelledby="videoTitle">
        <div class="video-popup-content">
          <h3 id="videoTitle" class="video-popup-title">
            Vidéo enregistrée le {new Date(selectedVideo.timestamp).toLocaleString('fr-FR')}
          </h3>
          <video
            controls
            autoplay
            src={selectedVideo.record_file}
            class="popup-video-player"
            aria-label={`Vidéo enregistrée le ${new Date(selectedVideo.timestamp).toLocaleString('fr-FR')}`}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
          <div class="video-popup-buttons">
            <button
              class="close-button"
              on:click={closeVideo}
              on:keydown={(e) => e.key === 'Enter' && closeVideo()}
              aria-label="Fermer la vidéo"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>

