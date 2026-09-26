create extension if not exists "pgcrypto";

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique not null,
  password_hash text not null,
  rol text not null default 'vendedor' check (rol in ('admin', 'vendedor')),
  created_at timestamptz not null default now()
);

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null
);

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  nombre text not null,
  descripcion text,
  marca text,
  modelo_auto text,
  categoria_id uuid references categorias(id) on delete set null,
  precio numeric(12,2) not null default 0,
  stock int not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text
);

create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  usuario_id uuid references usuarios(id) on delete set null,
  total numeric(12,2) not null default 0,
  fecha timestamptz not null default now()
);

create table if not exists venta_detalle (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad int not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null
);

alter table usuarios enable row level security;
alter table categorias enable row level security;
alter table productos enable row level security;
alter table clientes enable row level security;
alter table ventas enable row level security;
alter table venta_detalle enable row level security;
