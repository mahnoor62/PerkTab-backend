# Environment Variables - Backend Server

This document lists all environment variables used by the backend server.

## Required Variables

None of these are strictly required (all have defaults), but should be configured for production.

## Configuration Variables

### `BACKEND_PORT`
- **Type**: Number
- **Default**: `3000`
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
- **Default**: `mongodb://127.0.0.1:27017/DotBack`
- **Description**: MongoDB connection string
- **Example**: `mongodb://127.0.0.1:27017/DotBack`

## Security Variables

### `JWT_SECRET`
- **Type**: String
- **Default**: `dotback_secret_key` (⚠️ **CHANGE IN PRODUCTION!**)
- **Description**: Secret key for signing JWT tokens
- **Important**: Must be changed to a secure random string in production
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
const PORT = process.env.BACKEND_PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/DotBack";
const jwtSecret = process.env.JWT_SECRET || "dotback_secret_key";
```

## Validation

The server validates environment variables on startup:
- Warns if using default JWT_SECRET (security risk in production)
- Shows configuration on startup

## Security Notes

⚠️ **IMPORTANT**: 
- Always change `JWT_SECRET` in production
- Never commit `.env` file to version control
- Use strong, random strings for secrets
- Keep `JWT_SECRET` secure and private

