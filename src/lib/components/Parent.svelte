<script>
  import { goto } from "$app/navigation";
  import { profileId } from "../../stores/accounts/auth";

  export let parents = [];
   export let onSettings = () => {
     goto("/edit/edit-parent");
  };
</script>

{#each parents as parent, index}
  <div class="mb-3 card p-3 card-container">
    <div class="d-flex flex-column flex-sm-row align-items-center">
      <!-- svelte-ignore a11y_img_redundant_alt -->
      <img
        src={parent.photo}
        alt={`${parent.full_name || parent.username}'s Profile Picture`}
        class="profile-img rounded-circle me-0 me-sm-3 mb-3 mb-sm-0 border border-4 {index % 2 === 0 ? 'border-sky-200' : 'border-red-200'}"
      />
      <div class="text-center text-sm-start flex-grow-1">
        <h2 class="h5 fw-bolder text-dark">{parent.full_name || parent.username}</h2>
        <p class="{index % 2 === 0 ? 'text-sky-600' : 'text-red-600'} mb-1">
            {parent.username === 'azax' ? 'Père' : 'Mère'}
        </p>
        <p class="small text-muted mt-1">Membre de la famille</p>
      </div>
      {#if $profileId==parent.id}
        
      
      <div class="flex space-x-3 mt-2">
          <button
            class="flex  items-center bg-gray-200 px-3 py-1 border border-gray-600 rounded-full text-gray-900 text-sm hover:bg-gray-100 transition"
            on:click={() => onSettings()}
            aria-label="Paramètres"
          >
            <i class="lnr lnr-cog  mr-1 mt-1"></i>
            Paramètres
          </button>
        </div>
        {/if}
    </div>
  </div>
{/each}

<style>
  .profile-img {
    width: 100px;
    height: 100px;
  }
  .text-sky-600 {
    color: #0284c7 !important;
  }
  .border-sky-200 {
    border-color: #bae6fd !important;
  }
  .text-red-600 {
    color: #dc2626 !important;
  }
  .border-red-200 {
    border-color: #fecaca !important;
  }
</style>