<script>
  //TODO: Manage notifications
  export let data;
  const { allData } = data;
  import { onMount } from 'svelte';
  let mapContainer
  const lat = 30.0;
  const long = 3.0;
  const zoom = 5;
  let map;

  onMount( async () => {
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    map = L.map(mapContainer, {
      attributionControl: false,
      zoomControl: false
    }).setView([lat,long], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 5,
      minZoom: 5,
      trackResize: true,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs'
    }).addTo(map);

    map.zoomControl.remove();

    map.invalidateSize();
  });
   
  let selectedDate = allData[allData.length - 1]?.date;
  let selectedHour = 0;
  let isActive = false;

  $: dayData = allData.find(d => d.date === selectedDate);
  $: hourUsage = dayData?.hourly_usages.find(h => h.hour === selectedHour)?.usage_seconds || 0;
  $: mins = Math.floor(hourUsage / 60);
  $: secs = hourUsage % 60;
  $: startHour = selectedHour.toString().padStart(2, '0');
  $: endHour = ((selectedHour + 1) % 24).toString().padStart(2, '0');
  $: usageText = `${mins}m ${secs}s`;
  $: barWidth = (hourUsage / 3600) * 100;

  $: totalSeconds = dayData?.hourly_usages.reduce((sum, h) => sum + (h.usage_seconds || 0), 0) || 0;
  $: dailyHours = Math.floor(totalSeconds / 3600);
  $: dailyMinutes = Math.floor((totalSeconds % 3600) / 60);
  $: dailySeconds = totalSeconds % 60;
  $: totalTimeText = `${dailyHours}h ${dailyMinutes}m ${dailySeconds}s`;
</script>

<svelte:head>
    <title>WHATSEYE | Accueil</title>
    <link rel="stylesheet" href="/styles/dashboard.css">
</svelte:head>

