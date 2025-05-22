<script>
  import { onMount, tick } from 'svelte';
  import { baseurl } from '../../../stores/functions';
  import { websocketStore } from '../../../stores/websockets';

  let badWords = [];
  let isLoading = false;
  let errorMessage = '';
  let newWord = '';
  let showDeleteConfirm = false;
  let wordToDelete = null;
  let deletedWord = null;



  async function fetchBadWords() {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const childId = localStorage.getItem("ActiveChild");

    if (!access || !childId) {
      errorMessage = "Détails d'authentification manquants. Veuillez vous reconnecter.";
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/bad-words/${childId}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        badWords = json.bad_words;
      } else {
        errorMessage = "Échec du chargement des mots interdits. Veuillez réessayer plus tard.";
      }
    } catch (error) {
      errorMessage = "Une erreur s'est produite lors de la récupération des données. Veuillez vérifier votre connexion.";
    } finally {
      isLoading = false;
    }
  }

  function confirmDelete(word) {
    wordToDelete = word;
    showDeleteConfirm = true;
  }

  async function deleteBadWord() {
    if (!wordToDelete) return;

    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const childId = localStorage.getItem("ActiveChild");

    if (!access || !childId || !wordToDelete) {
      errorMessage = "Impossible de supprimer le mot. Informations manquantes.";
      showDeleteConfirm = false;
      wordToDelete = null;
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/bad-words/${childId}/${encodeURIComponent(wordToDelete)}/`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });

      if (res.ok) {
        websocketStore.sendBadWords(childId)
        badWords = badWords.filter((w) => w !== wordToDelete);
        deletedWord = wordToDelete;
        errorMessage = '';
      } else {
        errorMessage = "Échec de la suppression du mot. Veuillez réessayer.";
      }
    } catch (error) {
      errorMessage = "Une erreur s'est produite lors de la suppression. Veuillez vérifier votre connexion.";
    } finally {
      showDeleteConfirm = false;
      wordToDelete = null;
    }
  }

  async function addBadWord() {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const childId = localStorage.getItem("ActiveChild");

    if (!access || !childId) {
      errorMessage = "Détails d'authentification manquants. Veuillez vous reconnecter.";
      return;
    }

    if (!newWord.trim()) {
      errorMessage = "Veuillez entrer un mot valide.";
      setTimeout(() => (errorMessage = ""), 3000);
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/bad-words/${childId}/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ "bad_words": [newWord.trim()] }),
      });

      if (res.ok) {
        badWords = [...badWords, newWord.trim()];
        newWord = '';
        websocketStore.sendBadWords(childId)
        errorMessage = "Mot ajouté avec succès.";
        setTimeout(() => (errorMessage = ""), 3000);
      } else {
        errorMessage = "Échec de l'ajout du mot. Veuillez réessayer.";
        setTimeout(() => (errorMessage = ""), 3000);
      }
    } catch (error) {
      errorMessage = "Une erreur s'est produite lors de l'ajout. Veuillez vérifier votre connexion.";
      setTimeout(() => (errorMessage = ""), 3000);
    }
  }

  onMount(async () => {
    await fetchBadWords();
    await tick();
  });

</script>

<svelte:head>
  <title>WHATSEYE | Mots clés observés</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />

</svelte:head>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-warning icon-gradient bg-amy-crisp"></i>
      Mots clés observés
    </div>
  </div>
  <div class="p-0 m-3 card-body d-flex flex-column">
    <div class="description">
      Cette fonctionnalité vous permet de gérer une liste de mots interdits pour votre enfant. Le système surveille en temps réel le contenu saisi par votre enfant (par exemple, messages ou recherches). Si un mot interdit est détecté, vous recevrez une notification pour vous alerter, vous permettant ainsi de superviser activement l'utilisation du langage inapproprié.
    </div>

    {#if errorMessage}
      <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert"> 
         {errorMessage}</div>
    {/if}

    <div class="form-container">
      <div class="form-group">
        <label for="new-word">Ajouter un mot interdit</label>
        <input
          id="new-word"
          type="text"
          bind:value={newWord}
          placeholder="Entrez un mot interdit"
          on:keydown={(e) => e.key === 'Enter' && addBadWord()}
          aria-label="Ajouter un mot interdit"
        />
      </div>
      <button class="btn btn-primary" on:click={addBadWord} aria-label="Ajouter le mot">Ajouter</button>
    </div>

    <div class="word-list" role="listbox" aria-label="Liste des mots interdits">
      {#if isLoading}
        <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Chargement en cours...
          </div>
      {:else if badWords.length === 0}
        <div class="placeholder" role="status" aria-live="polite">
          <i class="placeholder-icon lnr-warning"></i>
          <p>Aucun mot interdit pour le moment.<br />Ajoutez un mot ci-dessus pour commencer la surveillance.</p>
        </div>
      {:else}
        {#each badWords as word}
          <div
            class="word-item"
            role="option"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && confirmDelete(word)}
          >
            <div class="word-text">{word}</div>
            <i
              class="delete-icon lnr-trash"
              on:click|stopPropagation={() => confirmDelete(word)}
              on:keydown={(e) => e.key === 'Enter' && confirmDelete(word)}
              aria-label={`Supprimer le mot ${word}`}
              role="button"
              tabindex="0"
            ></i>
          </div>
        {/each}
      {/if}
    </div>

    {#if showDeleteConfirm}
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle">Confirmer la suppression</h3>
        <p id="confirmDesc">
          Êtes-vous sûr de vouloir supprimer le mot "{wordToDelete}" de la liste des mots interdits ?
        </p>
        <div class="buttons">
          <button
            class="cancel"
            on:click={() => {
              showDeleteConfirm = false;
              wordToDelete = null;
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </button>
          <button
            class="confirm"
            on:click={deleteBadWord}
            on:keydown={(e) => e.key === 'Enter' && deleteBadWord()}
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </button>
        </div>
      </div>
    {/if}

    {#if deletedWord}
      <div class="delete-dialog" role="alert">
        <h3>Mot supprimé</h3>
        <p>Le mot "{deletedWord}" a été supprimé.</p>
        <button
          on:click={() => (deletedWord = null)}
          on:keydown={(e) => e.key === 'Enter' && (deletedWord = null)}
          aria-label="Fermer la notification"
        >
          Fermer
        </button>
      </div>
    {/if}
  </div>
</div>
