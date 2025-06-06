<svelte:head>
    <title>WHATSEYE | Notifications</title>
      <link rel="stylesheet" href="/styles/dashboard.css" />

</svelte:head>

<script>
  import { num_notif } from './../../../stores/functions.js';
  import { onMount } from 'svelte';
  import { baseurl, notificationsStore } from '../../../stores/functions';
  import { websocketStore } from '../../../stores/websockets';

  let isLoading = false;
  let errorMessage = '';
  let filterType = 'all';
  let filterReadStatus = 'all';
  let showDeleteConfirm = false;
  let notificationToDelete = null;
  let pageCount = 0;
  let currentPage = 1;
  let nextPage = null;
  let previousPage = null;

  // Notification types from Django model
  const notificationTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'message', label: 'Message' },
    { value: 'alert', label: 'Alerte' },
    { value: 'reminder', label: 'Rappel' },
    { value: 'info', label: 'Information' },
    { value: 'warning', label: 'Avertissement' },
  ];

  const readStatusOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'read', label: 'Lus' },
    { value: 'unread', label: 'Non lus' },
  ];

  // Fetch notifications for the given page
  async function fetchNotifications(pageUrl = `${baseurl}/control/notifications/${localStorage.getItem('ActiveChild')}/`) {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    const childId = localStorage.getItem('ActiveChild');

    if (!access || !childId) {
      errorMessage = 'Détails d’authentification manquants. Veuillez vous reconnecter.';
      isLoading = false;
      return;
    }

    const url = new URL(pageUrl, window.location.origin);
    if (filterType !== 'all') {
      url.searchParams.set('type', filterType);
    } else {
      url.searchParams.delete('type');
    }

    try {
      const res = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
      });

      if (res.ok) {
       
        const data = await res.json();
        notificationsStore.set(
          data.results.map((n) => ({
            ...n,
            is_read: n.is_read ?? false,
            is_deleted: n.is_deleted ?? false,
          })).filter((n) => !n.is_deleted)
        );
        pageCount = Math.ceil(data.count / 7);
        nextPage = data.next;
        previousPage = data.previous;
      } else {
        errorMessage = 'Échec du chargement des notifications. Veuillez réessayer plus tard.';
      }
    } catch (error) {
      errorMessage = 'Une erreur s’est produite lors de la récupération des données. Veuillez vérifier votre connexion.';
    } finally {
      isLoading = false;
    }
  }

  // Mark all notifications as read
  async function markAllAsRead() {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    const childId = localStorage.getItem('ActiveChild');
    const apiUrl = `https://127.0.0.1/api/control/notifications/make/read/${childId}/`;

    if (!access || !childId) {
      errorMessage = 'Détails d’authentification manquants. Veuillez vous reconnecter.';
      return;
    }

    try {
      isLoading = true;
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
      });

      if (res.ok) {
         num_notif.update(current => ({
          ...current,
          [childId]: 0
        }));
        notificationsStore.update((notifs) =>
          notifs.map((n) => ({ ...n, is_read: true }))
        );
        errorMessage = 'Toutes les notifications ont été marquées comme lues avec succès.';
        setTimeout(() => (errorMessage = ''), 3000);
        //await fetchNotifications(); // Refresh notifications to ensure consistency
      } else {
        errorMessage = 'Échec du marquage des notifications comme lues. Veuillez réessayer.';
        setTimeout(() => (errorMessage = ''), 3000);
      }
    } catch (error) {
      errorMessage = 'Une erreur s’est produite. Veuillez vérifier votre connexion.';
      setTimeout(() => (errorMessage = ''), 3000);
    } finally {
      isLoading = false;
    }
  }

  // Navigate to a specific page
  async function goToPage(page) {
    if (page === 'next' && nextPage) {
      await fetchNotifications(nextPage);
      currentPage += 1;
    } else if (page === 'previous' && previousPage) {
      await fetchNotifications(previousPage);
      currentPage -= 1;
    }
  }


  // Confirm deletion of a notification
  function confirmDelete(notification) {
    notificationToDelete = notification;
    showDeleteConfirm = true;
  }

  // Delete a notification
  async function deleteNotification() {
    if (!notificationToDelete) return;

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    const childId = localStorage.getItem('ActiveChild');

    if (!access || !childId || !notificationToDelete) {
      errorMessage = 'Impossible de supprimer la notification. Informations manquantes.';
      showDeleteConfirm = false;
      notificationToDelete = null;
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/notifications/${childId}/${notificationToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
      });

      if (res.ok) {
         num_notif.update(current => ({
          ...current,
          [childId]: (current[childId] || 0) - 1
        }));
        
        notificationsStore.update((notifs) => notifs.filter((n) => n.id !== notificationToDelete.id));
        errorMessage = 'Notification supprimée avec succès.';
        setTimeout(() => (errorMessage = ''), 3000);
      } else {
        errorMessage = 'Échec de la suppression de la notification. Veuillez réessayer.';
        setTimeout(() => (errorMessage = ''), 3000);
      }
    } catch (error) {
      errorMessage = 'Une erreur s’est produite lors de la suppression. Veuillez vérifier votre connexion.';
      setTimeout(() => (errorMessage = ''), 3000);
    } finally {
      showDeleteConfirm = false;
      notificationToDelete = null;
    }
  }

  // Filter notifications based on read status
  $: filteredNotifications = $notificationsStore.filter((n) => {
    const matchesReadStatus =
      filterReadStatus === 'all' ||
      (filterReadStatus === 'read' && n.is_read) ||
      (filterReadStatus === 'unread' && !n.is_read);
    return matchesReadStatus;
  });

  // Refetch notifications when filterType changes
  $: if (filterType) {
    fetchNotifications(`${baseurl}/control/notifications/${localStorage.getItem('ActiveChild')}/`);
    currentPage = 1;
  }

  onMount(async () => {
    await fetchNotifications();
  });
