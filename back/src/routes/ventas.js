import { Router } from 'express';
import { db } from '../db.js';
import { auth } from '../auth.js';

const r = Router();
r.use(auth);

r.get('/', async (_, res) => {
  const { data, error } = await db
    .from('ventas')
    .select('*, venta_detalle(*), clientes(nombre), usuarios(nombre)');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

r.get('/:id', async (req, res) => {
  const { data, error } = await db
    .from('ventas')
    .select('*, venta_detalle(*), clientes(nombre), usuarios(nombre)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

r.post('/', async (req, res) => {
  const { cliente_id, items } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'Sin items' });

  let total = 0;
  const detalle = [];
  for (const i of items) {
    const { data: p, error } = await db.from('productos').select('*').eq('id', i.producto_id).single();
    if (error || !p) return res.status(400).json({ error: 'Producto inválido' });
    if (p.stock < i.cantidad) return res.status(400).json({ error: `Stock insuficiente: ${p.nombre}` });
    const precio = Number(p.precio);
    total += precio * i.cantidad;
    detalle.push({ producto_id: p.id, cantidad: i.cantidad, precio_unitario: precio });
  }

  const { data: venta, error: e1 } = await db
    .from('ventas')
    .insert({ cliente_id, usuario_id: req.user.id, total })
    .select()
    .single();
  if (e1) return res.status(400).json({ error: e1.message });

  const { error: e2 } = await db
    .from('venta_detalle')
    .insert(detalle.map((d) => ({ ...d, venta_id: venta.id })));
  if (e2) return res.status(400).json({ error: e2.message });

  for (const i of items) {
    const { data: p } = await db.from('productos').select('stock').eq('id', i.producto_id).single();
    await db.from('productos').update({ stock: p.stock - i.cantidad }).eq('id', i.producto_id);
  }

  const { data } = await db
    .from('ventas')
    .select('*, venta_detalle(*)')
    .eq('id', venta.id)
    .single();
  res.status(201).json(data);
});

export default r;
