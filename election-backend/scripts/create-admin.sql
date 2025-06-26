-- Create admin user
-- Make sure to change the password hash in production
INSERT INTO users (
  email, 
  password, 
  fullName, 
  nik, 
  dateOfBirth, 
  address, 
  phone, 
  role, 
  isVerified, 
  createdAt, 
  updatedAt
) VALUES (
  'admin@election.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PqhEIe', -- password: admin123
  'System Administrator',
  '1234567890123456',
  '1990-01-01',
  'System Address',
  '081234567890',
  'admin',
  true,
  NOW(),
  NOW()
);
