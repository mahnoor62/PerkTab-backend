# Backend CORS Configuration

This guide explains how to configure CORS (Cross-Origin Resource Sharing) for the backend server.

## Problem

When the frontend (deployed on Vercel at `https://perk-tab-website.vercel.app`) tries to connect to the backend (`https://perktab-backend.tecshield.net`), the browser may block the request due to CORS policy if the backend doesn't explicitly allow the frontend origin.

## CORS Configuration

The backend uses Express `cors` middleware with dynamic origin configuration based on environment variables.

### Environment Variables

Set these in your backend `.env` file:

**For Production:**
```env
NODE_ENV=production
FRONTEND_URL=https://perk-tab-website.vercel.app
ALLOWED_ORIGINS=https://perk-tab-website.vercel.app,http://localhost:3000
BACKEND_HOST=0.0.0.0
BACKEND_PORT=5000
```

**For Local Development:**
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
LOCALHOST_PORT=3000
BACKEND_HOST=localhost
BACKEND_PORT=5000
```

### How CORS Works

The backend checks incoming requests and allows them if:

1. **Origin matches FRONTEND_URL** - If `FRONTEND_URL` is set, it's automatically allowed
2. **Origin matches ALLOWED_ORIGINS** - Comma-separated list of allowed origins
3. **Origin matches CORS_PATTERN** - Optional regex pattern (e.g., `/^https:\/\/.*\.vercel\.app$/`)
4. **Development mode** - If `NODE_ENV=development` and no origins configured, all origins are allowed
5. **No origin** - Requests without origin header (like curl) are always allowed

### CORS Headers

The backend sends these CORS headers:

- `Access-Control-Allow-Origin: <allowed-origin>`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization, Cookie, authorization, content-type`
- `Access-Control-Expose-Headers: Set-Cookie`

### Preflight Requests (OPTIONS)

The backend automatically handles OPTIONS preflight requests for all routes via:
```javascript
app.options("*", cors(corsOptions));
```

## Server Configuration

### Listening Host

**Important for Production:**

In production, the server must listen on `0.0.0.0` (all interfaces) to accept connections from outside the server:

```env
BACKEND_HOST=0.0.0.0
NODE_ENV=production
```

This is automatically configured - if `NODE_ENV=production` and `BACKEND_HOST` is not set, it defaults to `0.0.0.0`.

### Port Configuration

The backend listens on the port specified in `BACKEND_PORT`:

```env
BACKEND_PORT=5000
```

**Note:** If you're using a reverse proxy (Nginx, Caddy, Apache), the proxy should forward HTTPS (port 443) to your backend (e.g., port 5000).

## Reverse Proxy Setup

If your backend is behind a reverse proxy (common in production):

### Nginx Example

```nginx
server {
    listen 443 ssl;
    server_name perktab-backend.tecshield.net;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy Example

```
perktab-backend.tecshield.net {
    reverse_proxy localhost:5000
}
```

## Testing CORS Configuration

### 1. Check Backend Health

```bash
curl https://perktab-backend.tecshield.net/health
# Should return: {"status":"ok"}

curl https://perktab-backend.tecshield.net/api/health
# Should return: {"status":"ok","timestamp":"...","environment":"production"}
```

### 2. Test CORS Preflight

```bash
curl -X OPTIONS https://perktab-backend.tecshield.net/api/auth/session \
  -H "Origin: https://perk-tab-website.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization" \
  -v
```

Look for these headers in the response:
- `Access-Control-Allow-Origin: https://perk-tab-website.vercel.app`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`

### 3. Test Actual Request

```bash
curl https://perktab-backend.tecshield.net/api/auth/session \
  -H "Origin: https://perk-tab-website.vercel.app" \
  -H "Authorization: <your-token>" \
  -v
```

### 4. Browser Console Check

1. Open your production website: `https://perk-tab-website.vercel.app`
2. Open Browser DevTools → Network tab
3. Try to log in or make an API request
4. Check the request:
   - **Status**: Should be 200, 401 (if not logged in), etc. - NOT CORS error
   - **Response Headers**: Should include `Access-Control-Allow-Origin`
   - **Console**: Should NOT show CORS error

If you see CORS errors in the browser console, the backend is not allowing your frontend origin.

## Common Issues

### "No 'Access-Control-Allow-Origin' header"

**Problem:** Backend is not allowing the frontend origin.

**Solution:**
1. Check `FRONTEND_URL` or `ALLOWED_ORIGINS` in backend `.env`
2. Verify the origin exactly matches (including protocol: `https://` not `http://`)
3. Restart the backend server after changing environment variables
4. Check backend logs for CORS blocking messages

### "Network Error" / Request Timeout

**Problem:** Backend is not reachable at the URL.

**Solution:**
1. Verify backend is running: `curl https://perktab-backend.tecshield.net/health`
2. Check backend is listening on `0.0.0.0:5000` (not just `localhost`)
3. Verify reverse proxy is forwarding requests correctly
4. Check firewall/security group rules

### CORS works in browser but not from frontend

**Problem:** Browser cached old CORS headers or frontend is using wrong URL.

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Verify `NEXT_PUBLIC_API_URL` in frontend environment variables
4. Check browser console for actual API URL being used

## Logging

The backend logs CORS-related information:

- `[CORS] ✅ Allowed origin: <origin>` - Request allowed
- `[CORS] ❌ Blocked origin: <origin>` - Request blocked
- `[CORS] Allowed origins: [...]` - Shows configured allowed origins

Check backend logs to debug CORS issues.

## Summary

**For Production Backend:**
```env
NODE_ENV=production
FRONTEND_URL=https://perk-tab-website.vercel.app
ALLOWED_ORIGINS=https://perk-tab-website.vercel.app,http://localhost:3000
BACKEND_HOST=0.0.0.0
BACKEND_PORT=5000
```

**For Local Development:**
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_HOST=localhost
BACKEND_PORT=5000
```

**Key Points:**
- Set `FRONTEND_URL` or `ALLOWED_ORIGINS` to allow your frontend
- In production, use `BACKEND_HOST=0.0.0.0` to listen on all interfaces
- Restart backend after changing environment variables
- Check backend logs for CORS blocking messages

