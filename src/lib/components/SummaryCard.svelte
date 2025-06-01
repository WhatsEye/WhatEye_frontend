<svelte:head>
    <title>WHATSEYE | Notifications</title>
    <link rel="stylesheet" href="/styles/dashboard.css" />
</svelte:head>

<script>
  import { baseurl, notificationsStore } from '../../stores/functions.js';
    import { websocketStore } from './../../stores/websockets.js';
    import { onMount } from 'svelte';
    let isLoading = false;
    let errorMessage = '';
    let filterType = 'all'; // Added missing filterType variable
    let pageCount = 0; // Added missing pageCount variable
    let nextPage = null; // Added missing nextPage variable
    let previousPage = null; // Added missing previousPage variable

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
        try {
            const res = await fetch(pageUrl, {
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
    
    <div class="g-0 row">
        <div class="p-0 m-3 card-body d-flex flex-column">
            <div class="notification-list" role="listbox" aria-label="Liste des notifications">
                {#if isLoading}
                    <div class="loading" role="status" aria-live="polite">
                        <div class="spinner"></div>
                        Chargement en cours...
                    </div>
                {:else if errorMessage}
                    <div class="error" role="alert">{errorMessage}</div>
                {:else}
                    {#each $notificationsStore as notification}
                        <div
                            class="notification-item {notification.is_read ? 'read' : 'unread'}"
                            role="option"
                            tabindex="0"
                        >
                            <div class="notification-content">
                                <h4 class="notification-title">{notification.title}</h4>
                                <p class="notification-text">{notification.content}</p>
                                <p class="notification-meta">
                                    {new Date(notification.timestamp).toLocaleString('fr-FR')} - {notification.type}
                                </p>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
        <div class="text-center d-block p-3 card-footer">
            <a href="/app/notifications">
                <button class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg">
                    <span class="me-2 opacity-7">
                        <i class="pe-7s-bell"></i>
                    </span>
                    <span class="me-1">Voir les notifications</span>
                </button>
            </a>
        </div>
    </div>
</div>

<style>
    .notification-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        height: 200px;
        overflow-y: scroll;
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
    }

    .notification-meta {
        font-size: 0.75rem;
        color: #6b7280;
    }

    .error {
        color: #dc2626;
        padding: 1rem;
        text-align: center;
    }
</style>