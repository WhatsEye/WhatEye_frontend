<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  // Access status and error message from the page store
  $: status = $page.status;
  $: errorMessage = $page.error?.message || 'Page Not Found';

  function goToHome() {
    goto('/family'); // Adjust this path if your dashboard is elsewhere
  }
</script>

<svelte:head>
  <title>WHATSEYE | Page Introuvable</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />
</svelte:head>

<div class="min-h-screen flex h-100  bg-gray-100 flex flex-col items-center justify-center p-4">
  <div class="mb-3 card  max-w-md w-full">
    <!-- Card Header -->
    <div class="card-header-tab card-header">
      <div class="card-header-title font-size-lg text-capitalize fw-normal">
        <i class="header-icon lnr-warning icon-gradient bg-amy-crisp"></i>
        Erreur {status}
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-0 m-3 card-body d-flex flex-colum  n text-center">
      <!-- Error Message -->
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-800">{status} - {errorMessage}</h1>
        <p class="text-gray-600 mt-2">
          {#if status === 404}
            Oups ! Cette page s'est égarée comme un enfant curieux. Retournons à la maison !
          {:else}
            Une erreur s'est produite. Ne vous inquiétez pas, nous allons vous ramener sur le bon chemin !
          {/if}
        </p>
      </div>

      <!-- Back to Home Button -->
      <button
        class="btn btn-primary mx-auto"
        on:click={goToHome}
        on:keydown={(e) => e.key === 'Enter' && goToHome()}
        aria-label="Retour au tableau de bord"
      >
        <i class="lnr-home mr-2"></i>
        Retour à l'accueil
      </button>
    </div>
  </div>

  <!-- Footer -->
  <div class="mt-4 text-gray-500 text-sm">
    <p>WHATSEYE © {new Date().getFullYear()}</p>
  </div>
</div>

<style>
  .min-h-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f3f4f6;
  }

  .card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-header-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: #1f2937;
    text-transform: capitalize;
  }

  .header-icon {
    margin-right: 0.5rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .text-gray-800 {
    color: #1f2937;
  }

  .text-gray-600 {
    color: #4b5563;
  }

  .text-gray-500 {
    color: #6b7280;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1.5rem;
    background-color: #2563eb;
    color: white;
    font-weight: 500;
    border-radius: 0.375rem;
    transition: background-color 0.3s ease;
  }

  .btn-primary:hover {
    background-color: #1d4ed8;
  }

  .mr-2 {
    margin-right: 0.5rem;
  }
</style>