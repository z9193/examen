import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { auth } from '../auth.js';

const r = Router();
const token = (u) =>
  jwt.sign({ id: u.id, email: u.email, rol: u.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });

r.post('/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await db
    .from('usuarios')
    .insert({ nombre, email, password_hash, rol: rol || 'vendedor' })
    .select('id,nombre,email,rol')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ user: data, token: token(data) });
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: u, error } = await db.from('usuarios').select('*').eq('email', email).single();
  if (error || !u) return res.status(401).json({ error: 'Credenciales inválidas' });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  res.json({
    user: { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol },
    token: token(u),
  });
});

r.get('/me', auth, async (req, res) => {
  const { data, error } = await db
    .from('usuarios')
    .select('id,nombre,email,rol,created_at')
    .eq('id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

export default r;
