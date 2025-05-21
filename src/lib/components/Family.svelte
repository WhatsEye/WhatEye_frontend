<script>
  export let family = {};
</script>

<div class="mb-3 card p-3 rounded-3">
  <div class="d-flex flex-column align-items-center">
    <!-- svelte-ignore a11y_img_redundant_alt -->
    <img
      src={family.photo}
      alt={`${family.name}'s Family Picture`}
      class="family-img rounded-circle mb-3 border border-4 border-sky-200"
    />
    <div class="text-center flex-grow-1">
      <h2 class="h5 fw-bolder text-dark">{family.name}</h2>
      <p class="text-sky-600 mb-1">{family.about}</p>
      <p class="small text-muted mt-1">Family ID: {family.id}</p>
    </div>
    <div class="mt-3 d-flex flex-column flex-sm-row">
      <button
        class="btn btn-primary btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center mb-2 mb-sm-0 me-sm-2"
      >
        View Activity
      </button>
      <button
        class="btn btn-light btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center border"
      >
        <i class="fas fa-cog me-2"></i> Settings
      </button>
    </div>
  </div>
</div>

<style>
  .family-img {
    width: 100px;
    height: 100px;
  }
  .text-sky-600 {
    color: #0284c7 !important;
  }
  .border-sky-200 {
    border-color: #bae6fd !important;
  }
</style>