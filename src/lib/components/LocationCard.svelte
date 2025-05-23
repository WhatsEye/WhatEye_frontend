<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { newLocation, errorLocation } from '../../stores/functions';
  import { websocketStore } from '../../stores/websockets';

  let mapContainer;
  let map;
  let currentMarker = null;
  let isLoading = false;
  let errorMessage = '';
  let userId;

  const defaultLat = 36.6;
  const defaultLong = 3.0;
  const defaultZoom = 10; // Adjusted to a reasonable street-level zoom

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

    showLocationOnMap(normalizedLocation);
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
    setTimeout(() => (errorMessage = ''), 10000);
  }

  // Display a location on the map
  function showLocationOnMap(location) {
    if (!map || !location.latitude || !location.longitude) {
      handleError('Carte ou coordonnées non disponibles.');
      return;
    }

    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      handleError('Coordonnées invalides pour cette localisation.');
      return;
    }

    // Use defaultZoom or a fallback if needed
    map.setView([lat, lng], defaultZoom);

    if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }

    currentMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`Localisation à ${new Date(location.timestamp).toLocaleString('fr-FR')}`)
      .openPopup();
  }

  // Centralized error handling
  function handleError(message, duration = 5000) {
    errorMessage = message;
    isLoading = false;
    setTimeout(() => (errorMessage = ''), duration);
  }

  // Request location via WebSocket
  async function findMyKid() {
    if (!userId) {
      handleError('Aucun enfant sélectionné. Veuillez choisir un profil.');
      return;
    }

    try {
      isLoading = true;
      errorMessage = '';
      setTimeout(() => {
        if (isLoading) {
          handleError('Délai d’attente dépassé pour la réponse de localisation.');
        }
      }, 15000);
      await websocketStore.getLocation(userId);
    } catch (error) {
      handleError(`Erreur lors de la recherche de localisation: ${error.message}`);
    }
  }

  // Initialize the map
  onMount(async () => {
    userId = localStorage.getItem('ActiveChild');
    if (!userId) {
      handleError('Aucun enfant sélectionné. Veuillez choisir un profil.');
      return;
    }

    try {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      await tick();

      map = L.map(mapContainer, {
        attributionControl: false,
        zoomControl: true, // Enable zoom controls
        minZoom: 3, // Allow zooming out to a global view
        maxZoom: 19 // Align with OSM max zoom
      }).setView([defaultLat, defaultLong], defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, // Support OSM's maximum zoom level
        minZoom: 3, // Allow zooming out
        trackResize: true,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Ensure map renders correctly after initialization
      await tick();
      map.invalidateSize();
    } catch (error) {
      handleError(`Erreur lors de l'initialisation de la carte: ${error.message}`);
    }
  });

  // Cleanup on component destroy
  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
    if (currentMarker) {
      currentMarker = null;
    }
  });
</script>

<style>
  .map {
    height: 400px;
    width: 100%;
  }
  .alert {
    margin: 1rem;
    padding: 1rem;
    border-radius: 4px;
    font-size: 1rem;
  }
  .alert-success {
    background-color: #d4edda;
    color: #155724;
  }
  .alert-error {
    background-color: #f8d7da;
    color: #721c24;
  }
</style>

<div class="card-hover-shadow-2x mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-map icon-gradient bg-amy-crisp"></i>
      Location
    </div>
  </div>
  <div class="p-0 card-body d-flex flex-column">
    {#if errorMessage}
      <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert" aria-live="assertive">
        {errorMessage}
      </div>
    {/if}
    <div
      class="map"
      bind:this={mapContainer}
      role="region"
      aria-label="Carte de localisation"
    ></div>
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