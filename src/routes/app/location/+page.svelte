<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { baseurl, errorLocation, newLocation } from '../../../stores/functions';
  import { websocketStore } from '../../../stores/websockets';

  let locations = [];
  let nextUrl = null;
  let isLoading = false;
  let errorMessage = '';
  let loadMoreTrigger;
  let observer;
  let map;
  let mapContainer;
  let currentMarker = null;
  let selectedLocation = null;
  let showDeleteConfirm = false;
  let locationToDelete = null;
  let deletedLocation = null;
  let userId ;
  let locationList; // Reference to the location-list container

  // Handle new location from WebSocket
  $: if ($newLocation && Object.keys($newLocation).length > 0) {
    isLoading = false;
    const normalizedLocation = {
      id: $newLocation.id || `loc-${crypto.randomUUID()}`, // Use UUID for unique temporary ID
      latitude: $newLocation.lat,
      longitude: $newLocation.lng,
      accuracy: $newLocation.accuracy,
      timestamp: $newLocation.timestamp
    };
    errorMessage = 'Localisation reçue avec succès.';
    setTimeout(() => (errorMessage = ''), 5000);

    // Preserve scroll position before updating
    let scrollTop = locationList ? locationList.scrollTop : 0;
    locations = [normalizedLocation, ...locations];
    // Restore scroll position after DOM update
    tick().then(() => {
      if (locationList && scrollTop > 0) {
        locationList.scrollTop = scrollTop;
      }
    });

    showLocationOnMap(normalizedLocation, true);
    newLocation.set({});
  }

  // Handle location errors
  $: if ($errorLocation) {
    isLoading = false;
    if ($errorLocation === 'GPS_OFF') {
      errorMessage = 'Le GPS est désactivé. Veuillez l\'activer pour continuer.';
    } else if ($errorLocation === 'NO_PERMISSION') {
      errorMessage = "Les permissions de localisation sont refusées. Veuillez autoriser l'accès.";
    }
    errorLocation.set('');
    setTimeout(() => (errorMessage = ''), 5000);
  }

  const defaultLat = 0;
  const defaultLong = 0;
  const defaultZoom = 15;

  // Fetch location data from API
  async function fetchData(url) {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access || !userId) {
      errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      isLoading = false;
      return;
    }

    try {
      // Preserve scroll position
      let scrollTop = locationList ? locationList.scrollTop : 0;

      const res = await fetch(url || `${baseurl}/control/child-locations/${userId}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`
        }
      });

      if (res.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        isLoading = false;
        return;
      }

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const json = await res.json();
      locations = [...locations, ...json.results];
      nextUrl = json.next;

      // Restore scroll position after DOM update
      await tick();
      if (locationList && scrollTop > 0) {
        locationList.scrollTop = scrollTop;
      }

      if (json.results.length > 0 && map && !selectedLocation) {
        showLocationOnMap(json.results[0], false);
      }
    } catch (error) {
      errorMessage = `Erreur lors de la récupération des données: ${error.message}`;
    } finally {
      isLoading = false;
    }
  }

  // Confirm deletion of a location
  function confirmDelete(location) {
    locationToDelete = location;
    showDeleteConfirm = true;
  }

  // Delete a location via API
  async function deleteLocation() {
    if (!locationToDelete) return;

    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access || !userId || !locationToDelete.id) {
      errorMessage = 'Informations manquantes pour la suppression.';
      showDeleteConfirm = false;
      locationToDelete = null;
      return;
    }

    try {
      const res = await fetch(`${baseurl}/control/child-locations/${userId}/${locationToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`
        }
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      locations = locations.filter((loc) => loc.id !== locationToDelete.id);
      deletedLocation = locationToDelete;

      if (selectedLocation && selectedLocation.id === locationToDelete.id) {
        selectedLocation = null;
        if (locations.length > 0) {
          showLocationOnMap(locations[0], false);
        } else if (map) {
          map.setView([defaultLat, defaultLong], defaultZoom);
          if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
          }
        }
      }
    } catch (error) {
      errorMessage = `Erreur lors de la suppression: ${error.message}`;
    } finally {
      showDeleteConfirm = false;
      locationToDelete = null;
    }
  }

  // Display a location on the map
  function showLocationOnMap(location, isSelected = false) {
    if (!map || !location.latitude || !location.longitude) return;

    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      errorMessage = 'Coordonnées invalides pour cette localisation.';
      return;
    }

    map.setView([lat, lng], defaultZoom);

    if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }

    currentMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`Localisation à ${new Date(location.timestamp).toLocaleString('fr-FR')}`);

    if (isSelected) {
      selectedLocation = location;
      currentMarker.openPopup();
    }
  }

  // Debounce function for API calls
  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  const debouncedFetch = debounce(fetchData, 300);

  // Retry failed request
  function retryFetch() {
    fetchData();
  }

  // Initialize the map and fetch data
  onMount(async () => {
    userId = localStorage.getItem('ActiveChild');
    try {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      await tick();

      map = L.map(mapContainer, {
        attributionControl: false,
        zoomControl: true
      }).setView([defaultLat, defaultLong], defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        minZoom: 3,
        trackResize: true,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs'
      }).addTo(map);

      await fetchData();
    } catch (error) {
      errorMessage = `Erreur lors de l'initialisation de la carte: ${error.message}`;
    }
  });
