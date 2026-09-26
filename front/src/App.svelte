<script>
  import Login from './lib/Login.svelte';
  import Home from './lib/Home.svelte';

  let token = $state(localStorage.getItem('token') || '');
  let user = $state(JSON.parse(localStorage.getItem('user') || 'null'));

  function onok(d) {
    token = d.token;
    user = d.user;
    localStorage.setItem('token', d.token);
    localStorage.setItem('user', JSON.stringify(d.user));
  }

  function onout() {
    token = '';
    user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
</script>

{#if token && user}
  <Home {token} {user} {onout} />
{:else}
  <Login {onok} />
{/if}
