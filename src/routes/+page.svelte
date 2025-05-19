<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    const accessToken = localStorage.getItem('access');

    if (accessToken) {
      goto('/family');
    } else {
      goto('/login');
    }
  });
</script>

<!-- <script>
  let allData = [
    {
      "date": "2025-04-18",
      "hourly_usages": [
        {"hour":0,"usage_seconds":1200},{"hour":1,"usage_seconds":2400},{"hour":2,"usage_seconds":3600},
        {"hour":3,"usage_seconds":142},{"hour":4,"usage_seconds":3},{"hour":5,"usage_seconds":7},
        {"hour":6,"usage_seconds":15},{"hour":7,"usage_seconds":9},{"hour":8,"usage_seconds":61},
        {"hour":9,"usage_seconds":61},{"hour":10,"usage_seconds":61},{"hour":11,"usage_seconds":61},
        {"hour":12,"usage_seconds":61},{"hour":13,"usage_seconds":61},{"hour":14,"usage_seconds":61},
        {"hour":15,"usage_seconds":61},{"hour":16,"usage_seconds":61},{"hour":17,"usage_seconds":61},
        {"hour":18,"usage_seconds":61},{"hour":19,"usage_seconds":61},{"hour":20,"usage_seconds":61},
        {"hour":21,"usage_seconds":61},{"hour":22,"usage_seconds":61},{"hour":23,"usage_seconds":9}
      ]
    },
    {
      "date": "2025-04-19",
      "hourly_usages": [
        {"hour":0,"usage_seconds":12},{"hour":1,"usage_seconds":8},{"hour":2,"usage_seconds":5},
        {"hour":3,"usage_seconds":15},{"hour":4,"usage_seconds":9},{"hour":5,"usage_seconds":11},
        {"hour":6,"usage_seconds":18},{"hour":7,"usage_seconds":6},{"hour":8,"usage_seconds":61},
        {"hour":9,"usage_seconds":61},{"hour":10,"usage_seconds":61},{"hour":11,"usage_seconds":61},
        {"hour":12,"usage_seconds":61},{"hour":13,"usage_seconds":61},{"hour":14,"usage_seconds":61},
        {"hour":15,"usage_seconds":61},{"hour":16,"usage_seconds":61},{"hour":17,"usage_seconds":61},
        {"hour":18,"usage_seconds":61},{"hour":19,"usage_seconds":61},{"hour":20,"usage_seconds":61},
        {"hour":21,"usage_seconds":61},{"hour":22,"usage_seconds":61},{"hour":23,"usage_seconds":5}
      ]
    },
    {
      "date": "2025-04-20",
      "hourly_usages": [
        {"hour":0,"usage_seconds":18},{"hour":1,"usage_seconds":7},{"hour":2,"usage_seconds":12},
        {"hour":3,"usage_seconds":18},{"hour":4,"usage_seconds":7},{"hour":5,"usage_seconds":12},
        {"hour":6,"usage_seconds":18},{"hour":7,"usage_seconds":7},{"hour":8,"usage_seconds":61},
        {"hour":9,"usage_seconds":61},{"hour":10,"usage_seconds":61},{"hour":11,"usage_seconds":61},
        {"hour":12,"usage_seconds":61},{"hour":13,"usage_seconds":61},{"hour":14,"usage_seconds":61},
        {"hour":15,"usage_seconds":61},{"hour":16,"usage_seconds":61},{"hour":17,"usage_seconds":61},
        {"hour":18,"usage_seconds":61},{"hour":19,"usage_seconds":61},{"hour":20,"usage_seconds":61},
        {"hour":21,"usage_seconds":61},{"hour":22,"usage_seconds":61},{"hour":23,"usage_seconds":12}
      ]
    },
    {
      "date": "2025-04-21",
      "hourly_usages": [
        {"hour":0,"usage_seconds":9},{"hour":1,"usage_seconds":14},{"hour":2,"usage_seconds":6},
        {"hour":3,"usage_seconds":11},{"hour":4,"usage_seconds":17},{"hour":5,"usage_seconds":5},
        {"hour":6,"usage_seconds":10},{"hour":7,"usage_seconds":16},{"hour":8,"usage_seconds":61},
        {"hour":9,"usage_seconds":61},{"hour":10,"usage_seconds":61},{"hour":11,"usage_seconds":61},
        {"hour":12,"usage_seconds":61},{"hour":13,"usage_seconds":61},{"hour":14,"usage_seconds":61},
        {"hour":15,"usage_seconds":61},{"hour":16,"usage_seconds":61},{"hour":17,"usage_seconds":61},
        {"hour":18,"usage_seconds":61},{"hour":19,"usage_seconds":61},{"hour":20,"usage_seconds":61},
        {"hour":21,"usage_seconds":61},{"hour":22,"usage_seconds":61},{"hour":23,"usage_seconds":2}
      ]
    },
    {
      "date": "2025-04-22",
      "hourly_usages": [
        {"hour":0,"usage_seconds":18},{"hour":1,"usage_seconds":7},{"hour":2,"usage_seconds":12},
        {"hour":3,"usage_seconds":18},{"hour":4,"usage_seconds":7},{"hour":5,"usage_seconds":12},
        {"hour":6,"usage_seconds":18},{"hour":7,"usage_seconds":7},{"hour":8,"usage_seconds":61},
        {"hour":9,"usage_seconds":61},{"hour":10,"usage_seconds":61},{"hour":11,"usage_seconds":61},
        {"hour":12,"usage_seconds":61},{"hour":13,"usage_seconds":61},{"hour":14,"usage_seconds":61},
        {"hour":15,"usage_seconds":61},{"hour":16,"usage_seconds":61},{"hour":17,"usage_seconds":61},
        {"hour":18,"usage_seconds":61},{"hour":19,"usage_seconds":61},{"hour":20,"usage_seconds":61},
        {"hour":21,"usage_seconds":61},{"hour":22,"usage_seconds":61},{"hour":23,"usage_seconds":12}
      ]
    },
    {
      "date": "2025-04-23",
      "hourly_usages": [
        {"hour":0,"usage_seconds":11},{"hour":1,"usage_seconds":16},{"hour":2,"usage_seconds":3},
        {"hour":3,"usage_seconds":9},{"hour":4,"usage_seconds":14},{"hour":5,"usage_seconds":1},
        {"hour":6,"usage_seconds":7},{"hour":7,"usage_seconds":12},{"hour":8,"usage_seconds":61},
        {"hour":9,"usage_seconds":61},{"hour":10,"usage_seconds":61},{"hour":11,"usage_seconds":61},
        {"hour":12,"usage_seconds":61},{"hour":13,"usage_seconds":61},{"hour":14,"usage_seconds":61},
        {"hour":15,"usage_seconds":61},{"hour":16,"usage_seconds":61},{"hour":17,"usage_seconds":61},
        {"hour":18,"usage_seconds":61},{"hour":19,"usage_seconds":61},{"hour":20,"usage_seconds":61},
        {"hour":21,"usage_seconds":61},{"hour":22,"usage_seconds":1},{"hour":23,"usage_seconds":7}
      ]
    },
    {
      "date": "2025-04-24",
      "hourly_usages": [
        {"hour":0,"usage_seconds":15},{"hour":1,"usage_seconds":2},{"hour":2,"usage_seconds":9},
        {"hour":3,"usage_seconds":14},{"hour":4,"usage_seconds":1},{"hour":5,"usage_seconds":7},
        {"hour":6,"usage_seconds":12},{"hour":7,"usage_seconds":19},{"hour":8,"usage_seconds":61},
        {"hour":9,"usage_seconds":61},{"hour":10,"usage_seconds":61},{"hour":11,"usage_seconds":61},
        {"hour":12,"usage_seconds":61},{"hour":13,"usage_seconds":61},{"hour":14,"usage_seconds":61},
        {"hour":15,"usage_seconds":61},{"hour":16,"usage_seconds":61},{"hour":17,"usage_seconds":61},
        {"hour":18,"usage_seconds":61},{"hour":19,"usage_seconds":61},{"hour":20,"usage_seconds":61},
        {"hour":21,"usage_seconds":61},{"hour":22,"usage_seconds":7},{"hour":23,"usage_seconds":12}
      ]
    }
  ];
  let hour = 0;
  let selectedDate = allData[allData.length - 1].date;

  $: dayData = allData.find(d => d.date === selectedDate);
  $: usage = dayData?.hourly_usages.find(h => h.hour === hour)?.usage_seconds || 0;

  $: mins = Math.floor(usage / 60);
  $: secs = usage % 60;

  $: startHour = hour.toString().padStart(2, '0');
  $: endHour = ((hour + 1) % 24).toString().padStart(2, '0');

  $: percent = (usage / 3600) * 100;

  function changeView() {
    // your logic here
  }
