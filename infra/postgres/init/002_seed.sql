-- Seed de contas de demonstração (apenas para desenvolvimento local).
-- Corre automaticamente na primeira inicialização do volume do Postgres.
-- Se já tiveres um volume existente, este ficheiro NÃO é executado outra vez;
-- usa `npm run backend:seed` para aplicar o seed a uma base de dados já criada.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Admin Techsim', 'admin@techsim.dev', crypt('Admin@123', gen_salt('bf', 10)), 'admin'),
  ('Utilizador Demo', 'user@techsim.dev', crypt('User@123', gen_salt('bf', 10)), 'user')
ON CONFLICT (email) DO NOTHING;
