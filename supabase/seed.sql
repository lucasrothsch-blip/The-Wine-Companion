insert into public.providers (nombre, contacto_nombre, contacto_email, contacto_tel, condicion_pago_dias, datos_facturacion, observaciones)
values
  ('Distribuidora Andina', 'Laura Vega', 'laura@andina.example', '+54 11 1234-5678', 30, 'CUIT 30-12345678-9', 'Entrega semanal'),
  ('Bodega Premium Supply', 'Martín Ruiz', 'martin@premium.example', '+54 11 8765-4321', 15, 'CUIT 30-98765432-1', 'Catálogo importados')
on conflict do nothing;

with p as (
  select id, nombre from public.providers
)
insert into public.wines (nombre, categoria, cepa, pais, region, bodega, anada, proveedor_id, costo_sin_iva, alicuota_iva, costo_con_iva, precio_venta, stock_actual, stock_minimo_alerta, activo)
values
  ('Malbec Reserva', 'Tinto', 'Malbec', 'Argentina', 'Mendoza', 'Bodega Sur', (extract(year from now())::int - 2), (select id from p where nombre = 'Distribuidora Andina'), 5000, 21, 6050, 9800, 20, 5, true),
  ('Chardonnay Estate', 'Blanco', 'Chardonnay', 'Argentina', 'Valle de Uco', 'Finca Norte', (extract(year from now())::int - 1), (select id from p where nombre = 'Bodega Premium Supply'), 4200, 21, 5082, 8600, 8, 6, true),
  ('Cabernet Sauvignon Roble', 'Tinto', 'Cabernet Sauvignon', 'Chile', 'Maipo', 'Viña del Pacífico', (extract(year from now())::int - 3), (select id from p where nombre = 'Distribuidora Andina'), 5600, 21, 6776, 11000, 4, 4, true)
on conflict do nothing;

insert into public.stock_movements (tipo, fecha, wine_id, cantidad, costo_unitario, precio_unitario, proveedor_id, canal, notas)
select 'ingreso', now() - interval '7 days', w.id, 12, w.costo_con_iva, null, w.proveedor_id, 'compra', 'Carga inicial'
from public.wines w
on conflict do nothing;
