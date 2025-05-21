<script>
  // Static data for the summary cards (could be made dynamic if needed)
  const stats = [
    { title: "Chats", icon: "lnr-bubble", count: 37, change: 6 },
    { title: "Calls", icon: "lnr-phone-handset", count: 19, change: 2 },
    { title: "Photos", icon: "lnr-picture", count: 32, change: 3 },
    { title: "Videos", icon: "lnr-camera-video", count: 32, change: 3 },
    { title: "Voices", icon: "lnr-mic", count: 32, change: 3 },
    { title: "Documents", icon: "lnr-file-empty", count: 2, change: 0 }
  ];
</script>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-charts icon-gradient bg-happy-green"></i>
      Summary
    </div>
  </div>
  <div class="g-0 row">
    {#each stats as stat, i}
      <div class="col-sm-6 col-md-4 col-xl-2">
        <div class="card no-shadow rm-border bg-transparent widget-chart text-start">
          <div class="icon-wrapper rounded-circle">
            <div class="icon-wrapper-bg opacity-10 bg-success"></div>
            <i class="{stat.icon} text-white opacity-8"></i>
          </div>
          <div class="widget-chart-content">
            <div class="widget-subheading">{stat.title}</div>
            <div class="widget-numbers">{stat.count}</div>
            <div class="widget-description opacity-8 text-focus">
              <div class="d-inline {stat.change > 0 ? 'text-info' : 'text-muted'} pe-1">
                <span class="ps-1">{stat.change}</span>
              </div>
              more
            </div>
          </div>
        </div>
        {#if i < stats.length - 1}
          <div class="divider m-0 d-md-none d-sm-block"></div>
        {/if}
      </div>
    {/each}
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