<div class="tabs-animation">
  <div class="mb-3 card">
    <div class="card-header-tab card-header">
      <div class="card-header-title font-size-lg text-capitalize fw-normal">
        <i class="header-icon lnr-charts icon-gradient bg-happy-green"></i>
        Summary
      </div>
    </div>
    <div class="g-0 row">
      <div class="col-sm-6 col-md-4 col-xl-2">
        <div class="card no-shadow rm-border bg-transparent widget-chart text-start">
          <div class="icon-wrapper rounded-circle">
            <div class="icon-wrapper-bg opacity-10 bg-success"></div>
            <i class="lnr-bubble text-white opacity-8"></i>
          </div>
          <div class="widget-chart-content">
            <div class="widget-subheading">Chats</div>
            <div class="widget-numbers">37</div>
            <div class="widget-description opacity-8 text-focus">
              <div class="d-inline text-info pe-1">
                <span class="ps-1">6</span>
              </div>
              more
            </div>
          </div>
        </div>
        <div class="divider m-0 d-md-none d-sm-block"></div>
      </div>
      <div class="col-sm-6 col-md-4 col-xl-2">
        <div class="card no-shadow rm-border bg-transparent widget-chart text-start">
          <div class="icon-wrapper rounded-circle">
            <div class="icon-wrapper-bg opacity-10 bg-success"></div>
            <i class="lnr-phone-handset text-white opacity-8"></i>
          </div>
          <div class="widget-chart-content">
            <div class="widget-subheading">Calls</div>
            <div class="widget-numbers">19</div>
            <div class="widget-description opacity-8 text-focus">
              <div class="d-inline text-info pe-1">
                <span class="ps-1">2</span>
              </div>
              more
            </div>
          </div>
        </div>
        <div class="divider m-0 d-md-none d-sm-block"></div>
      </div>
      <div class="col-sm-6 col-md-4 col-xl-2">
        <div class="card no-shadow rm-border bg-transparent widget-chart text-start">
          <div class="icon-wrapper rounded-circle">
            <div class="icon-wrapper-bg opacity-10 bg-success"></div>
            <i class="lnr-picture text-white opacity-8"></i>
          </div>
          <div class="widget-chart-content">
            <div class="widget-subheading">Photos</div>
            <div class="widget-numbers">32</div>
            <div class="widget-description opacity-8 text-focus">
              <div class="d-inline text-info pe-1">
                <span class="ps-1">3</span>
              </div>
              more
            </div>
          </div>
        </div>
        <div class="divider m-0 d-md-none d-sm-block"></div>
      </div>
      <div class="col-sm-6 col-md-4 col-xl-2">
        <div class="card no-shadow rm-border bg-transparent widget-chart text-start">
          <div class="icon-wrapper rounded-circle">
            <div class="icon-wrapper-bg opacity-10 bg-success"></div>
            <i class="lnr-camera-video text-white opacity-8"></i>
          </div>
          <div class="widget-chart-content">
            <div class="widget-subheading">Videos</div>
            <div class="widget-numbers">32</div>
            <div class="widget-description opacity-8 text-focus">
              <div class="d-inline text-info pe-1">
                <span class="ps-1">3</span>
              </div>
              more
            </div>
          </div>
        </div>
        <div class="divider m-0 d-md-none d-sm-block"></div>
      </div>
      <div class="col-sm-6 col-md-4 col-xl-2">
        <div class="card no-shadow rm-border bg-transparent widget-chart text-start">
          <div class="icon-wrapper rounded-circle">
            <div class="icon-wrapper-bg opacity-10 bg-success"></div>
            <i class="lnr-mic text-white opacity-8"></i>
          </div>
          <div class="widget-chart-content">
            <div class="widget-subheading">Voices</div>
            <div class="widget-numbers">32</div>
            <div class="widget-description opacity-8 text-focus">
              <div class="d-inline text-info pe-1">
                <span class="ps-1">3</span>
              </div>
              more
            </div>
          </div>
        </div>
        <div class="divider m-0 d-md-none d-sm-block"></div>
      </div>
      <div class="col-sm-6 col-md-4 col-xl-2">
        <div class="card no-shadow rm-border bg-transparent widget-chart text-start">
          <div class="icon-wrapper rounded-circle">
            <div class="icon-wrapper-bg opacity-10 bg-success"></div>
            <i class="lnr-file-empty text-white opacity-8"></i>
          </div>
          <div class="widget-chart-content">
            <div class="widget-subheading">Documents</div>
            <div class="widget-numbers">2</div>
            <div class="widget-description opacity-8 text-focus">
              <div class="d-inline text-muted pe-1">
                <span class="ps-1">0</span>
              </div>
              more
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center d-block p-3 card-footer">
      <a href="/app/notifications">
        <button class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg">
          <span class="me-2 opacity-7">
            <i class="pe-7s-bell"></i>
          </span>
          <span class="me-1">View Notifications</span>
        </button>
      </a>
    </div>
  </div>
  <div class="row d-flex align-items-stretch">
    <div class="col-sm-12 col-lg-6">
      <div class="mb-3 card">
        <div class="card-header-tab card-header">
          <div class="card-header-title font-size-lg text-capitalize fw-normal">
            <i class="header-icon lnr-clock icon-gradient bg-happy-itmeo"></i>
            Screen time
          </div>
        </div>
        <div class="p-0 card-body">
          <div class="p-1">
            <div>
              <div class="widget-chart widget-chart2 text-start p-0">
                <div class="widget-chat-wrapper-outer">
                  <div class="widget-chart-content widget-chart-content-lg pb-0">
                    <div class="widget-chart-flex d-flex justify-content-between align-items-center">
                      <div class="widget-title opacity-5 text-muted">Heure sélectionnée
                        <span class="fw-bold black">{startHour}:00 - {endHour}:00</span>
                      </div>
                      <div class="widget-title opacity-5 text-muted me-5">
                        <label for="date-select">Date:</label>
                      </div>
                    </div>
                    <div class="widget-chart-flex d-flex justify-content-between align-items-center">
                      <span class="text-success widget-numbers fw-bold">{usageText}</span>
                      <div class="d-flex align-items-center">
                        <select id="date-select" class="me-4 mt-3" bind:value={selectedDate}>
                          {#each allData as entry}
                            <option value={entry.date}>
                              {new Date(entry.date).toDateString()}
                            </option>
                          {/each}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="widget-chart-wrapper he-auto opacity-10 m-0">
                    <div class="bar-wrapper">
                      <div class="bar-fill" style={`width: ${barWidth}%`}></div>
                    </div>
                    <div class="d-flex flex-column align-items-center w-100">
                      <input 
                        type="range" 
                        min="0" max="23" 
                        bind:value={selectedHour} 
                        class:active={isActive}
                        on:touchstart={() => isActive = true}
                        on:touchend={() => isActive = false}>
                      <div class="slider-ticks">
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>23:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-3 card-footer">
          <div class="widget-chart-flex d-flex justify-content-between align-items-center">
            <span class="widget-numbers fw-bold opacity-5">Temps d'écran quotidien &nbsp &nbsp</span>
            <span class="widget-numbers fw-bold opacity-8">{totalTimeText}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-lg-6">
      <div class="card-hover-shadow-2x mb-3 card">
        <div class="card-header-tab card-header">
          <div class="card-header-title font-size-lg text-capitalize fw-normal">
            <i class="header-icon lnr-map icon-gradient bg-amy-crisp"></i>
            Location
          </div>
        </div>
        <div class="p-0 card-body d-flex flex-column" >
          <div class="map" bind:this={mapContainer}></div>
        </div>
        <div class="text-center d-block p-3 card-footer">
          <button class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg">
            <span class="me-1">Find me</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>