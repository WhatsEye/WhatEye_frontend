<script>
  import { onMount, onDestroy } from 'svelte';
  import { baseurl } from '../../../stores/functions';

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

  const defaultLat = 36.708636;
  const defaultLong = 3.406468;
  const defaultZoom = 50;

  async function fetchData(url) {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const userId = localStorage.getItem("ActiveChild");
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");

    if (!access || !userId) {
      errorMessage = "Détails d'authentification manquants. Veuillez vous reconnecter.";
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(url || `${baseurl}/control/child-locations/${userId}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        locations = [...locations, ...json.results];
        nextUrl = json.next;

        if (json.results.length > 0 && map && !selectedLocation) {
          showLocationOnMap(json.results[0], false);
        }
      } else {
        errorMessage = "Échec du chargement des données de localisation. Veuillez réessayer plus tard.";
      }
    } catch (error) {
      errorMessage = "Une erreur s'est produite lors de la récupération des données. Veuillez vérifier votre connexion.";
    } finally {
      isLoading = false;
    }
  }

  function showLocationOnMap(location, isSelected = false) {
    if (!map) return;

    map.setView([parseFloat(location.latitude), parseFloat(location.longitude)], defaultZoom);

    if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }

    currentMarker = L.marker([parseFloat(location.latitude), parseFloat(location.longitude)])
      .addTo(map)
      .bindPopup(`Localisation à ${new Date(location.timestamp).toLocaleString('fr-FR')}`);

    if (isSelected) {
      selectedLocation = location;
      currentMarker.openPopup();
    }
  }

  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  const debouncedFetch = debounce(fetchData, 300);

  onMount(async () => {
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    map = L.map(mapContainer, {
      attributionControl: false,
      zoomControl: true
    }).setView([defaultLat, defaultLong], defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxzoom: defaultZoom,
      minZoom: 3,
      trackResize: true,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs'
    }).addTo(map);

    map.invalidateSize();
    await fetchData();
  });

  $: if (loadMoreTrigger && !observer) {
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

  onDestroy(() => {
    if (observer && loadMoreTrigger) {
      observer.unobserve(loadMoreTrigger);
    }
    if (map) {
      map.remove();
    }
  });
</script>

<svelte:head>
  <title>WHATSEYE | Localisation</title>
  <link rel="stylesheet" href="/styles/dashboard.css">
  <style>
    .map {
      height: 500px;
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .location-list {
      max-height: 300px;
      overflow-y: auto;
      scroll-behavior: smooth;
      border-radius: 8px;
      padding: 8px;
      background: #fafafa;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-top: 16px;
    }
    .location-item {
      display: flex;
      align-items: center;
      padding: 10px;
      margin: 4px 0;
      border-radius: 6px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .location-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    }
    .location-item.selected {
      background: #007bff;
      color: #fff;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    }
    .location-item.selected .icon,
    .location-item.selected .location-details,
    .location-item.selected .location-timestamp,
    .location-item.selected .location-coordinates,
    .location-item.selected .location-accuracy {
      color: #fff;
    }
    .location-item .icon {
      margin-right: 8px;
      color: #666;
    }
    .location-item:hover .icon {
      color: #007bff;
    }
    .location-item.selected:hover .icon {
      color: #fff;
    }
    .location-details {
      flex-grow: 1;
    }
    .location-timestamp {
      font-weight: bold;
      font-size: 0.95em;
    }
    .location-coordinates {
      color: #666;
      font-size: 0.9em;
    }
    .location-accuracy {
      color: #888;
      font-size: 0.85em;
    }
    .loading {
      text-align: center;
      padding: 10px;
      color: #666;
    }
    .error {
      text-align: center;
      padding: 10px;
      color: #d32f2f;
      font-weight: bold;
    }
  </style>
</svelte:head>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-map icon-gradient bg-amy-crisp"></i>
      Localisation
    </div>
  </div>
  <div class="p-0 card-body d-flex flex-column">
    {#if errorMessage}
      <div class="error">{errorMessage}</div>
    {/if}

    <div class="map" bind:this={mapContainer}></div>

    <div
      class="location-list"
      role="listbox"
      tabindex="-1"
      aria-label="Liste des localisations précédentes"
      on:mouseleave={() => {
        if (selectedLocation) {
          showLocationOnMap(selectedLocation, true);
        } else if (locations.length > 0) {
          showLocationOnMap(locations[0], false);
        }
      }}
    >
      {#each locations as location}
        <div 
          class="location-item" 
          class:selected={selectedLocation === location}
          on:click={() => showLocationOnMap(location, true)}
          on:mouseenter={() => {
            if (!selectedLocation) showLocationOnMap(location, false);
          }}
          on:keypress={()=>{}}
          role="option"
          aria-selected={selectedLocation === location}
          tabindex="0"
        >
          <i class="icon lnr-location"></i>
          <div class="location-details">
            <div class="location-timestamp">{new Date(location.timestamp).toLocaleString('fr-FR')}</div>
            <div class="location-coordinates">Lat: {location.latitude}, Long: {location.longitude}</div>
            <div class="location-accuracy">Précision: {location.accuracy} m</div>
          </div>
        </div>
      {/each}

      {#if isLoading}
        <div class="loading">Chargement en cours...</div>
      {/if}
      <div bind:this={loadMoreTrigger}></div>
    </div>
  </div>

  <div class="text-center d-block p-3 card-footer">
    <button class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg">
      <span class="me-1">obtenir l'emplacement</span>
    </button>
  </div>
</div>
