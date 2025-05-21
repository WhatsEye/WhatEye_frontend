<script>
  import { onMount } from 'svelte';

  let mapContainer;
  const lat = 30.0;
  const long = 3.0;
  const zoom = 5;

  onMount(async () => {
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    const map = L.map(mapContainer, {
      attributionControl: false,
      zoomControl: false
    }).setView([lat, long], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 5,
      minZoom: 5,
      trackResize: true,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.zoomControl.remove();
    map.invalidateSize();
  });
</script>

<style>
  .map {
    height: 400px;
    width: 100%;
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
    <div class="map" bind:this={mapContainer}></div>
  </div>
  <div class="text-center d-block p-3 card-footer">
    <button class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg">
      <span class="me-1">Find me</span>
    </button>
  </div>
</div>