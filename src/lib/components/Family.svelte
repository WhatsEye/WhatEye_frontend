<script>
	import { goto } from '$app/navigation';
  export let family = {};
</script>

<div class="card-container">
  <div class="card-content">
    <img
      src={family.photo}
      alt={`${family.name}'s Family Picture`}
      class="family-img"
      loading="lazy"
    />
    <div class="text-content">
      <h2 class="family-name">{family.name}</h2>
    <div class="max-w-screen-md  "> <p class="family-about ">{family.about}</p></div> 
      <p class="family-id">Family ID: {family.id}</p>
    </div>
    <div class="button-group">
      
      <div class="flex space-x-3 mt-2">
          <button
            class="flex  items-center bg-gray-200 px-3 py-1 border border-gray-600 rounded-full text-gray-900 text-sm hover:bg-gray-100 transition"
            on:click={() =>{goto("/edit/edit-family")}}
            aria-label="Paramètres"
          >
            <i class="lnr lnr-cog  mr-1 mt-1"></i>
            Paramètres
          </button>
        </div>
    </div>
  </div>
</div>

<style>
  .card-container {
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .card-container:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .family-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid #bae6fd;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .family-img:hover {
    transform: scale(1.05);
  }

  .text-content {
    text-align: center;
  }

  .family-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .family-about {
    font-size: 1.1rem;
    color: #0284c7;
    text-align: center;
    margin: 0.25rem 0;
    line-height: 1.4;
  }

  .family-id {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background-color: #0284c7;
    color: #ffffff;
  }

  .btn-primary:hover {
    background-color: #026aa7;
    transform: translateY(-2px);
  }

  .btn-secondary {
    background-color: #f1f5f9;
    color: #1e293b;
    border: 1px solid #e2e8f0;
  }

  .btn-secondary:hover {
    background-color: #e2e8f0;
    transform: translateY(-2px);
  }

  @media (min-width: 640px) {
    .button-group {
      flex-direction: row;
      justify-content: center;
    }

    .btn {
      padding: 0.5rem 1.25rem;
    }
  }
</style>