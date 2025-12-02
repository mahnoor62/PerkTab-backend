const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");

// Predefined dot sizes that cycle: 20, 40, 60, 80, 100
const PREDEFINED_DOT_SIZES = [20, 40, 60, 80, 100];

// Predefined size scores that cycle: 10, 7, 5, 3, 1
const PREDEFINED_SIZE_SCORES = [10, 7, 5, 3, 1];

// Color scores mapping
const COLOR_SCORES = {
  "#e92434": 5,    // red
  "#ff9e1d": 15,   // orange
  "#e9e224": 10,   // yellow
  "#000000": 20,   // black
  "#36ceba": 25,   // cyan
  "#ffffff": 30,   // white
  "#fff": 30,      // white (alternative)
  "white": 30,
  "black": 20,
  "red": 5,
  "yellow": 10,
  "orange": 15,
  "cyan": 25,
};

// Get predefined dot size based on index (cycles through sizes)
function getPredefinedDotSize(dotIndex) {
  return PREDEFINED_DOT_SIZES[dotIndex % PREDEFINED_DOT_SIZES.length];
}

// Get predefined size score based on index (cycles through scores)
function getPredefinedSizeScore(dotIndex) {
  return PREDEFINED_SIZE_SCORES[dotIndex % PREDEFINED_SIZE_SCORES.length];
}

// Format size with "px" if it's a number, otherwise return as-is
function formatSize(size) {
  if (!size) return "";
  const sizeStr = String(size).trim();
  // If it already has a unit (px, em, rem, etc.), return as-is
  if (/px|em|rem|%|vh|vw|cm|mm|in|pt|pc$/i.test(sizeStr)) {
    return sizeStr;
  }
  // If it's a number, add "px"
  const num = parseFloat(sizeStr);
  if (!isNaN(num) && isFinite(num)) {
    return `${num}px`;
  }
  return sizeStr;
}


// Get color score based on color value
function getColorScore(color) {
  if (!color) return 0;
  
  const normalizedColor = color.trim().toLowerCase();
  
  // Check exact matches first
  if (COLOR_SCORES[normalizedColor] !== undefined) {
    return COLOR_SCORES[normalizedColor];
  }
  
  // Check hex colors (normalize to lowercase)
  const hexColor = normalizedColor.startsWith("#") 
    ? normalizedColor 
    : `#${normalizedColor}`;
  
  if (COLOR_SCORES[hexColor] !== undefined) {
    return COLOR_SCORES[hexColor];
  }
  
  // Try to match common color names in hex
  const colorMap = {
    "#e92434": 5,    // red
    "#ff9e1d": 15,   // orange
    "#e9e224": 10,   // yellow
    "#000000": 20,   // black
    "#36ceba": 25,   // cyan
    "#ffffff": 30,   // white
    "#fff": 30,
  };
  
  // Normalize hex color (remove spaces, ensure # prefix)
  const cleanHex = hexColor.replace(/\s+/g, "").toLowerCase();
  if (colorMap[cleanHex] !== undefined) {
    return colorMap[cleanHex];
  }
  
  // For other colors, default to 0 or calculate based on brightness
  // For now, return 0 for unknown colors
  return 0;
}

