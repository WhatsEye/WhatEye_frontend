<svelte:head>
    <title>WHATSEYE | Contacts</title>
      <link rel="stylesheet" href="/styles/dashboard.css" />

</svelte:head>

<script>
    import { onMount, onDestroy } from 'svelte';
    import { contactsStore, contactsArrivedStore } from '../../../stores/functions';
    import { websocketStore } from '../../../stores/websockets';

    let childId;
    let errorMessage = '';
    let isLoading = false;

    // Create grouped contacts derived store
    $: groupedContacts = $contactsStore 
        ? $contactsStore
            .filter(contact => contact && (contact.name || '').trim()) // Ensure valid contact with non-empty name
            .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' })) // French locale for sorting
            .reduce((acc, contact) => {
                const firstLetter = (contact.name || '').trim()[0]?.toUpperCase() || '#';
                if (!acc[firstLetter]) {
                    acc[firstLetter] = [];
                }
                acc[firstLetter].push(contact);
                return acc;
            }, {})
        : {};

    // Handle contact arrival from WebSocket
    $: if ($contactsArrivedStore && $contactsStore) {
        isLoading = false;
        errorMessage = 'Contacts reçus avec succès.';
        contactsArrivedStore.set(false);
        setTimeout(() => (errorMessage = ''), 5000);
    }

    // Centralized error handling
    function handleError(message, duration = 5000) {
        errorMessage = message;
        isLoading = false;
        setTimeout(() => (errorMessage = ''), duration);
    }

    // Initialize component
    onMount(async () => {
        childId = localStorage.getItem('ActiveChild');
        if (!childId) {
            handleError('Aucun enfant sélectionné. Veuillez choisir un profil.');
            return;
        }
        isLoading = true;
        try {
            await websocketStore.requestContact(childId);
        } catch (error) {
            handleError(`Erreur lors de l'initialisation des contacts: ${error.message || 'Erreur inconnue'}`);
        }
    });

    // Cleanup on component destroy
    onDestroy(() => {
        isLoading = false;
        contactsArrivedStore.set(false);
    });
</script>


<div class="card">
     <div class="card-header-tab card-header">
        <div class="card-header-title font-size-lg text-capitalize fw-normal ">
            <i class="header-icon lnr-users icon-gradient bg-amy-crisp"></i> Contacts
        </div>
    </div>
    <div class="card-body d-flex flex-column">
        {#if errorMessage}
            <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert" aria-live="assertive">
                {errorMessage}
            </div>
        {/if}
        {#if isLoading}
            
            <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Chargement en contacts...
          </div>
        
        {:else}
            <div class="contact-list" role="region" aria-label="Liste des contacts">
                {#if Object.keys(groupedContacts).length > 0}
                    {#each Object.entries(groupedContacts) as [letter, contacts]}
                        <div class="letter-group" role="group" aria-label={`Groupe de contacts commençant par ${letter}`}>{letter}</div>
                        {#each contacts as contact}
                            <div class="contact-item" tabindex="0" role="button" aria-label={`Contact ${contact.name || 'inconnu'}`}>
                                {#if contact.icon}
                                    <img src={contact.icon} alt={`Icône de ${contact.name || 'contact inconnu'}`} class="contact-icon" />
                                {:else}
                                    <div class="contact-icon" aria-label={`Initiale ${contact.name ? contact.name[0] : '?'}`}>
                                        {contact.name ? contact.name[0] : '?'}
                                        {#if contact.status}
                                            <div class="status-indicator {contact.status === 'online' ? '' : 'offline'}" aria-hidden="true"></div>
                                        {/if}
                                    </div>
                                {/if}
                                <div class="contact-details">
                                    <div class="contact-name">{contact.name || 'Nom inconnu'}</div>
                                    <div class="contact-about">{contact.about || 'Aucune description'}</div>
                                </div>
                            </div>
                        {/each}
                    {/each}
                {:else}
                <div class="placeholder" role="status" aria-live="polite" style="height: 220px;">
                    <i class="placeholder-icon lnr-users "></i>
                    <p>Aucun contact disponible.<br /></p>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>