$:   if (loadMoreTrigger) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && nextUrl && !isLoading) {
              debouncedFetch(nextUrl);
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(loadMoreTrigger);
      }
  // Request location via WebSocket
  async function findMyKid() {
    try {
      isLoading = true;
      errorMessage = '';
      setTimeout(() => {
        if (isLoading) {
          errorMessage = 'Délai d’attente dépassé pour la réponse de localisation.';
          isLoading = false;
        }
      }, 15000);
      await websocketStore.getLocation(userId);
    } catch (error) {
      errorMessage = `Erreur lors de la recherche de localisation: ${error.message}`;
      isLoading = false;
    }
  }

  // Cleanup on component destroy
  onDestroy(() => {
    if (observer && loadMoreTrigger) {
      observer.unobserve(loadMoreTrigger);
      observer.disconnect();
    }
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<svelte:head>
  <title>WHATSEYE | Localisation</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />
</svelte:head>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-map icon-gradient bg-amy-crisp"></i>
      Localisation
    </div>
  </div>
  <div class=" m-3">
  {#if errorMessage}
      <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert"> 
         {errorMessage}</div>
    {/if}
  </div>
  <div class="p-0 card-body d-flex flex-column">
    <!-- {#if isLoading && locations.length === 0}
      <div class="loading" role="status">Chargement initial...</div>
    {/if} -->
    <div
      class="map2"
      bind:this={mapContainer}
      role="region"
      aria-label="Carte des localisations"
      style="height: 400px; width: 100%;"
    ></div>
    <div
      class="location-list"
      bind:this={locationList}
      role="listbox"
      aria-label="Liste des localisations précédentes"
    >
     {#if isLoading && locations.length === 0}
          <div class="loading" role="status">
            <div class="spinner"></div>
            Chargement en cours...
          </div>
      {:else if locations.length === 0 && !isLoading}
        <div class="placeholder" role="status" aria-live="polite">
          <i class="placeholder-icon lnr-map"></i>
          <p>Aucune localisation pour le moment.<br />Utilisez ‘Trouve-moi’ pour commencer à suivre.</p>
        </div>
      {:else}
        {#each locations as location (location.id)}
          <div
            class="location-item {selectedLocation === location ? 'selected' : ''}"
            on:click={() => showLocationOnMap(location, true)}
            on:keydown={(e) => e.key === 'Enter' && showLocationOnMap(location, true)}
            role="option"
            aria-selected={selectedLocation === location}
            tabindex="0"
          >
            <i class="icon lnr-location" aria-hidden="true"></i>
            <div class="location-details">
              <div class="location-timestamp">
                {new Date(location.timestamp).toLocaleString('fr-FR')}
              </div>
              <div class="location-coordinates">Lat: {location.latitude}, Long: {location.longitude}</div>
              <div class="location-accuracy">Précision: {location.accuracy} m</div>
            </div>
            <i
              class="delete-icon lnr-trash"
              on:click|stopPropagation={() => confirmDelete(location)}
              on:keydown={(e) => e.key === 'Enter' && confirmDelete(location)}
              aria-label={`Supprimer la localisation du ${new Date(location.timestamp).toLocaleString('fr-FR')}`}
              role="button"
              tabindex="0"
            ></i>
          </div>
        {/each}
        {#if nextUrl}
          <div bind:this={loadMoreTrigger} aria-hidden="true"></div>
          {#if isLoading}
            <div class="loading" role="status">Chargement des données supplémentaires...</div>
          {/if}
        {/if}
      {/if}
    </div>
    {#if showDeleteConfirm}
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle">Confirmer la suppression</h3>
        <p id="confirmDesc">
          Êtes-vous sûr de vouloir supprimer la localisation du
          {locationToDelete ? new Date(locationToDelete.timestamp).toLocaleString('fr-FR') : ''} ?
        </p>
        <div class="buttons">
          <button
            class="cancel"
            on:click={() => {
              showDeleteConfirm = false;
              locationToDelete = null;
            }}
            on:keydown={(e) => e.key === 'Enter' && (showDeleteConfirm = false) && (locationToDelete = null)}
          >
            Annuler
          </button>
          <button
            class="confirm"
            on:click={deleteLocation}
            on:keydown={(e) => e.key === 'Enter' && deleteLocation()}
          >
            Supprimer
          </button>
        </div>
      </div>
    {/if}
    {#if deletedLocation}
      <div class="delete-dialog" role="alert">
        <h3>Localisation supprimée</h3>
        <p>La localisation à {new Date(deletedLocation.timestamp).toLocaleString('fr-FR')} a été supprimée.</p>
        <button
          on:click={() => (deletedLocation = null)}
          on:keydown={(e) => e.key === 'Enter' && (deletedLocation = null)}
        >
          Fermer
        </button>
      </div>
    {/if}
  </div>
  <div class="text-center d-block p-3 card-footer">
    <button
      class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg"
      aria-label="Trouver ma position"
      disabled={isLoading}
      on:click={findMyKid}
    >
      <span class="me-1">Trouvez mon enfant</span>
    </button>
  </div>
</div>
