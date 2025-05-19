<script>
  import Parent from '$lib/components/Parent.svelte';
  import Child from '$lib/components/Child.svelte';
</script>

<svelte:head>
    <title>Famille</title>
</svelte:head>

<div class="tabs-animation">
  <Parent/>
  <div class="row g-3 mb-4">
    <div class="col-md-6">
        <button class="btn btn-success w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center fs-6">
            <i class="pe-7s-add-user mx-3"></i> Add Another Parent
        </button>
    </div>
    <div class="col-md-6">
        <button class="btn btn-warning w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center fs-6">
            Add a Child
            <!-- child icon -->
        </button>
    </div>
  </div>
  <div class="mb-3">
    <h3 class="h4 fw-bolder text-dark mb-3">Children</h3>
  </div>
  <Child/>
</div>