</script>

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
      <button class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg">
        <span class="me-2 opacity-7">
          <i class="pe-7s-bell"></i>
        </span>
        <span class="me-1">View Notifications</span>
      </button>
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
          <div class="btn-actions-pane-right text-capitalize">
            <button id="change-st" class="btn-wide btn-outline-2x me-md-2 btn btn-outline-success btn-sm">Change view</button>
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
                        <span id="hour-label" class="fw-bold black">00:00 - 01:00</span>
                      </div>
                      <div class="widget-title opacity-5 text-muted me-5">
                        <label for="date-select">Date:</label>
                      </div>
                    </div>
                    <div class="widget-chart-flex d-flex justify-content-between align-items-center">
                      <span class="text-success widget-numbers fw-bold" id="selected-time">2h 21m 12s</span>
                      <div class="d-flex align-items-center">
                        <select id="date-select" class="me-4 mt-3"></select>
                      </div>
                    </div>
                  </div>
                  <div class="widget-chart-wrapper he-auto opacity-10 m-0">
                    <div class="bar-wrapper">
                      <div class="bar-fill" id="bar-fill" style="width: 0%"></div>
                    </div>
                    <div class="d-flex flex-column align-items-center w-100">
                      <input type="range" min="0" max="23"  bind:value={hour}>
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
            <div class="hidden">
              <div class="widget-chart widget-chart2 text-start p-0">
                <div class="widget-chat-wrapper-outer">
                  <div class="widget-chart-content widget-chart-content-lg pb-0">
                    <div class="widget-chart-flex">
                      <div class="widget-title opacity-5 text-muted text-uppercase"> Weekly average</div>
                    </div>
                  </div>
                  <div class="widget-numbers">
                    <div class="widget-chart-flex">
                      <div>
                        <span class="text-warning">1h 12m 9s</span>
                      </div>
                    </div>
                  </div>
                  <div class="widget-chart-wrapper he-auto opacity-10 m-0">
                    <div id="dashboard-sparkline-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-3 card-footer">
          <div class="widget-chart-flex d-flex justify-content-between align-items-center">
            <span class="widget-numbers fw-bold opacity-5">Temps d'écran quotidien &nbsp &nbsp</span>
            <span class="widget-numbers fw-bold opacity-8" id="total"></span>
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
          <div id="map"></div>
        </div>
        <div class="text-center d-block p-3 card-footer">
          <button class="btn-pill btn-shadow btn-wide fsize-1 btn btn-primary btn-lg">
            <span class="me-1">Find me</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div> -->