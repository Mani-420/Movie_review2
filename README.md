# Movie Review Platform Backend

A RESTful backend API service for a movie review platform with role-based access control.

## Features

- 🔐 JWT-based authentication
- 📧 OTP verification (email/SMS)
- 👥 Role-based access (Admin/User)
- 🎬 Movie management (CRUD)
- ⭐ Review system
- 🛡️ Secure password hashing
- ✅ Request validation with Zod

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
copy .env.example .env
```

Edit `.env` with your database and other configuration details:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=movie_review_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Database Setup

Run the database migrations to create all necessary tables:

```bash
npm run migrate
```

Check migration status:

```bash
node src/database/migrate.js status
```

### 4. Start the Server

Development mode (with auto-restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## Database Structure

### Users Table

- Stores user authentication and profile data
- Supports OTP verification for signup and password reset
- Role-based access control (admin/user)

### Movies Table

- Contains movie information (title, description, cast, etc.)
- Tracks average ratings and review counts
- Managed by admins only

### Reviews Table

- User reviews and ratings for movies
- Enforces one review per user per movie
- Supports rating scale 1-5

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register with OTP verification
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### User Management

- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update profile
- `DELETE /api/users/me` - Delete account

### Movies (Public)

- `GET /api/movies` - List all movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:id/reviews` - Get movie reviews

### Admin (Admin Only)

- `POST /api/admin/movies` - Add new movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie
- `GET /api/admin/movies` - Get all movies with admin data

### Reviews (Authenticated Users)

- `POST /api/reviews/movies/:id` - Post review
- `PUT /api/reviews/:id` - Update own review
- `DELETE /api/reviews/:id` - Delete own review
- `GET /api/reviews/user/:userId` - Get user's reviews

## Migration Commands

```bash
# Run all pending migrations
npm run migrate

# Check migration status
node src/database/migrate.js status

# Run migrations manually
node src/database/migrate.js run
```

## Project Structure

```
src/
├── database/
│   ├── connection.js     # Database connection setup
│   └── migrate.js        # Migration runner
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   ├── role.js          # Role-based access middleware
│   └── errorHandler.js  # Global error handling
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── movies.js        # Movie routes (public)
│   ├── admin.js         # Admin-only routes
│   └── reviews.js       # Review management routes
└── index.js             # Main application entry point

migrations/
├── 001_create_users_table.sql
├── 002_create_movies_table.sql
└── 003_create_reviews_table.sql
```

## Development

1. **Database**: MySQL 5.7+ or 8.0+
2. **Node.js**: Version 16+ recommended
3. **Environment**: Copy `.env.example` to `.env` and configure

## Health Check

Visit `http://localhost:3000/health` to check if the server is running properly.

## Next Steps

1. Implement authentication logic in route handlers
2. Add request validation schemas with Zod
3. Implement OTP email/SMS service
4. Add movie search and filtering
5. Implement rate limiting
6. Add API documentation with Swagger

## License

MIT
