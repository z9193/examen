<script>
  import { api } from './api.js';

  let { onok } = $props();
  let tab = $state('login');
  let nombre = $state('');
  let email = $state('');
  let password = $state('');
  let rol = $state('admin');
  let err = $state('');
  let loading = $state(false);

  async function submit(e) {
    e.preventDefault();
    err = '';
    loading = true;
    try {
      const path = tab === 'login' ? '/auth/login' : '/auth/register';
      const body = tab === 'login' ? { email, password } : { nombre: nombre || email, email, password, rol };
      const res = await api(path, null, { method: 'POST', body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      if (tab === 'login') {
        const r = data.user.rol;
        const ok = rol === 'admin' ? r === 'admin' : r === 'cliente' || r === 'vendedor';
        if (!ok) throw new Error('Ese usuario no tiene el rol ' + rol);
      }
      onok({ token: data.token, user: data.user });
    } catch (e) {
      err = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="relative min-h-screen overflow-hidden bg-black text-[#f3ead8]">
  <div class="pointer-events-none absolute inset-0 select-none">
    <p class="stencil absolute left-1/2 top-[-8%] w-full -translate-x-1/2 text-center text-[24vw] leading-[0.72] text-[#f3ead8]/90">TURBO</p>
    <p class="stencil absolute bottom-[-12%] left-1/2 w-full -translate-x-1/2 text-center text-[24vw] leading-[0.72] text-[#f3ead8]/90">ENGINE</p>
  </div>
  <div class="absolute left-0 right-0 top-1/2 z-10 h-[72px] -translate-y-1/2 bg-[#e10600]"></div>
  <img src="/engine.svg" alt="" class="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[46vh] -translate-x-1/2 -translate-y-1/2 opacity-90" />

  <form class="relative z-30 mx-auto flex min-h-screen max-w-md items-center px-6" onsubmit={submit}>
    <div class="w-full border border-[#f3ead8]/20 bg-black p-7">
      <h1 class="stencil text-center text-6xl leading-none tracking-wide">TURBO ENGINE</h1>
      <p class="mb-8 mt-2 text-center text-[11px] uppercase tracking-[0.35em] text-[#e10600]">Refaccionaria</p>
      <div class="mb-6 grid grid-cols-2 gap-2">
        <button type="button" class="py-2 text-[10px] uppercase tracking-[0.22em] {tab === 'login' ? 'bg-[#e10600] text-white' : 'border border-[#f3ead8]/25'}" onclick={() => (tab = 'login')}>Iniciar Sesión</button>
        <button type="button" class="py-2 text-[10px] uppercase tracking-[0.22em] {tab === 'register' ? 'bg-[#e10600] text-white' : 'border border-[#f3ead8]/25'}" onclick={() => (tab = 'register')}>Registrarse</button>
      </div>
      {#if tab === 'register'}
        <label class="mb-1 block text-[10px] uppercase tracking-[0.22em]" for="nombre">Nombre</label>
        <input id="nombre" class="mb-4 w-full border border-[#f3ead8]/25 bg-black px-3 py-2 outline-none focus:border-[#e10600]" bind:value={nombre} required />
      {/if}
      <label class="mb-1 block text-[10px] uppercase tracking-[0.22em]" for="email">Correo</label>
      <input id="email" class="mb-4 w-full border border-[#f3ead8]/25 bg-black px-3 py-2 outline-none focus:border-[#e10600]" bind:value={email} type="email" required />
      <label class="mb-1 block text-[10px] uppercase tracking-[0.22em]" for="password">Contraseña</label>
      <input id="password" class="mb-4 w-full border border-[#f3ead8]/25 bg-black px-3 py-2 outline-none focus:border-[#e10600]" bind:value={password} type="password" required />
      <label class="mb-1 block text-[10px] uppercase tracking-[0.22em]" for="rol">Rol</label>
      <select id="rol" class="mb-6 w-full border border-[#f3ead8]/25 bg-black px-3 py-2 outline-none focus:border-[#e10600]" bind:value={rol}>
        <option value="admin">Admin</option>
        <option value="cliente">Cliente</option>
      </select>
      {#if err}<p class="mb-4 text-sm text-[#e10600]">{err}</p>{/if}
      <button class="stencil w-full bg-[#e10600] py-3 text-3xl tracking-wide text-white disabled:opacity-60" disabled={loading}>
        {loading ? '...' : tab === 'login' ? 'ENTRAR' : 'REGISTRAR'}
      </button>
    </div>
  </form>
</div>
