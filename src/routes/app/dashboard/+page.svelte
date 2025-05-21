<script>
  import { onMount } from 'svelte';
  import { baseurl } from '../../../stores/functions';
  import LocationCard from '$lib/components/LocationCard.svelte';
  import ScreenTimeCard from '$lib/components/ScreenTimeCard.svelte';
  import SummaryCard from '$lib/components/SummaryCard.svelte';
;

  let allData = [];
  let userId;
  let selectedDate;
  let selectedHour = 0;

  onMount(async () => {
    userId = localStorage.getItem("ActiveChild");
    let access = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (!access || !userId) {
      console.error("Missing access token or child ID");
      return;
    }

    const res = await fetch(`${baseurl}/control/user-usage/${userId}/hourly/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`
      }
    });

    if (res.ok) {
      const json = await res.json();
      allData = json.results;
      selectedDate = allData[allData.length - 1]?.date;
    } else {
      console.error("Failed to fetch data");
    }
  });
</script>

<svelte:head>
  <title>WHATSEYE | Accueil</title>
  <link rel="stylesheet" href="/styles/dashboard.css">
</svelte:head>

<div class="tabs-animation">
  <SummaryCard />
  <div class="row d-flex align-items-stretch">
    <div class="col-sm-12 col-lg-6">
      <ScreenTimeCard {allData} bind:selectedDate bind:selectedHour />
    </div>
    <div class="col-sm-12 col-lg-6">
      <LocationCard />
    </div>
  </div>
</div>