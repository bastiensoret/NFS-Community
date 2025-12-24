-- Insert dev user with hashed password for 'devpassword123'
INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
VALUES (
  'clxdev001',
  'bastiensoret@gmail.com',
  'Bastien Soret',
  '$2b$10$a7TSFDic9imV7C5IDplpQ.BrpLwde8NzKEbHKzagVKcyS4Ujk/1J.',
  'SUPER_ADMIN',
  datetime('now'),
  datetime('now')
)
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  role = excluded.role,
  updatedAt = datetime('now');
