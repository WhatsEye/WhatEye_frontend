<script>
  export let allData = [];
  export let selectedDate; // No initial value here to allow reactive update
  export let selectedHour = 0; // Default hour to 0

  let isActive = false;

  // Reactively set selectedDate based on allData
  $: selectedDate = allData.length > 0 
    ? allData.reduce((latest, entry) => 
        new Date(entry.date) > new Date(latest.date) ? entry : latest
      ).date 
    : new Date().toISOString().split('T')[0]; // Defaults to 2025-05-21

  // Sort dates in descending order (most recent first)
  $: availableDates = allData.length > 0 
    ? [...allData].sort((a, b) => new Date(b.date) - new Date(a.date)) 
    : [{ date: selectedDate }];

  $: dayData = allData.find(d => d.date === selectedDate) || { date: selectedDate, hourly_usages: [] };
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

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-clock icon-gradient bg-happy-itmeo"></i>
      Screen time
    </div>
  </div>
  <div class="p-0 card-body">
    <div class="p-1">
      <div class="widget-chart widget-chart2 text-start p-0">
        <div class="widget-chat-wrapper-outer">
          <div class="widget-chart-content widget-chart-content-lg pb-0">
            <div class="widget-chart-flex d-flex justify-content-between align-items-center">
              <div class="widget-title opacity-5 text-muted">
                Heure sélectionnée
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
                  {#each availableDates as entry}
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
                on:touchend={() => isActive = false}
              >
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
  <div class="p-3 card-footer">
    <div class="widget-chart-flex d-flex justify-content-between align-items-center">
      <span class="widget-numbers fw-bold opacity-5">Temps d'écran quotidien</span>
      <span class="widget-numbers fw-bold opacity-8">{totalTimeText}</span>
    </div>
  </div>
</div>