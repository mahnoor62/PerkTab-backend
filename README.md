# DotBack Backend API

This is the standalone Node.js/Express backend server for the DotBack application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `backend` directory:
```env
# Required variables
BACKEND_PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/DotBack
JWT_SECRET=change_me_to_a_secure_secret

# CORS configuration (at least one required)
FRONTEND_URL=http://localhost:3000
# OR use ALLOWED_ORIGINS for multiple origins (comma-separated)
# ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com
# OR use CORS_PATTERN for regex pattern (e.g., for Vercel deployments)
# CORS_PATTERN=^https:\/\/.*\.vercel\.app$

# Optional configuration
NODE_ENV=development
LOCALHOST_PORT=3000  # Only used in development mode
BACKEND_HOST=localhost  # Hostname for server logs
COOKIE_DOMAIN=  # Optional cookie domain (e.g., .yourdomain.com)
```

3. Create the `uploads` directory (for file uploads):
```bash
mkdir uploads
```

## Running

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Seed default levels (run once per database):
```bash
npm run seed:levels
```

The server will start on the port specified in `BACKEND_PORT` environment variable (required).

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/create` - Create new admin (requires authentication)

### Levels
- `GET /api/levels` - Get all levels
- `POST /api/levels` - Create a new level
- `GET /api/levels/:level` - Get a specific level
- `PUT /api/levels/:level` - Update a specific level
- `DELETE /api/levels/:level` - Delete a specific level

### Upload
- `POST /api/upload` - Upload an image file

## Environment Variables

### Required Variables
- `BACKEND_PORT` - Port to run the server on (e.g., `5000`)
- `MONGO_URL` - MongoDB connection string (e.g., `mongodb://127.0.0.1:27017/DotBack`)
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string in production)

### CORS Configuration (at least one required)
- `FRONTEND_URL` - Primary frontend URL for CORS (e.g., `http://localhost:3000` or `https://your-frontend.com`)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (e.g., `http://localhost:3000,https://staging.example.com,https://app.example.com`)
- `CORS_PATTERN` - Regex pattern for allowed origins (e.g., `^https:\/\/.*\.vercel\.app$` for all Vercel deployments)

### Optional Variables
- `NODE_ENV` - Environment mode (`development` or `production`, defaults to `development`)
- `LOCALHOST_PORT` - Local port for development CORS (e.g., `3000`, only used in development)
- `BACKEND_HOST` - Hostname for server logs (defaults to `localhost`)
- `COOKIE_DOMAIN` - Cookie domain for cross-subdomain cookies (e.g., `.yourdomain.com`)

### Production Example
```env
NODE_ENV=production
BACKEND_PORT=5000
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/DotBack
JWT_SECRET=your_super_secure_random_secret_key_here
FRONTEND_URL=https://your-frontend.com
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
CORS_PATTERN=^https:\/\/.*\.vercel\.app$
COOKIE_DOMAIN=.yourdomain.com
```