</script>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-alarm icon-gradient bg-amy-crisp"></i>
      Notifications
    </div>
  </div>
  <div class="p-0 m-3 card-body d-flex flex-column">
    <!-- Description -->
    <div class="description mb-4">
      Gérer les notifications pour votre enfant. Filtrez par type (message, alerte, rappel, information, avertissement) ou statut (lus, non lus) et marquez ou supprimez les notifications pour rester à jour.
    </div>

    <!-- Error/Success Message -->
    {#if errorMessage}
      <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert">
        {errorMessage}
      </div>
    {/if}

    <!-- Filters and Mark All as Read Button -->
  <div style="display: flex; gap: 1rem;">
    <div class="form-container mb-4" style="flex: 4;">
      <div class="form-group">
        <label for="filter-type">Filtrer par type</label>
        <select
          id="filter-type"
          bind:value={filterType}
          aria-label="Filtrer les notifications par type"
        >
          {#each notificationTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </select>
      </div>
      <div class="form-group">
        <label for="filter-read-status">Filtrer par statut</label>
        <select
          id="filter-read-status"
          bind:value={filterReadStatus}
          aria-label="Filtrer les notifications par statut de lecture"
        >
          {#each readStatusOptions as status}
            <option value={status.value}>{status.label}</option>
          {/each}
        </select>
      </div>
     
    </div>
     <div class="form-group">
        <button
          class="btn btn-primary"
          on:click={markAllAsRead}
          disabled={isLoading || filteredNotifications.every(n => n.is_read)}
          aria-label="Marquer toutes les notifications comme lues "
        >
          Marquer tout comme lu
        </button>
      </div>
  </div>

    <!-- Notification List -->
    <div class="notification-list" role="listbox" aria-label="Liste des notifications">
      {#if isLoading}
        <div class="loading" role="status" aria-live="polite">
          <div class="spinner"></div>
          Chargement en cours...
        </div>
      {:else if filteredNotifications.length === 0}
        <div class="placeholder" role="status" aria-live="polite">
          <i class="placeholder-icon lnr-alarm"></i>
          <p>Aucune notification trouvée pour les filtres sélectionnés.</p>
        </div>
      {:else}
        {#each filteredNotifications as notification}
          <div
            class="notification-item {notification.is_read ? 'read' : 'unread'}"
            role="option"
            tabindex="0"
          >
            <div class="notification-content">
              <h4 class="notification-title">{notification.title}</h4>
              <p class="notification-text">{notification.content}</p>
              <p class="notification-meta">
                {new Date(notification.timestamp).toLocaleString('fr-FR')} • {notificationTypes.find(t => t.value === notification.type)?.label || notification.type}
              </p>
            </div>
            <div class="notification-actions">
              <i
                class="action-icon lnr-checkmark-circle"
                role="button"
                tabindex="0"
              ></i>
              <i
                class="action-icon lnr-trash"
                on:click|stopPropagation={() => confirmDelete(notification)}
                on:keydown={(e) => e.key === 'Enter' && confirmDelete(notification)}
                aria-label={`Supprimer la notification ${notification.title}`}
                role="button"
                tabindex="0"
              ></i>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Pagination Controls -->
    {#if pageCount > 1}
      <div class="pagination mt-4 flex justify-between items-center">
        <button
          class="btn btn-primary"
          on:click={() => goToPage('previous')}
          disabled={!previousPage}
          aria-label="Page précédente"
        >
          Précédent
        </button>
        <span class="text-gray-600">Page {currentPage} de {pageCount}</span>
        <button
          class="btn btn-primary"
          on:click={() => goToPage('next')}
          disabled={!nextPage}
          aria-label="Page suivante"
        >
          Suivant
        </button>
      </div>
    {/if}

    <!-- Delete Confirmation Dialog -->
    {#if showDeleteConfirm}
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle">Confirmer la suppression</h3>
        <p id="confirmDesc">
          Êtes-vous sûr de vouloir supprimer la notification "{notificationToDelete?.title}" ?
        </p>
        <div class="buttons">
          <button
            class="cancel"
            on:click={() => {
              showDeleteConfirm = false;
              notificationToDelete = null;
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </button>
          <button
            class="confirm"
            on:click={deleteNotification}
            on:keydown={(e) => e.key === 'Enter' && deleteNotification()}
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
 
  .form-container {
    display: flex;
    gap: 1rem;
    
    border: 0.01rem solid #ccc;
  }
  .form-group {
    
    flex: 1;
    flex-shrink: 1;
    margin:  auto 0 ;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: #fff;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .form-group select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    background-color: #fff;
    transition: background-color 0.3s ease;
  }

  .notification-item.read {
    background-color: #f9fafb;
  }

  .notification-item.unread {
    background-color: #e0f2fe;
  }

  .notification-content {
    flex: 1;
    overflow: hidden;
  }

  .notification-title {
    font-size: 1rem;
    font-weight: 500;
    color: #1f2937;
  }

  .notification-text {
    font-size: 0.875rem;
    color: #4b5563;
    margin: 0.25rem 0;
    white-space: pre-wrap;
        text-overflow: ellipsis;

  }

  .notification-meta {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .notification-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-icon {
    cursor: pointer;
    font-size: 1.25rem;
    color: #6b7280;
    transition: color 0.3s ease;
  }

  .action-icon:hover {
    color: #2563eb;
  }

  .action-icon:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }


  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }

  .btn-primary {
    padding: 0.5rem 1rem;
    background-color: #2563eb;
    color: white;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 0.3s ease;
  }

  .btn-primary:hover {
    background-color: #1d4ed8;
  }

  .btn-primary:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
  }
</style>



