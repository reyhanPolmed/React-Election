# Election Backend API

Backend API untuk sistem pemilihan umum menggunakan Express.js dan Sequelize.

## Fitur

### Authentication & Authorization
- Register pengguna dengan validasi NIK
- Login dengan JWT token
- Middleware authentication dan authorization
- Role-based access (voter, admin)

### User Management
- Profile management
- User verification system
- Password change functionality

### Election Management
- CRUD operations untuk pemilihan
- Status management (upcoming, active, completed)
- Time-based voting restrictions

### Candidate Management
- CRUD operations untuk kandidat
- Candidate numbering system
- Photo upload support

### Voting System
- Secure voting dengan hash verification
- One vote per user per election
- Anonymous voting dengan vote hash
- Vote verification system

### Admin Dashboard
- Real-time statistics
- User management
- Election results
- Voting analytics

## Installation

1. Clone repository
\`\`\`bash
git clone <repository-url>
cd election-backend
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Setup environment variables
\`\`\`bash
cp .env.example .env
# Edit .env file dengan konfigurasi database dan JWT secret
\`\`\`

4. Setup database
\`\`\`bash
# Create database
mysql -u root -p -e "CREATE DATABASE election_db;"

# Run migrations
npm run migrate

# Create admin user (optional)
mysql -u root -p election_db < scripts/create-admin.sql

# Create sample election data (optional)
mysql -u root -p election_db < scripts/sample-election.sql
\`\`\`

5. Start server
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Candidates
- `GET /api/candidates/election/:electionId` - Get candidates by election
- `GET /api/candidates/:id` - Get single candidate
- `POST /api/candidates` - Create candidate (Admin)
- `PUT /api/candidates/:id` - Update candidate (Admin)
- `DELETE /api/candidates/:id` - Delete candidate (Admin)

### Voting
- `POST /api/votes` - Cast vote
- `GET /api/votes/status/:electionId` - Get vote status
- `GET /api/votes/verify/:voteHash` - Verify vote

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/verify` - Verify user
- `GET /api/admin/elections` - Get all elections
- `POST /api/admin/elections` - Create election
- `PUT /api/admin/elections/:id/status` - Update election status
- `GET /api/admin/elections/:id/results` - Get election results
- `GET /api/admin/analytics/voting` - Get voting analytics

## Database Schema

### Users
- id, email, password, fullName, nik, dateOfBirth, address, phone
- role (voter/admin), isVerified, hasVoted, lastLogin

### Elections
- id, title, description, startDate, endDate, status, maxVotesPerUser

### Candidates
- id, name, party, description, photo, candidateNumber, electionId, voteCount

### Votes
- id, userId, candidateId, electionId, voteHash, ipAddress, userAgent

## Security Features

- Password hashing dengan bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Anonymous voting dengan hash system

## Environment Variables

\`\`\`env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=election_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

## Usage Examples

### Register User
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "nik": "1234567890123456",
    "dateOfBirth": "1990-01-01",
    "address": "Jl. Example No. 123",
    "phone": "081234567890"
  }'
\`\`\`

### Cast Vote
\`\`\`bash
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "candidateId": 1,
    "electionId": 1
  }'
\`\`\`

## Development

- Gunakan `npm run dev` untuk development dengan nodemon
- Database akan auto-sync saat server start
- Gunakan `npm run migrate` untuk menjalankan migrations
- Gunakan `npm run seed` untuk menjalankan seeders

## Production Deployment

1. Set NODE_ENV=production
2. Gunakan database production
3. Set JWT_SECRET yang kuat
4. Gunakan HTTPS
5. Setup reverse proxy (nginx)
6. Setup monitoring dan logging
