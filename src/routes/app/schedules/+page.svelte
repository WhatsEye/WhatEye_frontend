<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { baseurl } from '../../../stores/functions';
  import { websocketStore } from '../../../stores/websockets';

  let schedules = [];
  let nextUrl = null;
  let previousUrl = null;
  let isLoading = false;
  let isAdding = false;
  let isDeleting = false;
  let errorMessage = '';
  let showAddForm = false;
  let showDeleteConfirm = false;
  let scheduleToDelete = null;
  let deletedSchedule = null;
  let loadMoreTrigger;
  let observer;
  let newSchedule = {
    name: '',
    start_time: '',
    end_time: '',
    start_date: '',
    end_date: '',
    days: []
  };

  // Define daysOfWeek with 0-based index for display, but we'll use 1-based for logic
  const daysOfWeek = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  async function fetchSchedules(url) {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const userId = localStorage.getItem("ActiveChild");

    if (!access || !userId) {
      errorMessage = "Détails d'authentification manquants. Veuillez vous reconnecter.";
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(url || `${baseurl}/control/schedules/${userId}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        // Convert 1-based days from backend to 0-based for display consistency
        schedules = [...schedules, ...json.results.map(schedule => ({
          ...schedule,
          days: schedule.days.map(d => d - 1) // Convert to 0-based for internal use
        }))];
        nextUrl = json.next;
        } else {
        errorMessage = "Échec du chargement des horaires. Veuillez réessayer plus tard.";
      }
    } catch (error) {
      errorMessage = "Une erreur s'est produite lors de la récupération des données. Veuillez vérifier votre connexion.";
    } finally {
      isLoading = false;
    }
  }

  function confirmDelete(schedule) {
    scheduleToDelete = schedule;
    showDeleteConfirm = true;
  }

  async function deleteSchedule() {
    if (!scheduleToDelete || isDeleting) return;

    isDeleting = true;
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const userId = localStorage.getItem("ActiveChild");

    if (!access || !userId || !scheduleToDelete?.id) {
      errorMessage = "Impossible de supprimer l'horaire. Informations manquantes.";
      showDeleteConfirm = false;
      scheduleToDelete = null;
      isDeleting = false;
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/schedules/${userId}/${scheduleToDelete.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ is_deleted: true }),
      });

      if (res.ok) {
        schedules = schedules.filter((sch) => sch.id !== scheduleToDelete.id);
        deletedSchedule = scheduleToDelete;
        setTimeout(()=>{deletedSchedule=null}, 3000)
        try {
          await websocketStore.deleteSchedule(userId, scheduleToDelete.id);
        } catch (wsError) {
          console.warn("WebSocket update failed:", wsError);
          errorMessage = "Horaire supprimé, mais mise à jour en temps réel échouée.";
          setTimeout(() => (errorMessage = ""), 3000);
        }
      } else {
        const errorText = await res.text();
        if (res.status === 401) {
          errorMessage = "Non autorisé. Veuillez vous reconnecter.";
        } else if (res.status === 404) {
          errorMessage = "Horaire introuvable.";
        } else {
          errorMessage = `Échec de la suppression: ${errorText || "Veuillez réessayer."}`;
        }
        setTimeout(() => (errorMessage = ""), 3000);
      }
    } catch (error) {
      console.error("Delete schedule error:", error);
      errorMessage = "Erreur de connexion. Veuillez vérifier votre réseau.";
      setTimeout(() => (errorMessage = ""), 3000);
    } finally {
      showDeleteConfirm = false;
      scheduleToDelete = null;
      isDeleting = false;
    }
  }

  async function addSchedule() {
    if (isAdding) return;
    isAdding = true;

    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const userId = localStorage.getItem("ActiveChild");

    if (!access || !userId) {
      errorMessage = "Détails d'authentification manquants. Veuillez vous reconnecter.";
      isAdding = false;
      return;
    }

    if (!newSchedule.name || !newSchedule.start_time || !newSchedule.end_time || !newSchedule.start_date || !newSchedule.end_date || newSchedule.days.length === 0) {
      errorMessage = "Veuillez remplir tous les champs obligatoires.";
      setTimeout(() => (errorMessage = ""), 3000);
      isAdding = false;
      return;
    }

    // Convert 0-based days to 1-based for backend
    const payload = {
      ...newSchedule,
      child: userId,
      days: newSchedule.days.map(d => d + 1) // Convert to 1-based for backend
    };
    console.log(payload)
    try {
      const res = await fetch(`${baseurl}/control/schedules/${userId}/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newSch = await res.json();
        // Convert 1-based days from backend to 0-based for internal use
        schedules = [{ ...newSch, days: newSch.days.map(d => d - 1) }, ...schedules];
        showAddForm = false;
        newSchedule = { name: '', start_time: '', end_time: '', start_date: '', end_date: '', days: [] };
        try {
          await websocketStore.addSchedule(userId, newSch.id);
        } catch (wsError) {
          errorMessage = "Horaire ajouté, mais échec de la mise à jour en temps réel.";
          setTimeout(() => (errorMessage = ""), 3000);
        }
        errorMessage = "Horaire ajouté avec succès.";
        setTimeout(() => (errorMessage = ""), 3000);
      } else {
        errorMessage = "Échec de l'ajout de l'horaire. Veuillez réessayer.";
        setTimeout(() => (errorMessage = ""), 3000);
      }
    } catch (error) {
      errorMessage = "Une erreur s'est produite lors de l'ajout. Veuillez vérifier votre connexion.";
      setTimeout(() => (errorMessage = ""), 3000);
    } finally {
      isAdding = false;
    }
  }

  function toggleDay(dayIndex) {
    // Work with 0-based index internally
    if (newSchedule.days.includes(dayIndex)) {
      newSchedule.days = newSchedule.days.filter(d => d !== dayIndex);
    } else {
      newSchedule.days = [...newSchedule.days, dayIndex];
    }
  }

  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  const debouncedFetch = debounce(fetchSchedules, 300);
  $: if (loadMoreTrigger && !observer) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextUrl && !isLoading) {
          fetchSchedules(nextUrl);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreTrigger);
  }
  onMount(async () => {
    await fetchSchedules();
    await tick();
  });

  onDestroy(() => {
    if (observer && loadMoreTrigger) {
      observer.unobserve(loadMoreTrigger);
    }
  });
