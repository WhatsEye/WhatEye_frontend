<script>
	import { lockChangedStore, num_notif, num_vo_calls, num_vd_calls, allowDash } from './../../stores/functions.js';
	import { websocketStore } from './../../stores/websockets.js';
  import { goto } from "$app/navigation";


  export let children = [];
  export let onViewActivity = (child) => {
    localStorage.setItem("ActiveChild", child.id);
    allowDash.set(true)
    
    // num_notif.set(child.num_unread_notifications)
    // num_vo_calls.set(child.num_unread_voice_calls)
    // num_vd_calls.set(child.num_unread_video_calls)
    goto("/app/dashboard");
  };
  export let onSettings = (child) => {
    localStorage.setItem("ActiveChild", child.id);
   
    goto("/edit/edit-child");
  };
  $: if ($lockChangedStore){
    lockChangedStore.set(false)
    //child.phone_locked = !child.phone_locked;
  }
  // Function to toggle WhatsApp lock (to be implemented based on your backend)
  function toggleWhatsAppLock(child) {
    websocketStore.lockPhone(child.id)
  }

  const getColorClass = (index, type) => {
    const colorMap = {
      text: ["text-blue-600", "text-pink-600"],
      border: ["border-blue-300", "border-pink-300"],
    };
    return colorMap[type][index % 2];
  };
</script>

<div class="grille-cards">
  {#each children as child, index}
  {
    num_notif.update(current => ({
        ...current,
        [child.id]: child.num_unread_notifications
    }))
  }
  {
    num_vd_calls.update(current => ({
        ...current,
        [child.id]: child.num_unread_video_calls
    }))
  }
  {
    num_vo_calls.update(current => ({
        ...current,
        [child.id]: child.num_unread_voice_calls
    }))
  }
    <div
      class="carte shadow-md p-4 rounded-lg transform hover:scale-105 transition-transform duration-300 bg-white relative hover:shadow-xl"
    >
      <!-- Top bar with notifications, calls, and video -->
      <div class="flex space-x-2 mb-4 h-10 w-full">
        <div
          class="flex items-center justify-center w-full bg-gray-100 rounded-md relative"
          title="{websocketStore[child.id]} unread notifications"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a3 3 0 00-6 0v.083A6 6 0 002 11v3.159c0 .538-.214 1.055-.595 1.436L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {#if ($num_notif[child.id] || 0) > 0}
            <span
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {($num_notif[child.id] || 0)}
            </span>
          {/if}
        </div>
        <div
          class="flex items-center justify-center w-full bg-gray-100 rounded-md relative"
          title="{($num_vo_calls[child.id] || 0)} unread voice calls"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {#if ($num_vo_calls[child.id] || 0) > 0}
            <span
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {($num_vo_calls[child.id] || 0)}
            </span>
          {/if}
        </div>
        <div
          class="flex items-center justify-center w-full bg-gray-100 rounded-md relative"
          title="{($num_vd_calls[child.id] || 0)} unread video calls"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {#if ($num_vd_calls[child.id] || 0) > 0}
            <span
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {($num_vd_calls[child.id] || 0)}
            </span>
          {/if}
        </div>
      </div>

      <!-- Profile section -->
      <div class="flex flex-col items-center text-center">
        <div class="relative w-32 h-32 mb-3">
          <img
            src={child.photo || "https://via.placeholder.com/128"}
            alt={`Profile photo of ${child.full_name}`}
            class="img-enfant rounded-full border-4 {getColorClass(index, 'border')} object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>
        <h4 class="text-lg font-semibold text-gray-800 mb-1">{child.full_name}</h4>
        <p class="text-sm {getColorClass(index, 'text')} font-medium mb-1">{child.username}</p>
        <p class="text-xs text-gray-500 mb-3">{child.gender === "M" ? "Masculin" : "Féminin"}</p>

        <!-- Action buttons -->
        <div class="flex space-x-3 mt-2">
          <button
            class="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full shadow hover:bg-blue-700 transition"
            on:click={() => onViewActivity(child)}
            aria-label={`View activity for ${child.full_name}`}
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 20h9" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 4H3" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Voir
          </button>
          <button
            class="flex items-center bg-gray-200 px-3 py-1 border border-gray-600 rounded-full text-gray-900 text-sm hover:bg-gray-100 transition"
            on:click={() => onSettings(child)}
            aria-label={`Settings for ${child.full_name}`}
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Paramètres
          </button>
        </div>
      </div>

      <!-- WhatsApp Lock Toggle -->
      <div class="flex items-center justify-between mt-4 w-full">
        <span class="text-sm font-medium text-gray-700">Verrouillage WhatsApp</span>
        <label class="switch">
          <input
            type="checkbox"
            checked={child.phone_locked}
            on:change={() => toggleWhatsAppLock(child)}
            aria-label={`Toggle WhatsApp lock for ${child.full_name}`}
          />
          <span class="slider"></span>
        </label>
      </div>
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

  /* Card hover effect */
  .carte {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .carte:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  /* Profile image hover effect */
  .img-enfant {
    transition: transform 0.3s ease;
  }

  /* Switch styling */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #d1d5db;
    transition: 0.4s;
    border-radius: 34px;
  }

  .slider::before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #4caf50;
  }

  input:checked + .slider::before {
    transform: translateX(22px);
  }

  /* Accessibility for switch */
  .switch input:focus + .slider {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
</style>