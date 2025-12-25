-- Insert dev user with hashed password for 'devpassword123'
INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
VALUES (
  'clxdev001',
  'info@bastiensoret.com',
  'Bastien Soret',
  '$2b$10$crqhi.jXzCz6nyzZc2SUQO7Y4a4mjalQJxPNAXW83fPcHN8h4.x8y',
  'SUPER_ADMIN',
  datetime('now'),
  datetime('now')
);
