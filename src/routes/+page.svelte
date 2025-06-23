<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { updateToken } from '../stores/accounts/auth';

  onMount(() => {
    
    const accessToken = localStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');
    if (accessToken) {
      updateToken(refreshToken)
      goto('/family');
    } else {
      goto('/login');
    }
  });
</script>