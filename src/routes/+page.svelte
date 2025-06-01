<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
      goto('/family');
    } else {
      goto('/login');
    }
  });
</script>