// ✅ Hamesha DB se jo hai wohi return karo
async function getAllLevelConfigs() {
  await connectToDatabase();

  const levels = await LevelConfig.find()
    .sort({ level: 1 })
    .lean();

  const result = levels.map((level) => {
    // Explicitly construct response with all fields, ensuring dots is always an array
    const levelObj = {
      _id: level._id.toString(),
      level: level.level,
      background: level.background ?? "",
      logoUrl: level.logoUrl ?? "",
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
    };
    
    // Always include dots array, even if it doesn't exist in DB
    // Migrate old format (with score) to new format (with sizeScore and colorScore)
    if (level.dots !== undefined && level.dots !== null && Array.isArray(level.dots)) {
      levelObj.dots = level.dots.map((dot, index) => {
        const predefinedSize = getPredefinedDotSize(index);
        const predefinedSizeScore = getPredefinedSizeScore(index);
        const colorScore = getColorScore(dot.color);
        
        // Convert to numbers and calculate total - ensure they are always numbers
        let sizeScoreNum;
        if (typeof dot.sizeScore === 'number') {
          sizeScoreNum = dot.sizeScore;
        } else if (dot.sizeScore !== undefined && dot.sizeScore !== null && dot.sizeScore !== "") {
          sizeScoreNum = parseInt(dot.sizeScore, 10);
          if (isNaN(sizeScoreNum)) {
            sizeScoreNum = predefinedSizeScore;
          }
        } else {
          sizeScoreNum = predefinedSizeScore;
        }
        
        let colorScoreNum;
        if (typeof dot.colorScore === 'number') {
          colorScoreNum = dot.colorScore;
        } else if (dot.colorScore !== undefined && dot.colorScore !== null && dot.colorScore !== "") {
          colorScoreNum = parseInt(dot.colorScore, 10);
          if (isNaN(colorScoreNum)) {
            colorScoreNum = colorScore;
          }
        } else {
          colorScoreNum = colorScore;
        }
        
        // If old format (has score but no sizeScore/colorScore), migrate it
        if (dot.score !== undefined && (dot.sizeScore === undefined || dot.colorScore === undefined)) {
          let oldColorScore;
          if (typeof dot.score === 'number') {
            oldColorScore = dot.score;
          } else {
            oldColorScore = parseInt(dot.score, 10);
            if (isNaN(oldColorScore)) {
              oldColorScore = colorScore;
            }
          }
          const sizeValue = dot.size || String(predefinedSize);
          const formattedSize = formatSize(sizeValue);
          
          return {
            color: dot.color || "",
            size: formattedSize,
            sizeScore: Number(predefinedSizeScore),
            colorScore: Number(oldColorScore),
            totalScore: Number(predefinedSizeScore + oldColorScore),
          };
        }
        
        const totalScore = Number(sizeScoreNum) + Number(colorScoreNum);
        
        // New format or already migrated - ensure scores are set as numbers
        const sizeValue = dot.size || String(predefinedSize);
        const formattedSize = formatSize(sizeValue);
        
        return {
          color: dot.color || "",
          size: formattedSize,
          sizeScore: Number(sizeScoreNum),
          colorScore: Number(colorScoreNum),
          totalScore: Number(totalScore),
        };
      });
    } else {
      levelObj.dots = [];
    }
    
    return levelObj;
  });
  
  console.log(`[getAllLevelConfigs] Returning ${result.length} levels with dots field`);
  return result;
}

// ✅ Ek specific level read (sirf agar exist karta ho)
async function getLevelConfig(levelNumber) {
  await connectToDatabase();

  const level = await LevelConfig.findOne({
    level: Number(levelNumber),
  })
    .lean();

  if (!level) return null;

  // Explicitly construct response with all fields, ensuring dots is always an array
  // Migrate old format (with score) to new format (with sizeScore and colorScore)
  let dots = [];
  if (Array.isArray(level.dots)) {
    dots = level.dots.map((dot, index) => {
      const predefinedSize = getPredefinedDotSize(index);
      const predefinedSizeScore = getPredefinedSizeScore(index);
      const colorScore = getColorScore(dot.color);
      
      // Convert to numbers and calculate total - ensure they are always numbers
      let sizeScoreNum;
      if (typeof dot.sizeScore === 'number' && !isNaN(dot.sizeScore)) {
        sizeScoreNum = Math.floor(dot.sizeScore);
      } else if (dot.sizeScore !== undefined && dot.sizeScore !== null && dot.sizeScore !== "") {
        sizeScoreNum = parseInt(String(dot.sizeScore), 10);
        if (isNaN(sizeScoreNum)) {
          sizeScoreNum = predefinedSizeScore;
        }
      } else {
        sizeScoreNum = predefinedSizeScore;
      }
      
      let colorScoreNum;
      if (typeof dot.colorScore === 'number' && !isNaN(dot.colorScore)) {
        colorScoreNum = Math.floor(dot.colorScore);
      } else if (dot.colorScore !== undefined && dot.colorScore !== null && dot.colorScore !== "") {
        colorScoreNum = parseInt(String(dot.colorScore), 10);
        if (isNaN(colorScoreNum)) {
          colorScoreNum = colorScore;
        }
      } else {
        colorScoreNum = colorScore;
      }
      
      // If old format (has score but no sizeScore/colorScore), migrate it
      if (dot.score !== undefined && (dot.sizeScore === undefined || dot.colorScore === undefined)) {
        let oldColorScore;
        if (typeof dot.score === 'number' && !isNaN(dot.score)) {
          oldColorScore = Math.floor(dot.score);
        } else {
          oldColorScore = parseInt(String(dot.score), 10);
          if (isNaN(oldColorScore)) {
            oldColorScore = colorScore;
          }
        }
        const sizeValue = dot.size || String(predefinedSize);
        const formattedSize = formatSize(sizeValue);
        
        return {
          color: dot.color || "",
          size: formattedSize,
          sizeScore: Number(predefinedSizeScore),
          colorScore: Number(oldColorScore),
          totalScore: Number(predefinedSizeScore + oldColorScore),
        };
      }
      
      const totalScore = sizeScoreNum + colorScoreNum;
      
      // New format or already migrated - ensure scores are set as numbers
      const sizeValue = dot.size || String(predefinedSize);
      const formattedSize = formatSize(sizeValue);
      
      return {
        color: dot.color || "",
        size: formattedSize,
        sizeScore: Number(sizeScoreNum),
        colorScore: Number(colorScoreNum),
        totalScore: Number(totalScore),
      };
    });
  }

  return {
    _id: level._id.toString(),
    level: level.level,
    background: level.background ?? "",
    logoUrl: level.logoUrl ?? "",
    createdAt: level.createdAt,
    updatedAt: level.updatedAt,
    dots: dots,
  };
}

