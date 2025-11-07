import pkg from 'pg';
const { Pool } = pkg;
let pool;

export async function initDb() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    console.warn('NEON_DATABASE_URL no definido; operaciones DB deshabilitadas');
    return;
  }
  pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  // Create table if not exists
  await pool.query(`CREATE TABLE IF NOT EXISTS apis (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE,
    instruction TEXT,
    example TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );`);
  console.log('✅ Conectado a Neon/Postgres y tabla asegurada');
}

export async function saveApiMeta({ name, instruction, example }) {
  if (!pool) return;
  await pool.query('INSERT INTO apis (name, instruction, example) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING', [name, instruction, example]);
}

export async function listApis() {
  if (!pool) return [];
  const res = await pool.query('SELECT name, instruction, example, created_at FROM apis ORDER BY created_at DESC LIMIT 100');
  return res.rows;
}
