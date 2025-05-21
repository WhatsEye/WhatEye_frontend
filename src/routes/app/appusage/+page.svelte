<script>
  import { onMount, onDestroy } from 'svelte';
  import { baseurl } from '../../../stores/functions';

  let allData = [];
  let selectedDate;
  let selectedHour = 0;
  let isActive = false;
  let nextUrl = null;
  let isLoading = false;
  let errorMessage = '';
  let loadMoreTrigger;
  let observer;

  function normalizeHourlyUsages(hourlyUsages) {
    const normalized = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      usage_seconds: 0
    }));
    hourlyUsages.forEach((usage) => {
      normalized[usage.hour] = usage;
    });
    return normalized;
  }

  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  async function fetchData(url) {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const userId = localStorage.getItem("ActiveChild");
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (!access || !userId) {
      errorMessage = "Informations d'authentification manquantes. Veuillez vous reconnecter.";
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(url || `${baseurl}/control/user-usage/${userId}/hourly/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        const normalizedResults = json.results.map((entry) => ({
          ...entry,
          hourly_usages: normalizeHourlyUsages(entry.hourly_usages)
        }));
        allData = [...allData, ...normalizedResults];
        nextUrl = json.next;
        if (!selectedDate && normalizedResults.length > 0) {
          selectedDate = normalizedResults[0].date;
        } else if (!allData.some(d => d.date === selectedDate)) {
          selectedDate = allData[0]?.date;
        }
      } else {
        errorMessage = "Échec du chargement des données. Veuillez réessayer plus tard.";
      }
    } catch (error) {
      errorMessage = "Une erreur est survenue lors du chargement. Vérifiez votre connexion.";
    } finally {
      isLoading = false;
    }
  }

  const debouncedFetch = debounce(fetchData, 300);

  onMount(async () => {
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
  });

  $: dayData = allData.find(d => d.date === selectedDate) || { hourly_usages: Array(24).fill({ usage_seconds: 0 }) };
  $: hourUsage = dayData.hourly_usages[selectedHour]?.usage_seconds || 0;
  $: mins = Math.floor(hourUsage / 60);
  $: secs = hourUsage % 60;
  $: startHour = selectedHour.toString().padStart(2, '0');
  $: endHour = ((selectedHour + 1) % 24).toString().padStart(2, '0');
  $: usageText = `${mins}m ${secs}s`;
  $: barWidth = (hourUsage / 3600) * 100;
  $: totalSeconds = dayData.hourly_usages.reduce((sum, h) => sum + (h.usage_seconds || 0), 0) || 0;
  $: dailyHours = Math.floor(totalSeconds / 3600);
  $: dailyMinutes = Math.floor((totalSeconds % 3600) / 60);
  $: dailySeconds = totalSeconds % 60;
  $: totalTimeText = `${dailyHours}h ${dailyMinutes}m ${dailySeconds}s`;
</script>

<svelte:head>
  <title>WHATSEYE | Temps d’écran</title>
  <link rel="stylesheet" href="/styles/dashboard.css">
  <style>
    .date-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      font-size: 0.95rem;
    }
    .date-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 6px;
      transition: background 0.2s ease;
    }
   
    .date-item:hover {
      background-color: #f1f1f1;
    }
    .date-item.selected {
      background-color: #cfefff;
      font-weight: bold;
    }
    .loading, .error {
      text-align: center;
      padding: 10px;
    }
    .error {
      color: #d32f2f;
      font-weight: bold;
    }
  </style>
</svelte:head>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon lnr-clock icon-gradient bg-happy-itmeo"></i>
      Temps d’écran
    </div>
  </div>
  <div class="p-0 card-body">
    <div class="p-3">
      {#if errorMessage}
        <div class="error">{errorMessage}</div>
      {/if}
      <div class="widget-chart widget-chart2 text-start p-0">
        <div class="widget-chat-wrapper-outer">
          <div class="widget-chart-content widget-chart-content-lg pb-0">
            <div class="widget-chart-flex d-flex justify-content-between align-items-center">
              <div class="widget-title text-muted">
                Heure sélectionnée :
                <span class="fw-bold text-primary">{startHour}:00 - {endHour}:00</span>
              </div>
              <div class="widget-title text-muted me-5">
                Utilisation : <span class="text-success fw-bold">{usageText}</span>
              </div>
            </div>
          </div>
          <div class="widget-chart-wrappeHeure sélectionnée r he-auto opacity-10 m-0">
            <div class="bar-wrapper" role="progressbar" aria-valuenow={barWidth.toFixed(1)} aria-valuemin="0" aria-valuemax="100">
              <div class="bar-fill" style={`width: ${barWidth}%`} title={`Utilisation : ${usageText}`}></div>
            </div>
            <div class="d-flex flex-column align-items-center w-100">
              <div class="mb-2 text-primary fw-bold"></div>
              <input 
                type="range" 
                min="0" max="23" 
                bind:value={selectedHour} 
                class:active={isActive}
                on:touchstart={() => isActive = true}
                on:touchend={() => isActive = false}
                aria-label="Choisir une heure"
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
      <div class="p-3 mt-4 card">
        <div class="widget-chart-flex d-flex justify-content-between align-items-center">
        <span class="widget-numbers fw-bold opacity-5">Temps total de la journée</span>
        <span class="widget-numbers fw-bold opacity-8">{totalTimeText}</span>
        </div>
    </div>
      <div class="mt-4">
        <h5>Sélectionner une date</h5>
        <div class="date-list" role="listbox" aria-label="Liste des dates disponibles">
          {#each allData as entry}
            <div 
              class="date-item {entry.date === selectedDate ? 'selected' : ''}" 
              on:click={() => selectedDate = entry.date}
              role="option"
              aria-selected={entry.date === selectedDate}
            >
              <span>{new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span>
                {
                  (() => {
                    const total = entry.hourly_usages.reduce((sum, h) => sum + (h.usage_seconds || 0), 0);
                    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m ${total % 60}s`;
                  })()
                }
              </span>
            </div>
          {/each}
          {#if isLoading}
            <div class="loading">Chargement en cours...</div>
          {/if}
          <div bind:this={loadMoreTrigger}></div>
        </div>
      </div>
    </div>
  </div>

  
</div>
