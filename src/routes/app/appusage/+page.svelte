<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { baseurl } from '../../../stores/functions';

  let allData = [];
  let selectedDate = null;
  let selectedHour = 0;
  let nextUrl = null;
  let isLoading = false;
  let errorMessage = '';
  let loadMoreTrigger;
  let observer;

  // Normalize hourly usage data to ensure all 24 hours are represented
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

  // Debounce utility
  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  // Fetch data from API
  async function fetchData(url) {
    if (isLoading) return;
    isLoading = true;
    errorMessage = '';

    const userId = localStorage.getItem('ActiveChild');
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access || !userId) {
      errorMessage = 'Authentification manquante. Veuillez vous reconnecter.';
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(url || `${baseurl}/control/user-usage/${userId}/hourly/`, {
        headers: {
          'Content-Type': 'application/json',
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
        } else if (!allData.some((d) => d.date === selectedDate)) {
          selectedDate = allData[0]?.date || null;
        }
      } else {
        errorMessage = 'Échec du chargement des données. Veuillez réessayer.';
      }
    } catch (error) {
      errorMessage = 'Erreur réseau. Vérifiez votre connexion et réessayez.';
    } finally {
      isLoading = false;
    }
  }

  const debouncedFetch = debounce(fetchData, 300);

  // Set up IntersectionObserver for infinite scroll
  onMount(async () => {
    await fetchData();
    if (loadMoreTrigger) {
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
  });

  onDestroy(() => {
    if (observer && loadMoreTrigger) {
      observer.unobserve(loadMoreTrigger);
    }
  });

  // Retry failed request
  function retryFetch() {
    fetchData();
  }

  // Reactive statements for UI calculations
  $: dayData = allData.find((d) => d.date === selectedDate) || {
    hourly_usages: Array(24).fill({ hour: 0, usage_seconds: 0 })
  };
  $: hourUsage = dayData.hourly_usages[selectedHour]?.usage_seconds || 0;
  $: mins = Math.floor(hourUsage / 60);
  $: secs = hourUsage % 60;
  $: startHour = selectedHour.toString().padStart(2, '0');
  $: endHour = ((selectedHour + 1) % 24).toString().padStart(2, '0');
  $: usageText = `${mins}m ${secs}s`;
  $: barWidth = Math.min((hourUsage / 3600) * 100, 100); // Cap at 100%
  $: totalSeconds = dayData.hourly_usages.reduce((sum, h) => sum + (h.usage_seconds || 0), 0) || 0;
  $: dailyHours = Math.floor(totalSeconds / 3600);
  $: dailyMinutes = Math.floor((totalSeconds % 3600) / 60);
  $: dailySeconds = totalSeconds % 60;
  $: totalTimeText = `${dailyHours}h ${dailyMinutes}m ${dailySeconds}s`;
</script>

<svelte:head>
  <title>WHATSEYE | Temps d’écran</title>
  <link rel="stylesheet" href="/styles/dashboard.css">
</svelte:head>

<div class="mb-3 card">
  <div class="card-header-tab card-header">
    <div class="card-header-title font-size-lg text-capitalize fw-normal">
      <i class="header-icon metismenu-icon pe-7s-timer icon-gradient bg-happy-itmeo"></i>
      Temps d’écran
    </div>
  </div>
  <div class="p-0 card-body">
    <div class="p-3">
      {#if errorMessage}
      <div class="alert {errorMessage.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert"> 
          {errorMessage}
        </div>
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
          <div class="widget-chart-wrapper opacity-10 m-0">
            <div
              class="bar-wrapper"
              role="progressbar"
              aria-valuenow={barWidth.toFixed(1)}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Utilisation horaire"
            >
              <div
                class="bar-fill"
                style="width: {barWidth}%; background-color: #28a745;"
                title="Utilisation : {usageText}"
              ></div>
            </div>
            <div class="d-flex flex-column align-items-center w-100">
              <input
                type="range"
                min="0"
                max="23"
                bind:value={selectedHour}
                aria-label="Sélectionner une heure"
                aria-valuenow={selectedHour}
                aria-valuemin="0"
                aria-valuemax="23"
                class="mt-2"
              />
              <div class="slider-ticks d-flex justify-content-between w-100">
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
          {#if isLoading && allData.length === 0}
          <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Chargement en cours...
          </div>
          {:else if allData.length === 0 && !isLoading}
            <div class="placeholder" role="status" aria-live="polite">
              <i class="placeholder-icon lnr-calendar-full"></i>
              <p>Aucune donnée d’utilisation pour le moment.<br />Veuillez vérifier ultérieurement.</p>
            </div>
          {:else}
            {#each allData as entry}
              <div
                class="date-item {entry.date === selectedDate ? 'selected' : ''}"
                on:click={() => (selectedDate = entry.date)}
                on:keydown={(e) => e.key === 'Enter' && (selectedDate = entry.date)}
                role="option"
                aria-selected={entry.date === selectedDate}
                tabindex="0"
              >
                <span>
                  {new Date(entry.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
                <span>
                  {#if entry.hourly_usages}
                    {(() => {
                      const total = entry.hourly_usages.reduce((sum, h) => sum + (h.usage_seconds || 0), 0);
                      return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m ${total % 60}s`;
                    })()}
                  {:else}
                    0h 0m 0s
                  {/if}
                </span>
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
      </div>
    </div>
  </div>
</div>

