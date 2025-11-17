# DotBack Backend API

This is the standalone Node.js/Express backend server for the DotBack application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `backend` directory:
```env
MONGO_URL=mongodb://127.0.0.1:27017/DotBack
JWT_SECRET=dotback_secret_key
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
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

The server will start on port 5000 by default (or the port specified in `BACKEND_PORT` environment variable).

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

- `MONGO_URL` - MongoDB connection string (default: `mongodb://127.0.0.1:27017/DotBack`)
- `JWT_SECRET` - Secret key for JWT tokens (default: `dotback_secret_key`)
- `BACKEND_PORT` - Port to run the server on (default: `3001`)
- `FRONTEND_URL` - Frontend URL for CORS configuration (default: `http://localhost:3000`)
- `NODE_ENV` - Environment mode (`development` or `production`)

