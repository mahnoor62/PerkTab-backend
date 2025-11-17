# Setting Up Environment Variables - Backend

## Problem: Environment Variables Not Loading

If your `.env` file values are not being picked up, it's because Node.js doesn't automatically load `.env` files. You need to use the `dotenv` package.

## Solution: Install and Configure dotenv

### Step 1: Install dotenv

```bash
cd backend
npm install dotenv
```

### Step 2: Verify dotenv is in package.json

Check that `dotenv` is listed in dependencies:
```json
{
  "dependencies": {
    "dotenv": "^16.3.1",
    ...
  }
}
```

### Step 3: Verify server.js loads dotenv

Make sure `server.js` has this at the **very top** (before any other code):
```javascript
// Load environment variables from .env file
require("dotenv").config();
```

### Step 4: Create .env file

Create `backend/.env` file (in the backend folder, not root):
```env
# MongoDB Connection String
MONGO_URL=mongodb://127.0.0.1:27017/DotBack

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Backend Port
BACKEND_PORT=5000

# JWT Secret
JWT_SECRET=change_me_to_a_secure_secret

# Node Environment
NODE_ENV=development
```

### Step 5: Verify .env file location

**Important:** The `.env` file must be in the `backend/` folder, not the root folder.

```
dot-back/
├── .env.local          ← Frontend env (in root)
├── backend/
│   ├── .env           ← Backend env (HERE!)
│   ├── server.js
│   └── package.json
└── ...
```

## Testing

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Check console output:**
   You should see:
   ```
   📋 Environment Variables:
      BACKEND_PORT: 5000
      FRONTEND_URL: http://localhost:3000
      MONGO_URL: ✅ Set
      JWT_SECRET: ✅ Set
      NODE_ENV: development
   
   ✅ Backend server running on port 5000
   ```

   If you see `3000 (default)` instead of `5000`, the `.env` file is not being loaded.

## Troubleshooting

### Issue: Still shows default port 3000

**Check:**
1. ✅ `dotenv` is installed: `npm list dotenv`
2. ✅ `require("dotenv").config()` is at the top of `server.js`
3. ✅ `.env` file exists in `backend/` folder (not root)
4. ✅ `.env` file has `BACKEND_PORT=5000` (no spaces around `=`)
5. ✅ Restart the server after creating `.env`

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
cd backend
npm install dotenv
```

### Issue: Environment variables show as undefined

**Check:**
1. ✅ `.env` file is in `backend/` folder
2. ✅ No typos in variable names (case-sensitive)
3. ✅ No spaces around `=` sign: `BACKEND_PORT=5000` (not `BACKEND_PORT = 5000`)
4. ✅ No quotes around values: `BACKEND_PORT=5000` (not `BACKEND_PORT="5000"`)

### Issue: Server starts but on wrong port

**Verify .env file:**
- Open `backend/.env`
- Check `BACKEND_PORT=5000` exists
- Make sure there's no trailing spaces
- Try: `echo %BACKEND_PORT%` (Windows) or `echo $BACKEND_PORT` (Linux/Mac) - this won't work because Node.js loads it, but check the file directly

## Common Mistakes

❌ **Wrong location**: `.env` file in root folder instead of `backend/`
❌ **Typo in filename**: `.env` not `.env.local` or `.env.example`
❌ **Spaces around =**: `BACKEND_PORT = 5000` (should be `BACKEND_PORT=5000`)
❌ **Quotes around value**: `BACKEND_PORT="5000"` (should be `BACKEND_PORT=5000`)
❌ **Missing dotenv**: Forgot to run `npm install dotenv`
❌ **Not loading**: `require("dotenv").config()` not at top of server.js

## Verification Checklist

- [ ] `dotenv` is in `backend/package.json` dependencies
- [ ] `require("dotenv").config()` is at top of `backend/server.js`
- [ ] `.env` file exists in `backend/` folder
- [ ] `.env` file has `BACKEND_PORT=5000`
- [ ] No spaces around `=` in `.env`
- [ ] Server restarted after creating `.env`
- [ ] Console shows correct port when server starts

