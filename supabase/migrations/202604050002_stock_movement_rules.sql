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
  bloquear_stock_negativo boolean default true,
  ajuste_modo text default 'incremento'
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
    if costo_unitario is null then
      raise exception 'costo_unitario es obligatorio para tipo ingreso';
    end if;
    delta := cantidad;
  elsif tipo = 'venta' then
    if precio_unitario is null then
      raise exception 'precio_unitario es obligatorio para tipo venta';
    end if;
    delta := -cantidad;
  elsif tipo = 'ajuste' then
    if notas is null or length(trim(notas)) < 3 then
      raise exception 'notas/motivo es obligatorio para tipo ajuste';
    end if;

    if ajuste_modo = 'decremento' then
      delta := -cantidad;
    elsif ajuste_modo = 'incremento' then
      delta := cantidad;
    else
      raise exception 'ajuste_modo inválido: %', ajuste_modo;
    end if;
  else
    raise exception 'tipo inválido: %', tipo;
  end if;

  new_stock := current_stock + delta;

  if bloquear_stock_negativo and new_stock < 0 then
    raise exception 'Stock insuficiente: % (actual), cambio %', current_stock, delta;
  end if;

  insert into public.stock_movements (tipo, fecha, wine_id, cantidad, costo_unitario, precio_unitario, proveedor_id, canal, notas)
  values (tipo, fecha, wine_id, cantidad, costo_unitario, precio_unitario, proveedor_id, canal, notas)
  returning * into inserted;

  update public.wines set stock_actual = new_stock where id = wine_id;

  return inserted;
end;
$$;
