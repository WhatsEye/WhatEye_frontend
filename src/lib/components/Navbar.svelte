<script>
  import { fade } from 'svelte/transition';
  import { num_notif, num_vo_calls, num_vd_calls, allowDash } from './../../stores/functions.js';
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';

  let userId;
  let isSidebarSmall = false;
  let isWindowSmall = false;

  // Mettre à jour le lien actif dans la barre latérale
  function updateActiveSidebarLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll(".vertical-nav-menu a");
    links.forEach(link => {
      if (link.getAttribute("href") === currentPath) link.classList.add("mm-active");
      else link.classList.remove("mm-active");
    });
  }

  // Mettre à jour les positions des badges de notification
  function updateBadgePositions() {
    const badges = document.querySelectorAll(".notification-badge");
    badges.forEach((badge) => {
      if (isSidebarSmall) {
        badge.classList.remove("top-2.5", "right-2");
        badge.classList.add("top-2", "right-2");
      } else {
        badge.classList.remove("top-2", "right-2");
        badge.classList.add("top-2.5", "right-2");
      }
    });
  }

  // Gérer le toggle des dropdowns
  function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll(".vertical-nav-menu > li > a[aria-expanded]");
    dropdownToggles.forEach(toggle => {
    
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const parentLi = toggle.parentElement;
        const isOpen = parentLi.classList.contains("mm-show");
        const badge = toggle.querySelector("span.notification-badge");

        // Toggle visibility of the badge
        if (badge) {
          if (!isOpen) {
            badge.classList.add("hidden"); // Hide badge when opening dropdown
          } else {
            badge.classList.remove("hidden"); // Show badge when closing dropdown
          }
        }

        // Fermer les autres dropdowns
        document.querySelectorAll(".vertical-nav-menu > li.mm-show").forEach(li => {
          if (li !== parentLi) {
            li.classList.remove("mm-show");
            const link = li.querySelector("a[aria-expanded]");
            if (link) link.setAttribute("aria-expanded", "false");
            const icon = li.querySelector(".metismenu-state-icon");
            if (icon) icon.classList.replace("pe-7s-angle-up", "pe-7s-angle-down");
          }
        });

        // Toggle le dropdown actuel
        parentLi.classList.toggle("mm-show");
        toggle.setAttribute("aria-expanded", !isOpen);
        const icon = toggle.querySelector(".metismenu-state-icon");
        if (icon) {
          icon.classList.toggle("pe-7s-angle-up", !isOpen);
          icon.classList.toggle("pe-7s-angle-down", isOpen);
        }
      });
    });
  }

  onMount(() => {
    userId = localStorage.getItem('ActiveChild');
    updateActiveSidebarLink();
    initializeDropdowns();

    const buttons = document.querySelectorAll(".close-sidebar-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const classToSwitch = button.getAttribute("data-class");
        const containerElement = document.querySelector(".app-container");
        if (containerElement) {
          containerElement.classList.toggle(classToSwitch);
        }
        button.classList.toggle("is-active");
      });
    });

    const mobileToggleNavBtn = document.querySelector(".mobile-toggle-nav");
    if (mobileToggleNavBtn) {
      mobileToggleNavBtn.addEventListener("click", () => {
        mobileToggleNavBtn.classList.toggle("is-active");
        document.querySelector(".app-container")?.classList.toggle("sidebar-mobile-open");
      });
    }

    const sidebar = document.querySelector(".app-sidebar");
    if (sidebar) {
      sidebar.addEventListener("mouseenter", () => {
        isSidebarSmall = false;
        updateBadgePositions();
      });
      sidebar.addEventListener("mouseleave", () => {
        isSidebarSmall = isWindowSmall;
        updateBadgePositions();
      });
    }

    const resizeClass = () => {
      const win = document.body.clientWidth;
      const appContainer = document.querySelector(".app-container");
      if (!appContainer) return;
      if (win < 1250) {
        appContainer.classList.add("closed-sidebar-mobile", "closed-sidebar");
        isWindowSmall = true;
      } else {
        appContainer.classList.remove("closed-sidebar-mobile", "closed-sidebar");
        isWindowSmall = false;
      }
      isSidebarSmall = isWindowSmall;
      updateBadgePositions();
    };

    resizeClass();
    window.addEventListener("resize", resizeClass);

    return () => {
      window.removeEventListener("resize", resizeClass);
      if (sidebar) {
        sidebar.removeEventListener("mouseenter", () => {});
        sidebar.removeEventListener("mouseleave", () => {});
      }
    };
  });

  afterNavigate(() => {
    updateActiveSidebarLink();
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/tailwind.min.css" />
  <link rel="stylesheet" href="/styles/pe7-icon/dist/dist/pe-icon-7-stroke.css" />
  <style>
    .vertical-nav-menu li.mm-show > ul {
      display: block;
    }
    .vertical-nav-menu li > ul {
      display: none;
      padding-left: 1.5rem;
    }
    .metismenu-state-icon {
      transition: transform 0.3s;
    }
    .mm-show .metismenu-state-icon.pe-7s-angle-up {
      transform: rotate(180deg);
    }
  </style>
</svelte:head>

<div class="app-sidebar sidebar-shadow">
  <div class="app-header__logo">
    <div class="logo-src"></div>
    <div class="header__pane ms-auto">
      <button type="button" class="hamburger close-sidebar-btn hamburger--elastic" data-class="closed-sidebar">
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>
    </div>
  </div>
  <div class="app-header__mobile-menu">
    <div>
      <button type="button" class="hamburger hamburger--elastic mobile-toggle-nav">
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>
    </div>
  </div>
  <div class="app-header__menu">
    <span>
      <button type="button" class="btn-icon btn-icon-only btn btn-primary btn-sm mobile-toggle-header-nav">
        <span class="btn-icon-wrapper">
          <i class="fa fa-ellipsis-v fa-w-6"></i>
        </span>
      </button>
    </span>
  </div>
  <div class="scrollbar-sidebar">
    <div class="app-sidebar__inner">
      <ul class="vertical-nav-menu">
        <li class="app-sidebar__heading">Tableau de bord</li>
        <li><a href="/family" on:click={() => allowDash.set(false)}><i class="metismenu-icon pe-7s-users"></i>Ma famille</a></li>
        <li><a href="/app/dashboard"><i class="metismenu-icon pe-7s-graph2"></i>Tableau de bord</a></li>
        <li>
          <a href="/app/notifications">
            <i class="metismenu-icon pe-7s-bell"></i>Notifications
            {#if ($num_notif[userId] || 0) > 0}
              <span class="notification-badge absolute bg-red-500 text-white text-xs rounded-full {isSidebarSmall ? 'h-2 w-2' : 'h-6 w-6'} flex items-center justify-center top-2.5 right-2">
                {($num_notif[userId] || 0) >= 100 ? "+99" : ($num_notif[userId] || 0)}
              </span>
            {/if}
          </a>
        </li>
        <li class="app-sidebar__heading">Fonctionnalités</li>
        <li><a href="/app/contacts"><i class="metismenu-icon pe-7s-users"></i>Contacts</a></li>
        <li><a href="/app/chats"><i class="metismenu-icon pe-7s-chat"></i>Discussions</a></li>
        <li><a href="/app/files"><i class="metismenu-icon pe-7s-folder"></i>Dossiers</a></li>
        <li>
          <a href="" aria-expanded="false">
            <i class="metismenu-icon pe-7s-folder"></i>Enregistrements d'appels
            {#if ($num_vd_calls[userId] || 0) > 0 || ($num_vo_calls[userId] || 0) > 0}
              <span class="notification-badge absolute bg-red-500 text-white text-xs rounded-full h-2 w-2 flex items-center justify-center top-2.5 right-2"></span>
            {/if}
            <i class="metismenu-state-icon pe-7s-angle-down caret-left"></i>
          </a>
          <ul>
            <li>
              <a href="/app/videos">
                <i class="w-4 h-4 mr-2 pe-7s-video"></i>Vidéos
                {#if ($num_vd_calls[userId] || 0) > 0}
                  <span class="notification-badge absolute bg-red-500 text-white text-xs rounded-full {isSidebarSmall ? 'h-2 w-2' : 'h-6 w-6'} flex items-center justify-center top-2.5 right-2">
                    {($num_vd_calls[userId] || 0) >= 100 ? "+99" : ($num_vd_calls[userId] || 0)}
                  </span>
                {/if}
              </a>
            </li>
            <li>
              <a href="/app/voices">
                <i class="w-4 h-4 mr-2 pe-7s-micro"></i>Voix
                {#if ($num_vo_calls[userId] || 0) > 0}
                  <span class="notification-badge absolute bg-red-500 text-white text-xs rounded-full {isSidebarSmall ? 'h-2 w-2' : 'h-6 w-6'} flex items-center justify-center top-2.5 right-2">
                    {($num_vo_calls[userId] || 0) >= 100 ? "+99" : ($num_vo_calls[userId] || 0)}
                  </span>
                {/if}
              </a>
            </li>
          </ul>
        </li>
        <li><a href="/app/schedules"><i class="metismenu-icon lnr-calendar-full"></i>Plannings</a></li>
        <li><a href="/app/whatsapp-keyword-alert"><i class="metismenu-icon pe-7s-attention"></i>Mots-clés observés</a></li>
        <li><a href="/app/appusage"><i class="metismenu-icon pe-7s-timer"></i>Temps sur l'application</a></li>
        <li><a href="/app/location"><i class="metismenu-icon pe-7s-map-marker"></i>Localisation</a></li>
      </ul>
    </div>
  </div>
</div>