// Quick script to verify backend is running and accessible
const http = require("http");
const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const derivedBackendUrl =
  process.env.BACKEND_URL;

if (!derivedBackendUrl) {
  throw new Error(
    "Define BACKEND_URL or both BACKEND_HOST and BACKEND_PORT in backend/.env before running this script."
  );
}

console.log(`Checking if backend is accessible at ${derivedBackendUrl}...`);

const parsedUrl = new URL(derivedBackendUrl);
const requestPort = parsedUrl.port
  ? parseInt(parsedUrl.port, 10)
  : parsedUrl.protocol === "https:" ? 443 : 80;

const options = {
  hostname: parsedUrl.hostname,
  port: requestPort,
  path: "/health",
  method: "GET",
  timeout: 5000,
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running! Status: ${res.statusCode}`);
  let data = "";
  
  res.on("data", (chunk) => {
    data += chunk;
  });
  
  res.on("end", () => {
    console.log("Response:", data);
    process.exit(0);
  });
});

req.on("error", (error) => {
  console.error(`❌ Cannot connect to backend: ${error.message}`);
  console.error(`\nMake sure the backend is running:`);
  console.error(`  cd backend && npm run dev`);
  process.exit(1);
});

req.on("timeout", () => {
  console.error(`❌ Connection timeout`);
  req.destroy();
  process.exit(1);
});

req.end();

