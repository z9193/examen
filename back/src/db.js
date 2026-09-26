import 'dotenv/config';
import dns from 'node:dns';
import { createClient } from '@supabase/supabase-js';

dns.setDefaultResultOrder('ipv4first');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const db = createClient(
  (process.env.SUPABASE_URL || '').trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
);
