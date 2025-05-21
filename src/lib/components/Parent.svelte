<script>
  export let parents = [];
</script>

{#each parents as parent, index}
  <div class="mb-3 card p-3 rounded-3">
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
          {parent.username === 'azax' ? 'Father' : 'Mother'}
        </p>
        <p class="small text-muted mt-1">Member of Family</p>
      </div>
      <div class="mt-3 mt-sm-0 ms-sm-auto d-flex flex-column flex-sm-row">
        <button
          class="btn btn-primary btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center mb-2 mb-sm-0 me-sm-2"
        >
          View Activity
        </button>
        <button
          class="btn btn-light btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center border"
        >
          Settings
        </button>
      </div>
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