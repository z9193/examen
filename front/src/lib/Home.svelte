<script>
  import { api } from './api.js';

  let { token, user, onout } = $props();
  let categorias = $state([]);
  let productos = $state([]);
  let carros = $state([]);
  let piezas = $state([]);
  let err = $state('');
  let i = $state(0);
  let carroForm = $state({ marca: '', modelo: '', anio: '' });
  let piezaForm = $state({ nombre: '', precio: '', stock: '', carro_id: '' });
  const rolUi = $derived(user.rol === 'admin' ? 'admin' : 'cliente');

  async function load() {
    const [c, p, cars, parts] = await Promise.all([
      api('/categorias', token).then((r) => r.json()),
      api('/productos', token).then((r) => r.json()),
      api('/carros', token).then((r) => r.json()),
      api('/piezas', token).then((r) => r.json()),
    ]);
    if (!Array.isArray(c)) throw new Error(c.error || 'Categorías');
    if (!Array.isArray(p)) throw new Error(p.error || 'Productos');
    if (!Array.isArray(cars)) throw new Error(cars.error || 'Carros');
    if (!Array.isArray(parts)) throw new Error(parts.error || 'Piezas');
    categorias = c;
    productos = p;
    carros = cars;
    piezas = parts;
  }

  $effect(() => {
    load().catch((e) => {
      err = e.message;
    });
  });

  async function crearCarro(e) {
    e.preventDefault();
    if (user.rol !== 'admin') return;
    err = '';
    const res = await api('/carros', token, {
      method: 'POST',
      body: JSON.stringify({ ...carroForm, anio: Number(carroForm.anio) || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      err = data.error || 'Error';
      return;
    }
    carroForm = { marca: '', modelo: '', anio: '' };
    await load();
  }

  async function crearPieza(e) {
    e.preventDefault();
    if (user.rol !== 'admin') return;
    err = '';
    const res = await api('/piezas', token, {
      method: 'POST',
      body: JSON.stringify({
        nombre: piezaForm.nombre,
        precio: Number(piezaForm.precio) || 0,
        stock: Number(piezaForm.stock) || 0,
        carro_id: piezaForm.carro_id || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      err = data.error || 'Error';
      return;
    }
    piezaForm = { nombre: '', precio: '', stock: '', carro_id: '' };
    await load();
  }

  const catName = (id) => categorias.find((c) => c.id === id)?.nombre || '';

  function prev() {
    if (!productos.length) return;
    i = (i - 1 + productos.length) % productos.length;
  }
  function next() {
    if (!productos.length) return;
    i = (i + 1) % productos.length;
  }
</script>

<div class="min-h-screen bg-black text-[#f3ead8]">
  <header class="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-5 py-4">
    <span class="stencil text-2xl tracking-[0.12em] text-[#f3ead8]">TURBO ENGINE</span>
    <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]">
      <span class="bg-[#e10600] px-2 py-1 text-white">{rolUi}</span>
      <span class="text-[#f3ead8]/80">{user.nombre}</span>
      <button class="text-[#f3ead8] underline decoration-[#e10600] underline-offset-4" onclick={onout}>Salir</button>
    </div>
  </header>

  {#if err}
    <p class="px-4 pt-20 text-[#e10600]">{err}</p>
  {:else}
    <div class="grid grid-cols-2 gap-8 px-5 pt-20">
    <section class="px-5 py-10">
      <h2 class="stencil mb-5 text-5xl tracking-wide text-[#e10600]">Carros</h2>
      {#if user.rol === 'admin'}
        <form class="mb-4 flex flex-wrap gap-2" onsubmit={crearCarro}>
          <input class="border bg-black px-2 py-1" placeholder="Marca" bind:value={carroForm.marca} required />
          <input class="border bg-black px-2 py-1" placeholder="Modelo" bind:value={carroForm.modelo} required />
          <input class="border bg-black px-2 py-1" placeholder="Año" type="number" bind:value={carroForm.anio} />
          <button class="bg-[#e10600] px-3 py-1 text-white">Crear</button>
        </form>
      {/if}
      <ul>
        {#each carros as c}
          <li>{c.marca} {c.modelo} {c.anio || ''}</li>
        {/each}
      </ul>
    </section>

    <section class="px-5 py-10">
      <h2 class="stencil mb-5 text-5xl tracking-wide text-[#e10600]">Piezas</h2>
      {#if user.rol === 'admin'}
        <form class="mb-4 flex flex-wrap gap-2" onsubmit={crearPieza}>
          <input class="border bg-black px-2 py-1" placeholder="Nombre" bind:value={piezaForm.nombre} required />
          <input class="border bg-black px-2 py-1" placeholder="Precio" type="number" bind:value={piezaForm.precio} />
          <input class="border bg-black px-2 py-1" placeholder="Stock" type="number" bind:value={piezaForm.stock} />
          <select class="border bg-black px-2 py-1" bind:value={piezaForm.carro_id}>
            <option value="">Carro</option>
            {#each carros as c}
              <option value={c.id}>{c.marca} {c.modelo}</option>
            {/each}
          </select>
          <button class="bg-[#e10600] px-3 py-1 text-white">Crear</button>
        </form>
      {/if}
      <ul>
        {#each piezas as p}
          <li>{p.nombre} ${Number(p.precio).toFixed(2)} stock {p.stock}</li>
        {/each}
      </ul>
    </section>
    </div>

    <section class="relative h-[78vh] min-h-[520px] overflow-hidden bg-black">
      <div class="pointer-events-none absolute inset-0 select-none">
        <p class="stencil absolute left-1/2 top-[-6%] w-full -translate-x-1/2 text-center text-[26vw] leading-[0.72] text-[#f3ead8]">TURBO</p>
        <p class="stencil absolute bottom-[-10%] left-1/2 w-full -translate-x-1/2 text-center text-[26vw] leading-[0.72] text-[#f3ead8]">ENGINE</p>
      </div>

      <div class="absolute left-0 right-0 top-1/2 z-10 h-[72px] -translate-y-1/2 bg-[#e10600]"></div>

      <div class="absolute inset-0 z-20 flex items-center justify-center">
        <img src="/engine.svg" alt="" class="h-[58vh] max-h-[420px] w-auto" />
      </div>

      <div class="absolute left-0 right-0 top-1/2 z-30 grid h-[72px] -translate-y-1/2 grid-cols-[auto_1fr_42%_1fr_auto] items-center px-3 sm:px-5">
        <button
          class="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl leading-none text-black"
          onclick={prev}
          aria-label="Anterior">‹</button>
        <p class="stencil hidden pl-3 text-[clamp(2.2rem,7vw,5rem)] leading-none text-white sm:block">TURBO</p>
        <div></div>
        <p class="stencil hidden pr-3 text-right text-[clamp(2.2rem,7vw,5rem)] leading-none text-white sm:block">ENGINE</p>
        <button
          class="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl leading-none text-black"
          onclick={next}
          aria-label="Siguiente">›</button>
      </div>
    </section>

    <div class="flex gap-2 overflow-x-auto bg-white p-3">
      {#each productos as p, n}
        <button
          class="min-w-[11rem] shrink-0 border-[3px] p-3 text-left {n === i ? 'border-[#e10600]' : 'border-black'}"
          style="background:{n % 2 === 0 ? '#e10600' : '#111'};color:{n % 2 === 0 ? '#fff' : '#f3ead8'}"
          onclick={() => (i = n)}
        >
          <p class="stencil text-2xl leading-none tracking-wide">{p.nombre}</p>
          <p class="mt-2 text-[10px] uppercase tracking-[0.18em] opacity-80">{catName(p.categoria_id)}</p>
          <p class="bebas text-xl">${Number(p.precio).toFixed(2)}</p>
          {#if rolUi === 'admin'}<p class="text-[10px] uppercase tracking-widest">Stock {p.stock}</p>{/if}
        </button>
      {/each}
    </div>

    {#each categorias as c}
      <section class="px-5 py-10">
        <h2 class="stencil mb-5 text-5xl tracking-wide text-[#e10600]">{c.nombre}</h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {#each productos.filter((p) => p.categoria_id === c.id) as p}
            <article class="border border-[#f3ead8]/15 bg-[#111] p-4">
              <p class="text-[10px] uppercase tracking-[0.22em] text-[#e10600]">{p.sku}</p>
              <h3 class="stencil mt-1 text-3xl leading-none">{p.nombre}</h3>
              <p class="mt-2 text-sm text-[#f3ead8]/60">{p.marca} · {p.modelo_auto}</p>
              <p class="bebas mt-3 text-2xl">${Number(p.precio).toFixed(2)}</p>
              {#if rolUi === 'admin'}
                <p class="text-xs uppercase tracking-widest text-[#f3ead8]/50">Stock {p.stock}</p>
              {/if}
            </article>
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div>
