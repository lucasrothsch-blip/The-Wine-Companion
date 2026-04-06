create extension if not exists "uuid-ossp";

create table if not exists public.providers (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  contacto_nombre text not null,
  contacto_email text not null,
  contacto_tel text not null,
  condicion_pago_dias integer not null default 0,
  datos_facturacion text not null,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wines (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  categoria text not null,
  cepa text not null,
  pais text not null,
  region text not null,
  bodega text not null,
  anada integer not null,
  proveedor_id uuid references public.providers(id) on delete set null,
  costo_sin_iva numeric(12,2) not null,
  alicuota_iva numeric(5,2) not null,
  costo_con_iva numeric(12,2) not null,
  precio_venta numeric(12,2) not null,
  stock_actual integer not null default 0,
  stock_minimo_alerta integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('ingreso','venta','ajuste')),
  fecha timestamptz not null,
  wine_id uuid not null references public.wines(id) on delete cascade,
  cantidad integer not null check (cantidad > 0),
  costo_unitario numeric(12,2),
  precio_unitario numeric(12,2),
  proveedor_id uuid references public.providers(id) on delete set null,
  canal text,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_movements_fecha on public.stock_movements(fecha);
create index if not exists idx_stock_movements_wine on public.stock_movements(wine_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_providers_updated_at on public.providers;
create trigger trg_providers_updated_at
before update on public.providers
for each row execute function public.touch_updated_at();

drop trigger if exists trg_wines_updated_at on public.wines;
create trigger trg_wines_updated_at
before update on public.wines
for each row execute function public.touch_updated_at();

create or replace function public.record_stock_movement(
  tipo text,
  fecha timestamptz,
  wine_id uuid,
  cantidad integer,
  costo_unitario numeric default null,
  precio_unitario numeric default null,
  proveedor_id uuid default null,
  canal text default null,
  notas text default null,
  bloquear_stock_negativo boolean default true
)
returns public.stock_movements
language plpgsql
as $$
declare
  current_stock integer;
  delta integer;
  new_stock integer;
  inserted public.stock_movements;
begin
  select stock_actual into current_stock from public.wines where id = wine_id for update;

  if current_stock is null then
    raise exception 'Wine % not found', wine_id;
  end if;

  if tipo = 'ingreso' then
    delta := cantidad;
  elsif tipo = 'venta' then
    delta := -cantidad;
  elsif tipo = 'ajuste' then
    delta := cantidad;
  else
    raise exception 'tipo inválido: %', tipo;
  end if;

  new_stock := current_stock + delta;

  if bloquear_stock_negativo and new_stock < 0 then
    raise exception 'Stock insuficiente: % (actual) - % (venta)', current_stock, cantidad;
  end if;

  insert into public.stock_movements (tipo, fecha, wine_id, cantidad, costo_unitario, precio_unitario, proveedor_id, canal, notas)
  values (tipo, fecha, wine_id, cantidad, costo_unitario, precio_unitario, proveedor_id, canal, notas)
  returning * into inserted;

  update public.wines set stock_actual = new_stock where id = wine_id;

  return inserted;
end;
$$;
