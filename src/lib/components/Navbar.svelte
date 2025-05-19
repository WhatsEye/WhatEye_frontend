<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';

  function updateActiveSidebarLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll(".vertical-nav-menu a");

    links.forEach(link => {
      if (link.getAttribute("href") === currentPath) link.classList.add("mm-active");
      else link.classList.remove("mm-active");
    });
  }

  onMount(() => {
    updateActiveSidebarLink();       
    
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

    const resizeClass = () => {
      const win = document.body.clientWidth;
      const appContainer = document.querySelector(".app-container");

      if (!appContainer) return;

      if (win < 1250) {
        appContainer.classList.add("closed-sidebar-mobile", "closed-sidebar");
      } else {
        appContainer.classList.remove("closed-sidebar-mobile", "closed-sidebar");
      }
    };
    resizeClass();
    window.addEventListener("resize", resizeClass);
  });

  afterNavigate(() => {
    updateActiveSidebarLink();      
  });
</script>
<svelte:head>
  <link rel="stylesheet" href="/styles/pe7-icon/dist/dist/pe-icon-7-stroke.css">
</svelte:head>
<div class="app-sidebar sidebar-shadow">
  <div class="app-header__logo">
    <div class="logo-src"></div>
    <div class="header__pane ms-auto">
      <div>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" class="hamburger close-sidebar-btn hamburger--elastic" data-class="closed-sidebar">
          <span class="hamburger-box">
            <span class="hamburger-inner"></span>
          </span>
        </button>
      </div>
    </div>
  </div>
  <div class="app-header__mobile-menu">
    <div>
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button type="button" class="hamburger hamburger--elastic mobile-toggle-nav">
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>
    </div>
  </div>
  <div class="app-header__menu">
    <span>
      <!-- svelte-ignore a11y_consider_explicit_label -->
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
        <li class="app-sidebar__heading">DashBoard</li>
        <li><a href="/app/family"><i class="metismenu-icon pe-7s-home"></i>My Family</a></li>
        <li><a href="/app/dashboard"><i class="metismenu-icon pe-7s-graph2"></i>DashBoard</a></li>
        <li><a href="/app/notifications"><i class="metismenu-icon pe-7s-bell"></i>Notifications</a></li>
        <li class="app-sidebar__heading">Functionalities</li>
        <li><a href="/app/contacts"><i class="metismenu-icon pe-7s-users"></i>Contacts</a></li>
        <li><a href="/app/chats"><i class="metismenu-icon pe-7s-chat"></i>Chats</a></li>
        <li><a href="/app/calls"><i class="metismenu-icon pe-7s-call"></i>Calls</a></li>
        <li><a href="/app/photos"><i class="metismenu-icon pe-7s-photo"></i>Photos</a></li>
        <li><a href="/app/videos"><i class="metismenu-icon pe-7s-video"></i>Videos</a></li>
        <li><a href="/app/voices"><i class="metismenu-icon pe-7s-micro"></i>Voices</a></li>
        <li><a href="/app/documents"><i class="metismenu-icon pe-7s-file"></i>Documents</a></li>
        <li><a href="/app/appusage"><i class="metismenu-icon pe-7s-timer"></i>Time on App</a></li>
        <li><a href="/app/location"><i class="metismenu-icon pe-7s-map-marker"></i>Location</a></li>
      </ul>
    </div>
  </div>
</div>
