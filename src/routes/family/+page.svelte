<script>
  import { beforeUpdate, onMount } from 'svelte';
  import Parent from '$lib/components/Parent.svelte';
  import Child from '$lib/components/Child.svelte';
  import { baseurl, forceLogin } from '../../stores/functions';
  import Family from '$lib/components/Family.svelte';

  let showParentModal = false;
  let showChildModal = false;
  let parentEmail = '';

  let family = {};
  let parents = [];
  let children = [];

  
  // Fetch family data
  onMount(async () => {
    forceLogin()
    localStorage.removeItem("ActiveChild")
    let access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const config = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`
      }
    };
    try {
      const res = await fetch(`${baseurl}/accounts/profile/family/`, config);
      const data = await res.json();
      family = {
        id: data.id,
        photo: data.photo,
        name: data.name,
        about: data.about
      }
      // Extract and format parent data
      const parentList = [data.father, data.mother].filter(p => p && p.id);
      parents = parentList.map(p => ({
        id: p.id,
        photo: p.photo,
        username: p.username,
        full_name: p.full_name
      }));

      // Extract and format child data
      children = data.kids.map(k => ({
        id: k.id,
        photo: k.photo,
        username: k.username,
        full_name: k.full_name
      }));
    } catch (error) {
      console.error('Error fetching family data:', error);
    }
  });
</script>

<svelte:head>
  <title>Famille</title>
</svelte:head>

<div class="tabs-animation app-container app-theme-white body-tabs-shadow py-4">
  <div class="container">
    <div class="tabs-animation app-container">
      <Family {family}/>

      <!-- Parent component with data -->
      <Parent {parents} />

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <button
            class="btn btn-success w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center fs-6"
            on:click={() => showParentModal = true}
          >
            <i class="pe-7s-add-user mx-3"></i> Add Another Parent
          </button>
        </div>
        <div class="col-md-6">
          <button
            class="btn btn-warning w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center fs-6"
            on:click={() => showChildModal = true}
          >
            Add a Child
          </button>
        </div>
      </div>

      <div class="mb-3">
        <h3 class="h4 fw-bolder text-dark mb-3">Children</h3>
      </div>

      <!-- Child component with data -->
      <Child {children} />

      <!-- Parent Modal -->
      {#if showParentModal}
        <div class="modal-backdrop">
          <div class="modal-box">
            <h5>Add Parent Email</h5>
            <input
              type="email"
              placeholder="Enter email"
              bind:value={parentEmail}
              class="form-control mb-3"
            />
            <div class="d-flex justify-content-end">
              <button class="btn btn-secondary me-2" on:click={() => showParentModal = false}>Cancel</button>
              <button class="btn btn-success" on:click={() => {
                // Handle email submit here
                console.log('Parent email submitted:', parentEmail);
                showParentModal = false;
              }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Child QR Modal -->
      {#if showChildModal}
        <div class="modal-backdrop">
          <div class="modal-box text-center">
            <h5>Scan QR to Add Child</h5>
            <img src="/qr-code-placeholder.png" alt="QR Code" class="img-fluid my-3" style="max-width: 250px;" />
            <button class="btn btn-warning" on:click={() => showChildModal = false}>Close</button>
          </div>
        </div>
      {/if}

    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }

  .modal-box {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  }
</style>