// ✅ "Add level" → Check if level number exists, if provided use it, otherwise find next free
async function createLevelConfig(payload = {}) {
  await connectToDatabase();

  // sab existing levels ka list
  const existing = await LevelConfig.find({}, { level: 1 }).lean();
  const used = new Set(existing.map((l) => l.level));

  let levelNumber = null;

  // If level number is provided in payload, check if it already exists
  if (payload.level !== undefined && payload.level !== null) {
    const requestedLevel = Number(payload.level);
    
    // Validate level number
    if (!Number.isInteger(requestedLevel) || requestedLevel < 1 || requestedLevel > 10) {
      throw new Error("Level number must be an integer between 1 and 10.");
    }

    // Check if level already exists
    if (used.has(requestedLevel)) {
      throw new Error(`Level ${requestedLevel} already exists.`);
    }

    levelNumber = requestedLevel;
  } else {
    // If no level number provided, find first free level (1-10)
    for (let i = 1; i <= 10; i++) {
      if (!used.has(i)) {
        levelNumber = i;
        break;
      }
    }

    if (!levelNumber) {
      throw new Error("All 10 levels already exist.");
    }
  }

  // Process dots: ensure they have sizeScore and colorScore, and apply predefined sizes if needed
  let processedDots = [];
  if (Array.isArray(payload.dots)) {
    processedDots = payload.dots.map((dot, index) => {
      const predefinedSize = getPredefinedDotSize(index);
      const predefinedSizeScore = getPredefinedSizeScore(index);
      const colorScore = getColorScore(dot.color);
      
      // Convert to numbers - ensure they are always numbers, not strings
      let sizeScoreNum;
      if (typeof dot.sizeScore === 'number' && !isNaN(dot.sizeScore)) {
        sizeScoreNum = Math.floor(dot.sizeScore);
      } else if (dot.sizeScore !== undefined && dot.sizeScore !== null && dot.sizeScore !== "") {
        sizeScoreNum = parseInt(String(dot.sizeScore), 10);
        if (isNaN(sizeScoreNum)) {
          sizeScoreNum = predefinedSizeScore;
        }
      } else {
        sizeScoreNum = predefinedSizeScore;
      }
      
      let colorScoreNum;
      if (typeof dot.colorScore === 'number' && !isNaN(dot.colorScore)) {
        colorScoreNum = Math.floor(dot.colorScore);
      } else if (dot.colorScore !== undefined && dot.colorScore !== null && dot.colorScore !== "") {
        colorScoreNum = parseInt(String(dot.colorScore), 10);
        if (isNaN(colorScoreNum)) {
          colorScoreNum = colorScore;
        }
      } else {
        colorScoreNum = colorScore;
      }
      
      const totalScore = sizeScoreNum + colorScoreNum;
      
      // Format size with "px" if it's a number
      const sizeValue = dot.size ?? String(predefinedSize);
      const formattedSize = formatSize(sizeValue);
      
      const dotObj = {
        color: dot.color ?? "",
        size: formattedSize,
        sizeScore: Number(sizeScoreNum),
        colorScore: Number(colorScoreNum),
        totalScore: Number(totalScore),
      };
      
      // Debug logging to verify formatting
      if (process.env.NODE_ENV === 'development') {
        console.log(`[createLevelConfig] Dot ${index}: size="${formattedSize}"`);
      }
      
      return dotObj;
    });
  }

  // Use background field directly, or fall back to old structure for backward compatibility
  let backgroundValue = payload.background ?? "";
  if (!backgroundValue && payload.backgroundType) {
    // Fallback to old structure if background field is not provided
    backgroundValue = payload.backgroundType === "image" 
      ? (payload.backgroundImageUrl ?? "")
      : (payload.backgroundColor ?? "");
  }

  // processedDots already has formatted size, so use it directly
  const created = await LevelConfig.create({
    level: levelNumber,
    background: backgroundValue || null,
    dots: processedDots,
    logoUrl: payload.logoUrl ?? null,
  });
  
  // Log to verify what was saved
  console.log(`[createLevelConfig] Saved level ${levelNumber} with background: "${backgroundValue || null}" and ${processedDots.length} dots`);
  if (processedDots.length > 0) {
    console.log(`[createLevelConfig] First dot example:`, {
      size: processedDots[0].size,
      sizeScore: processedDots[0].sizeScore,
      colorScore: processedDots[0].colorScore,
      totalScore: processedDots[0].totalScore
    });
  }

  // Return processed dots with numbers, not raw DB response
  const result = {
    _id: created._id.toString(),
    level: created.level,
    background: created.background ?? "",
    logoUrl: created.logoUrl ?? "",
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    dots: processedDots, // Already has numbers
  };
  return result;
}

