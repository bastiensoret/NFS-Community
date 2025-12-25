-- Update dev user with correct password hash for 'devpassword123'
UPDATE User 
SET password = '$2b$10$zUhXikuYpdYU4VYFEUYIf.zYJj18/80rLHSxnOBnE4FLlG/miylV2',
    updatedAt = datetime('now')
WHERE email = 'info@bastiensoret.com';
