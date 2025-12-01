const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const sharp = require("sharp");
const { getCurrentAdmin } = require("../lib/auth");

// Middleware to check authentication
async function requireAuth(req, res, next) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.admin = admin;
  next();
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
});

router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "File is required.",
    });
  }

  // Validate file type - only PNG and JPG allowed
  const fileType = req.file.mimetype.toLowerCase();
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const fileName = req.file.originalname.toLowerCase();
  const validExtensions = ['.png', '.jpg', '.jpeg'];
  
  const isValidType = validTypes.includes(fileType) || 
                     validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isValidType) {
    return res.status(400).json({
      message: "Only PNG and JPG images are allowed.",
    });
  }

  const buffer = req.file.buffer;

  // Validate image dimensions (max 1080x1080)
  try {
    const metadata = await sharp(buffer).metadata();
    const maxWidth = 1080;
    const maxHeight = 1080;

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return res.status(400).json({
        message: `Image dimensions must not exceed ${maxWidth}x${maxHeight} pixels. Current size: ${metadata.width}x${metadata.height}px`,
      });
    }
  } catch (error) {
    // If sharp can't process it, it might not be a valid image
    return res.status(400).json({
      message: "Invalid image file. Please upload a valid PNG or JPG image.",
    });
  }

  const uploadsDir = path.join(__dirname, "..", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sanitizedName = req.file.originalname
    .replace(/[^a-z0-9.\-_]/gi, "_")
    .toLowerCase();
  const fileName = `${uniqueSuffix}-${sanitizedName}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, buffer);

  const publicPath = `/uploads/${fileName}`;
  return res.json({ url: publicPath });
});

module.exports = router;