// ✅ Sirf existing level update, naya auto-create nahi
async function updateLevelConfig(levelNumber, payload) {
  await connectToDatabase();

  const levelNumberInt = Number(levelNumber);

  const exists = await LevelConfig.findOne({ level: levelNumberInt }).lean();
  if (!exists) return null;

  // Process dots: ensure they have sizeScore and colorScore
  let processedDots = [];
  if (Array.isArray(payload.dots)) {
    processedDots = payload.dots.map((dot, index) => {
      const predefinedSize = getPredefinedDotSize(index);
      const predefinedSizeScore = getPredefinedSizeScore(index);
      const colorScore = getColorScore(dot.color);
      
      // Convert to numbers - ensure they are always numbers, not strings
      let sizeScoreNum;
      if (typeof dot.sizeScore === 'number' && !isNaN(dot.sizeScore)) {
        sizeScoreNum = Math.floor(dot.sizeScore);
      } else if (dot.sizeScore !== undefined && dot.sizeScore !== null && dot.sizeScore !== "") {
        sizeScoreNum = parseInt(String(dot.sizeScore), 10);
        if (isNaN(sizeScoreNum)) {
          sizeScoreNum = predefinedSizeScore;
        }
      } else {
        sizeScoreNum = predefinedSizeScore;
      }
      
      let colorScoreNum;
      if (typeof dot.colorScore === 'number' && !isNaN(dot.colorScore)) {
        colorScoreNum = Math.floor(dot.colorScore);
      } else if (dot.colorScore !== undefined && dot.colorScore !== null && dot.colorScore !== "") {
        colorScoreNum = parseInt(String(dot.colorScore), 10);
        if (isNaN(colorScoreNum)) {
          colorScoreNum = colorScore;
        }
      } else {
        colorScoreNum = colorScore;
      }
      
      const totalScore = sizeScoreNum + colorScoreNum;
      
      // Format size with "px" if it's a number
      const sizeValue = dot.size ?? String(predefinedSize);
      const formattedSize = formatSize(sizeValue);
      
      const dotObj = {
        color: dot.color ?? "",
        size: formattedSize,
        sizeScore: Number(sizeScoreNum),
        colorScore: Number(colorScoreNum),
        totalScore: Number(totalScore),
      };
      
      // Debug logging to verify formatting
      if (process.env.NODE_ENV === 'development') {
        console.log(`[createLevelConfig] Dot ${index}: size="${formattedSize}"`);
      }
      
      return dotObj;
    });
  }

  // processedDots already has formatted size, so use it directly
  console.log(`[updateLevelConfig] Updating level ${levelNumberInt} with ${processedDots.length} dots`);
  if (processedDots.length > 0) {
    console.log(`[updateLevelConfig] First dot example:`, {
      size: processedDots[0].size,
      sizeScore: processedDots[0].sizeScore,
      colorScore: processedDots[0].colorScore,
      totalScore: processedDots[0].totalScore
    });
  }

  // Use background field directly, or fall back to old structure for backward compatibility
  let backgroundValue = payload.background ?? "";
  if (!backgroundValue && payload.backgroundType) {
    // Fallback to old structure if background field is not provided
    backgroundValue = payload.backgroundType === "image" 
      ? (payload.backgroundImageUrl ?? "")
      : (payload.backgroundColor ?? "");
  }

  console.log(`[updateLevelConfig] Updating level ${levelNumberInt} with background: "${backgroundValue || null}"`);

  const updated = await LevelConfig.findOneAndUpdate(
    { level: levelNumberInt },
    {
      $set: {
        background: backgroundValue || null,
        dots: processedDots,
        logoUrl: payload.logoUrl ?? null,
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return null;

  // Return processed dots with numbers, not raw DB response
  const result = {
    _id: updated._id.toString(),
    level: updated.level,
    background: updated.background ?? "",
    logoUrl: updated.logoUrl ?? "",
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    dots: processedDots, // Already has numbers
  };
  return result;
}

async function deleteLevelConfig(levelNumber) {
  await connectToDatabase();

  const deleted = await LevelConfig.findOneAndDelete({
    level: Number(levelNumber),
  }).lean();

  if (!deleted) return null;

  const result = {
    ...deleted,
    _id: deleted._id.toString(),
  };
  // Ensure dots array is always present
  if (!Array.isArray(result.dots)) {
    result.dots = [];
  }
  return result;
}

module.exports = {
  getAllLevelConfigs,
  getLevelConfig,
  createLevelConfig,
  updateLevelConfig,
  deleteLevelConfig,
};