</script>

<svelte:head>
  <title>WHATSEYE | Horaires</title>
  <link rel="stylesheet" href="/styles/dashboard.css">

</svelte:head>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-calendar-full icon-gradient bg-amy-crisp"></i>
      Horaires
    </div>
  </div>
  <div class="p-0 m-3 card-body d-flex flex-column">
    <div class="description">
      Cette fonctionnalité vous permet de gérer les horaires d'accès pour votre enfant. Définissez des périodes et des jours spécifiques pendant lesquels l'accès est autorisé ou restreint.
    </div>

    {#if errorMessage}
      <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert">{errorMessage}</div>
    {/if}

    <button class="btn btn-primary" on:click={() => showAddForm = !showAddForm} aria-label={showAddForm ? 'Annuler le formulaire' : 'Ajouter un horaire'}>
      {showAddForm ? 'Annuler' : 'Ajouter un horaire'}
    </button>

    {#if showAddForm}
      <div class="form-container">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Nom</label>
            <input 
              id="name" 
              type="text" 
              bind:value={newSchedule.name} 
              placeholder="Ex: École, Temps libre" 
              aria-label="Nom de l'horaire" 
              required 
            />
            <div class="helper-text">Donnez un nom descriptif à l'horaire.</div>
          </div>
          <div class="form-group">
            <label for="start_time">Heure de début</label>
            <input 
              id="start_time" 
              type="time" 
              bind:value={newSchedule.start_time}
              aria-label="Heure de début" 
              required 
            />
            <div class="helper-text">Heure à laquelle l'horaire commence.</div>
          </div>
          <div class="form-group">
            <label for="end_time">Heure de fin</label>
            <input 
              id="end_time" 
              type="time" 
              bind:value={newSchedule.end_time} 
              aria-label="Heure de fin" 
              required 
            />
            <div class="helper-text">Heure à laquelle l'horaire se termine.</div>
          </div>
          <div class="form-group">
            <label for="start_date">Date de début</label>
            <input 
              id="start_date" 
              type="date" 
              bind:value={newSchedule.start_date} 
              aria-label="Date de début" 
              required 
            />
            <div class="helper-text">Date de début de l'horaire.</div>
          </div>
          <div class="form-group">
            <label for="end_date">Date de fin</label>
            <input 
              id="end_date" 
              type="date" 
              bind:value={newSchedule.end_date} 
              aria-label="Date de fin" 
              required 
            />
            <div class="helper-text">Date de fin de l'horaire.</div>
          </div>
          <div class="form-group">
            <label>Jours</label>
            <div class="days-selection" role="group" aria-label="Sélection des jours">
              {#each daysOfWeek as day, index}
                <button
                  type="button"
                  class="day-button {newSchedule.days.includes(index) ? 'selected' : ''}"
                  on:click={() => toggleDay(index)}
                  on:keydown={(e) => e.key === 'Enter' && toggleDay(index)}
                  aria-label={`Sélectionner ${day}`}
                  aria-pressed={newSchedule.days.includes(index)}
                >
                  {day.slice(0, 3)}
                </button>
              {/each}
            </div>
            <div class="helper-text">Sélectionnez les jours où l'horaire s'applique.</div>
          </div>
        </div>
        <div class="form-actions">
          <button 
            class="btn btn-primary" 
            on:click={addSchedule} 
            disabled={isAdding} 
            aria-label="Ajouter l'horaire"
          >
            Ajouter
          </button>
          <button 
            class="btn btn-secondary" 
            on:click={() => showAddForm = false} 
            aria-label="Annuler le formulaire"
          >
            Annuler
          </button>
        </div>
      </div>
    {/if}

    <div class="schedule-list" role="listbox" aria-label="Liste des horaires">
      {#if isLoading && schedules.length === 0}
        <div class="loading" role="status">Chargement en cours...</div>
      {:else if schedules.length === 0}
        <div class="placeholder" role="status" aria-live="polite">
          <i class="placeholder-icon lnr-calendar-full"></i>
          <p>Aucun horaire pour le moment.<br />Ajoutez un horaire ci-dessus pour commencer.</p>
        </div>
      {:else}
        {#each schedules as schedule}
        <div
          class="schedule-item"
          role="option"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && confirmDelete(schedule)}
        >
  <div class="schedule-details">
    <div class="schedule-name">
      {schedule.name}
          {#if schedule.is_active_now}
            <span class="active-status" title="Cet horaire est actuellement actif"> (Actif)</span>
          {/if}
        </div>
        <div class="schedule-time">
          {schedule.start_time} - {schedule.end_time} ({schedule.start_date} au {schedule.end_date})
        </div>
        <div class="schedule-days">
          Jours:
          {#each schedule.days as d, i}
            <span class="day-tag">{daysOfWeek[d]}</span>
          {/each}
        </div>
      </div>
      <i
        class="delete-icon lnr-trash"
        on:click|stopPropagation={() => confirmDelete(schedule)}
        on:keydown={(e) => e.key === 'Enter' && confirmDelete(schedule)}
        aria-label={`Supprimer l'horaire ${schedule.name}`}
        role="button"
        tabindex="0"
      ></i>
    </div>


        {/each}
      {/if}
      {#if nextUrl}
        <div bind:this={loadMoreTrigger}></div>
      {/if}
    </div>

    {#if showDeleteConfirm}
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle">Confirmer la suppression</h3>
        <p id="confirmDesc">
          Êtes-vous sûr de vouloir supprimer l'horaire "{scheduleToDelete?.name}" du {scheduleToDelete?.start_date} ?
        </p>
        <div class="buttons">
          <button
            class="cancel"
            on:click={() => {
              showDeleteConfirm = false;
              scheduleToDelete = null;
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </button>
          <button
            class="confirm"
            on:click={deleteSchedule}
            on:keydown={(e) => e.key === 'Enter' && deleteSchedule()}
            disabled={isDeleting}
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </button>
        </div>
      </div>
    {/if}

    {#if deletedSchedule}
      <div class="delete-dialog fade" role="alert">
        <h3>Horaire supprimé</h3>
        <p>L'horaire "{deletedSchedule.name}" a été supprimé.</p>
        <button
          on:click={() => (deletedSchedule = null)}
          on:keydown={(e) => e.key === 'Enter' && (deletedSchedule = null)}
          aria-label="Fermer la notification"
        >
          Fermer
        </button>
      </div>
    {/if}
  </div>
</div>


