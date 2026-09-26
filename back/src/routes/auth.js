import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { auth } from '../auth.js';

const r = Router();
const token = (u) =>
  jwt.sign({ id: u.id, email: u.email, rol: u.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });

const rolDb = (rol) => (rol === 'admin' ? 'admin' : 'vendedor');

function errMsg(e) {
  return e?.message || String(e) + (e?.cause ? ' (' + (e.cause.code || e.cause.message || e.cause) + ')' : '');
}

export async function seedAdmin() {
  const email = 'admin@refaccionaria.com';
  const password_hash = await bcrypt.hash('admin123', 10);
  try {
    const { data, error } = await db.from('usuarios').select('id').eq('email', email).maybeSingle();
    if (error) {
      console.log('seed admin select:', errMsg(error));
      return;
    }
    if (data) {
      const up = await db.from('usuarios').update({ password_hash, rol: 'admin' }).eq('email', email);
      console.log(up.error ? 'seed admin update: ' + errMsg(up.error) : 'Admin listo: admin@refaccionaria.com / admin123');
      return;
    }
    const ins = await db.from('usuarios').insert({
      nombre: 'Admin',
      email,
      password_hash,
      rol: 'admin',
    });
    console.log(ins.error ? 'seed admin insert: ' + errMsg(ins.error) : 'Admin creado: admin@refaccionaria.com / admin123');
  } catch (e) {
    console.log('seed admin:', errMsg(e));
  }
}

async function passOk(password, u) {
  const hash = String(u.password_hash || u.password || '');
  if (!password || !hash) return false;
  if (password === hash) return true;
  if (hash.startsWith('$2')) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (e) {
      console.log('login: Error bcrypt', e.message);
      return false;
    }
  }
  return false;
}

async function crearUsuario({ nombre, email, password, rol }) {
  const password_hash = await bcrypt.hash(password, 10);
  return db
    .from('usuarios')
    .insert({ nombre: nombre || email, email, password_hash, rol: rolDb(rol) })
    .select('id,nombre,email,rol')
    .single();
}

r.post('/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });
  const { data, error } = await crearUsuario({ nombre, email, password, rol });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ user: data, token: token(data) });
});

r.post('/login', async (req, res) => {
  const email = req.body.email || req.body.correo;
  const password = req.body.password || req.body.contrasena || req.body.contraseña;
  if (!email || !password) {
    console.log('login: Faltan email o password');
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const { data: u, error } = await db.from('usuarios').select('*').eq('email', email).maybeSingle();
  if (error) {
    console.log('login: Error BD', error.message);
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  if (!u) {
    console.log('login: Usuario no encontrado', email);
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  if (!(await passOk(password, u))) {
    console.log('login: Contraseña no coincide', email);
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

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
