<script>
  import { goto } from "$app/navigation";

  export let children = [];
  export let onViewActivity = (child) => {
    localStorage.setItem("ActiveChild", child.id);
    goto("app/dashboard");
  };
  export let onSettings = (child) => {
    localStorage.setItem("ActiveChild", child.id);
     goto("/edit/edit-child");
  };

  const getColorClass = (index, type) => {
    const colorMap = {
      text: ['text-blue-600', 'text-pink-600'],
      border: ['border-blue-300', 'border-pink-300'],
    };
    return colorMap[type][index % 2];
  };
</script>

<div class="grille-cards">
  {#each children as child, index}
    <div class="carte shadow-md p-4 rounded-lg transform hover:scale-105 transition-transform duration-300 bg-white relative hover:shadow-xl">
      <div class="flex flex-col items-center text-center">
        <div class="relative w-32 h-32 mb-3">
          <img
            src={child.photo}
            alt={`Photo de profil de ${child.full_name}`}
            class="img-enfant rounded-full border-4 {getColorClass(index, 'border')} object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>
        <h4 class="text-lg font-semibold text-gray-800 mb-1">{child.full_name}</h4>
        <p class="text-sm {getColorClass(index, 'text')} font-medium mb-1">{child.username}</p>
        <p class="text-xs text-gray-500 mb-3">{child.gender == "M" ? 'Masculin' : 'Féminin'}</p>
        <div class="flex space-x-3 mt-2">
          <button
            class="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full shadow hover:bg-blue-700 transition"
            on:click={() => onViewActivity(child)}
            aria-label="Voir l'activité"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 20h9" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 4H3" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Voir
          </button>
          <button
            class="flex  items-center bg-gray-200 px-3 py-1 border border-gray-600 rounded-full text-gray-900 text-sm hover:bg-gray-100 transition"
            on:click={() => onSettings(child)}
            aria-label="Paramètres"
          >
            <i class="lnr lnr-cog  mr-1 mt-1"></i>
            Paramètres
          </button>
        </div>
      </div>
      <!-- Badge "Nouveau" optionnel -->
      {#if child.isNew}
        <div class="absolu top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce">
          Nouveau
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .grille-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
  }

  /* Effet sur l'image de profil */
  .img-enfant {
    transition: transform 0.3s ease;
  }

  /* Effet de survol sur les cartes pour plus d'interactivité */
  .carte:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  /* Les couleurs pour le texte et les bordures sont gérées via les classes */
</style>