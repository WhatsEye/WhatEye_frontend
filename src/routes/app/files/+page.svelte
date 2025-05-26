<script>
  import { onMount } from 'svelte';
  import { filesArrivedStore, filesStore, fileUriArrivedStore, fileUriBase64Store } from '../../../stores/functions';
  import { websocketStore } from '../../../stores/websockets';

  let files = [];
  let childId;
  let errorMessage = '';
  let isLoading = false;
  let isDownload = false;
  let selectedType = 'ALL';
  let filteredFiles = [];
  let downloadFileName = ''; // <-- stores file name for download

  // Watch for files arrival
  $: if ($filesArrivedStore) {
    files = $filesStore;
    files = files.filter((file, index, self) =>
      index === self.findIndex(f => f.uri === file.uri)
    );
    filterFiles(selectedType);
    isLoading = false
    filesArrivedStore.set(false);
  }

  // When file URI and Base64 arrives, decode and download
  $: if ($fileUriArrivedStore) {
    const byteCharacters = atob($fileUriBase64Store);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob from the binary data
    const blob = new Blob([byteArray], { type: "application/octet-stream" });

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFileName || "downloaded_file"; // <-- Use saved file name
    document.body.appendChild(a);
    a.click();

    // Clean up
    a.remove();
    window.URL.revokeObjectURL(url);
    isDownload=false
    fileUriArrivedStore.set(false);
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  }

  // Format file date
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Request a file download by URI
  function downloadFile(uri, name) {
    isDownload = true;
    try {
      downloadFileName = name; // <-- Save filename before requesting
      websocketStore.requestFileUri(childId, uri);
    } catch (error) {
      handleError(`Erreur lors du téléchargement: ${error.message || 'Erreur inconnue'}`);
    }
  }

  // Filter and sort files
  function filterFiles(type) {
    selectedType = type;
    if (type === 'ALL') {
      filteredFiles = [...files];
    } else {
      filteredFiles = files.filter(file => file.type === type);
    }
    filteredFiles = filteredFiles.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
  }

  // Handle and display errors
  function handleError(message, duration = 5000) {
    errorMessage = message;
    isLoading = false;
    setTimeout(() => (errorMessage = ''), duration);
  }

  // Initialization
  onMount(() => {
    childId = localStorage.getItem('ActiveChild');
    if (!childId) {
      handleError('Aucun enfant sélectionné. Veuillez choisir un profil.');
      return;
    }
    try {
      isLoading = true;
      websocketStore.requestFiles(childId);
    } catch (error) {
      handleError(`Erreur lors de l'initialisation des contacts: ${error.message || 'Erreur inconnue'}`);
    }
  });
</script>

<svelte:head>
  <title>WHATSEYE | Dossiers</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />
</svelte:head>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon pe-7s-folder icon-gradient bg-amy-crisp"></i>
      Dossiers
    </div>
  </div>

  <!-- Tab Selector -->
  <div class="tabs">
    <button class:active={selectedType === 'ALL'} on:click={() => filterFiles('ALL')}>
      <i class="lnr lnr-menu"></i> Tous
    </button>
    <button class:active={selectedType === 'AUDIO'} on:click={() => filterFiles('AUDIO')}>
      <i class="lnr lnr-volume"></i> Audio
    </button>
    <button class:active={selectedType === 'IMAGE'} on:click={() => filterFiles('IMAGE')}>
      <i class="lnr lnr-picture"></i> Image
    </button>
    <button class:active={selectedType === 'VIDEO'} on:click={() => filterFiles('VIDEO')}>
      <i class="lnr lnr-camera-video"></i> Vidéo
    </button>
    <button class:active={selectedType === 'DOCUMENT'} on:click={() => filterFiles('DOCUMENT')}>
      <i class="lnr lnr-file-empty"></i> Document
    </button>
  </div>

  {#if errorMessage}
            <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert" aria-live="assertive">
                {errorMessage}
            </div>
        {/if}
    <!-- File List or Placeholder -->
    <div class="file-list">
      {#if isDownload}    
            <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Le fichier est en cours de téléchargement...
          </div>
      {/if} 
        {#if isLoading}    
            <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Chargement en Dossiers...
          </div>
    {:else if filteredFiles.length === 0}
      <div class="placeholder" role="status" aria-live="polite">
        <i class="placeholder-icon lnr lnr-warning"></i>
        {#if selectedType === 'ALL'}
          <p>Aucun mot interdit pour le moment.<br />Ajoutez un mot ci-dessus pour commencer la surveillance.</p>
        {:else if selectedType === 'AUDIO'}
          <p>Aucun fichier audio pour le moment.<br />Ajoutez un mot ci-dessus pour commencer la surveillance.</p>
        {:else if selectedType === 'IMAGE'}
          <p>Aucune image pour le moment.<br />Ajoutez un mot ci-dessus pour commencer la surveillance.</p>
        {:else if selectedType === 'VIDEO'}
          <p>Aucune vidéo pour le moment.<br />Ajoutez un mot ci-dessus pour commencer la surveillance.</p>
        {:else if selectedType === 'DOCUMENT'}
          <p>Aucun document pour le moment.<br />Ajoutez un mot ci-dessus pour commencer la surveillance.</p>
        {/if}
      </div>
    {:else}
      {#each filteredFiles as file}
        <div class="file-item">
          <div class="file-icon">
            {#if file.type === 'AUDIO'}
              <i class="lnr lnr-volume"></i>
            {:else if file.type === 'IMAGE'}
              <i class="lnr lnr-picture"></i>
            {:else if file.type === 'VIDEO'}
              <i class="lnr lnr-camera-video"></i>
            {:else if file.type === 'DOCUMENT'}
              <i class="lnr lnr-file-empty"></i>
            {/if}
          </div>
          <div class="file-info">
            <span class="file-name">{file.name}</span>
            <span class="file-details">
              {formatFileSize(file.size)} | {formatDate(file.lastModified)}
            </span>
          </div>
          <button disabled={isDownload}  class="download-btn" on:click={() => downloadFile(file.uri, file.name)}>
         
            <i class="lnr lnr-arrow-down"></i> 
           
           Télécharger
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .tabs {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #dee2e6;
  }

  .tabs button {
    background: none;
    border: none;
    padding: 8px 16px;
    margin-right: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    color: #495057;
    font-size: 14px;
  }

  .tabs button.active {
    background-color: #e9ecef;
    border-radius: 4px;
    font-weight: bold;
  }

  .tabs button:hover {
    background-color: #f1f3f5;
    border-radius: 4px;
  }

  .file-list {
    padding: 10px;
    overflow-y: scroll;
    height: 530px;
  }

  .file-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #f1f3f5;
  }

  .file-icon {
    margin-right: 10px;
    font-size: 24px;
    color: #6c757d;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .file-name {
    font-size: 14px;
    color: #212529;
  }

  .file-details {
    font-size: 12px;
    color: #6c757d;
  }

  .download-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
  }

  .download-btn:hover {
    background-color: #0056b3;
  }
</style>