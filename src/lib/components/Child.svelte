<script>
  import { goto } from "$app/navigation";

  export let children = [];
  export let onViewActivity = (child) => {
    localStorage.setItem("ActiveChild", child.id)
    goto("app/dashboard")
    };
  export let onSettings = (child) => {};
</script>

{#each children as child, index}
  <div class="card shadow-lg mb-3 p-3 rounded">
    <div class="d-flex flex-column flex-sm-row align-items-center">
      <!-- svelte-ignore a11y_img_redundant_alt -->
      <img
        src={child.photo}
        alt={`${child.full_name}'s Profile Picture`}
        class="child-img rounded-circle me-0 me-sm-3 mb-3 mb-sm-0 border border-4 {index % 2 === 0 ? 'border-blue-200' : 'border-red-200'}"
      />
      <div class="flex-grow-1 text-center text-sm-start">
        <h4 class="h6 fw-bolder text-dark">{child.full_name}</h4>
        <p class="{index % 2 === 0 ? 'text-blue-600' : 'text-red-600'} small mb-1">
          {child.username}
        </p>
        <p class="small text-muted mt-1">{child.gender === 'M' ? 'Male' : 'Female'}</p>
      </div>
      <div class="mt-3 mt-sm-0 ms-sm-auto d-flex flex-column flex-sm-row">
        <button
          class="btn btn-primary btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center mb-2 mb-sm-0 me-sm-2"
          on:click={() => onViewActivity(child)}
        >
          View Activity
        </button>
        <button
          class="btn btn-light btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center border"
          on:click={() => onSettings(child)}
        >
          Settings
        </button>
      </div>
    </div>
  </div>
{/each}

<style>
  .child-img {
    width: 80px;
    height: 80px;
  }
  .text-blue-600 {
    color: #2563eb !important;
  }
  .text-red-600 {
    color: #dc2626 !important;
  }
  .border-blue-200 {
    border-color: #bfdbfe !important;
  }
  .border-red-200 {
    border-color: #fecaca !important;
  }
</style>
