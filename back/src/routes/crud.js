import { Router } from 'express';
import { db } from '../db.js';
import { auth, admin } from '../auth.js';

const crud = (table, fields) => {
  const r = Router();
  r.use(auth);
  r.get('/', async (_, res) => {
    const { data, error } = await db.from(table).select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  r.get('/:id', async (req, res) => {
    const { data, error } = await db.from(table).select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: error.message });
    res.json(data);
  });
  r.post('/', admin, async (req, res) => {
    const row = Object.fromEntries(fields.map((f) => [f, req.body[f]]));
    const { data, error } = await db.from(table).insert(row).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  });
  r.put('/:id', admin, async (req, res) => {
    const row = Object.fromEntries(fields.filter((f) => f in req.body).map((f) => [f, req.body[f]]));
    const { data, error } = await db.from(table).update(row).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  r.delete('/:id', admin, async (req, res) => {
    const { error } = await db.from(table).delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).end();
  });
  return r;
};

export const categorias = crud('categorias', ['nombre']);
export const productos = crud('productos', [
  'sku',
  'nombre',
  'descripcion',
  'marca',
  'modelo_auto',
  'categoria_id',
  'precio',
  'stock',
]);
export const clientes = crud('clientes', ['nombre', 'telefono', 'email']);
