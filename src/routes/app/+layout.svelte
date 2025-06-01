<script>
	import { onMount } from 'svelte';
	import { checkPath } from './../../stores/functions.js';
  import Header from '$lib/components/Header.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  
  onMount(()=>{
    checkPath()
  })

</script>


<div class="app-container app-theme-white body-tabs-shadow fixed-header fixed-sidebar">
  <Header />
  <div class="app-main">
    <Navbar />
    <div class="app-main__outer">
      <div class="app-main__inner">
        <slot></slot>
      </div>
      <Footer />
    </div>
  </div>
</div>