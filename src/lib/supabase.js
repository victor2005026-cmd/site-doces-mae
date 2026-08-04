import { createClient } from '@supabase/supabase-js';

// Fallback pro projeto Supabase de produção: a URL e a anon key são
// públicas por design (protegidas por RLS, não por sigilo) — servem só
// pra evitar tela branca caso as REACT_APP_* não sejam injetadas no build
// (ex.: variável de ambiente não configurada na Vercel).
const FALLBACK_URL = 'https://kmfqzsyyxclqrqpavdiw.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZnF6c3l5eGNscXJxcGF2ZGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTk1ODUsImV4cCI6MjA5OTg3NTU4NX0.mGIq1M4IZoVYjYYSP6du9nxELaXCeOuSN7YUm6vzCeY';

const url = process.env.REACT_APP_SUPABASE_URL || FALLBACK_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.error(
    'REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY não vieram do ambiente de build — usando valores de fallback embutidos no código. Confira as Environment Variables no Vercel.'
  );
}

export const supabase = createClient(url, key);
