import bcrypt from 'bcryptjs';
import { query, pool } from './pool.js';

// Contas de demonstração para desenvolvimento local.
// NUNCA usar estas credenciais num ambiente de produção.
const SEED_USERS = [
  { name: 'Admin Techsim', email: 'admin@techsim.dev', password: 'Admin@123', role: 'admin' },
  { name: 'Utilizador Demo', email: 'user@techsim.dev', password: 'User@123', role: 'user' },
];

async function seed() {
  for (const seedUser of SEED_USERS) {
    const passwordHash = await bcrypt.hash(seedUser.password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING id, email, role`,
      [seedUser.name, seedUser.email, passwordHash, seedUser.role]
    );
    const row = result.rows[0];
    console.log(`✓ ${row.email} (${row.role})`);
  }
}

seed()
  .then(() => {
    console.log('\nSeed concluído. Credenciais de teste:');
    for (const seedUser of SEED_USERS) {
      console.log(`  - ${seedUser.role.padEnd(5)} → ${seedUser.email} / ${seedUser.password}`);
    }
  })
  .catch(error => {
    console.error('Falha ao correr o seed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
