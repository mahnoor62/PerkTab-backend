// Quick script to verify backend is running and accessible
const http = require("http");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

console.log(`Checking if backend is accessible at ${BACKEND_URL}...`);

const options = {
  hostname: new URL(BACKEND_URL).hostname,
  port: new URL(BACKEND_URL).port || 5000,
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

