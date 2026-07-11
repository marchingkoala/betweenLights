-- Demo admin account for portfolio deploys.
-- Apply after schema + products seeds:
--   psql "$DATABASE_URL" -f backend/db/seeds/002_admin.sql
--
-- Login:
--   email:    admin@admin.com
--   password: Admin123!
--
-- Change this password after first login in a real environment.

INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at)
VALUES (
  '61c0ce68-3729-43ed-b8e7-fc71b0460d1c',
  'admin@admin.com',
  '$2b$10$VxkV5DFk0ySRB/umA9EBW.cywI1FwMiHUNhktpLWu5So5lnsTNaBO',
  'admin',
  'role',
  'admin',
  now()
)
ON CONFLICT (email) DO NOTHING;
