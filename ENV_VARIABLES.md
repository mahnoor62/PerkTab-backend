# Environment Variables - Backend Server

This document lists all environment variables used by the backend server.

## Required Variables

These variables must be defined (for example in `backend/.env`) before starting the server:

- `BACKEND_PORT`
- `MONGO_URL`
- `JWT_SECRET`

## Configuration Variables

### `BACKEND_PORT`
- **Type**: Number
- **Default**: _None_ (required)
- **Description**: Port number for the backend server to listen on
- **Example**: `3000` or `5000`

### `FRONTEND_URL`
- **Type**: String (URL)
- **Default**: `http://localhost:3000`
- **Description**: Frontend URL for CORS configuration
- **Example**: `http://localhost:3000`

## Database Variables

### `MONGO_URL`
- **Type**: String (MongoDB connection string)
- **Default**: _None_ (required)
- **Description**: MongoDB connection string
- **Example**: `mongodb://127.0.0.1:27017/DotBack`

## Security Variables

### `JWT_SECRET`
- **Type**: String
- **Default**: _None_ (required)
- **Description**: Secret key for signing JWT tokens
- **Important**: Must be a secure random string in every environment
- **Example**: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Environment Variables

### `NODE_ENV`
- **Type**: String
- **Default**: `development`
- **Description**: Node.js environment (development, production, test)
- **Values**: `development` | `production` | `test`
- **Usage**: 
  - Affects CORS policy (development allows all origins)
  - Affects cookie security (secure flag in production)

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   BACKEND_PORT=3000
   FRONTEND_URL=http://localhost:3000
   MONGO_URL=mongodb://127.0.0.1:27017/DotBack
   JWT_SECRET=your_secure_secret_here
   NODE_ENV=development
   ```

3. For production, generate a secure JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Usage in Code

All environment variables are accessed via `process.env.VARIABLE_NAME`:

```javascript
const PORT = process.env.BACKEND_PORT;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const mongoUrl = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
```

## Validation

The server validates required environment variables on startup:
- Throws an error if `BACKEND_PORT`, `MONGO_URL`, or `JWT_SECRET` are missing
- Warns if neither `FRONTEND_URL` nor `ALLOWED_ORIGINS` are configured
- Shows configuration on startup

## Security Notes

⚠️ **IMPORTANT**: 
- Always change `JWT_SECRET` in production
- Never commit `.env` file to version control
- Use strong, random strings for secrets
- Keep `JWT_SECRET` secure and private

