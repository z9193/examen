import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import { categorias, productos, clientes } from './routes/crud.js';
import ventas from './routes/ventas.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', auth);
app.use('/categorias', categorias);
app.use('/productos', productos);
app.use('/clientes', clientes);
app.use('/ventas', ventas);

app.listen(process.env.PORT || 3000);
