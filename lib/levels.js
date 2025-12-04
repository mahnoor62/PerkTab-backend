const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");

// Predefined theme colors with default scores
const PREDEFINED_COLORS = [
  { color: "#e92434", score: 5 },    // red
  { color: "#ff9e1d", score: 15 },   // orange
  { color: "#e9e224", score: 10 },    // yellow
  { color: "#36ceba", score: 25 },   // cyan
  { color: "#000000", score: 20 },   // black
];

// Predefined dot sizes with default scores
const PREDEFINED_DOT_SIZES = [
  { size: "extra small", score: 10 },
  { size: "small", score: 7 },
  { size: "medium", score: 5 },
  { size: "large", score: 3 },
  { size: "extra large", score: 1 },
];

// Get color score based on color value
function getColorScore(color) {
  if (!color) return 0;
  
  const normalizedColor = color.trim().toLowerCase();
  
  // Check exact matches in predefined colors
  for (const colorItem of PREDEFINED_COLORS) {
    if (colorItem.color.toLowerCase() === normalizedColor) {
      return colorItem.score;
    }
  }
  
  // Check hex colors (normalize to lowercase)
  const hexColor = normalizedColor.startsWith("#") 
    ? normalizedColor 
    : `#${normalizedColor}`;
  
  for (const colorItem of PREDEFINED_COLORS) {
    if (colorItem.color.toLowerCase() === hexColor) {
      return colorItem.score;
    }
  }
  
  // For other colors, default to 0
  return 0;
}

// ✅ Hamesha DB se jo hai wohi return karo
async function getAllLevelConfigs() {
  await connectToDatabase();

  const levels = await LevelConfig.find()
    .sort({ level: 1 })
    .lean();

  const result = levels.map((level) => {
    const levelObj = {
      _id: level._id.toString(),
      level: level.level,
      background: level.background ?? "",
      logoUrl: level.logoUrl ?? "",
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
    };
    
    // Include colors array, always return from DB (sorted in ascending order)
    if (level.colors !== undefined && level.colors !== null && Array.isArray(level.colors) && level.colors.length > 0) {
      levelObj.colors = level.colors.map((c) => ({
        color: c.color || "",
        score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
      }));
      // Sort colors in ascending order by color value
      levelObj.colors.sort((a, b) => a.color.localeCompare(b.color));
    } else {
      levelObj.colors = PREDEFINED_COLORS.map((c) => ({
        color: c.color,
        score: c.score,
      }));
      // Sort colors in ascending order
      levelObj.colors.sort((a, b) => a.color.localeCompare(b.color));
    }
    
    // Include dotSizes array, always return from DB
    if (level.dotSizes !== undefined && level.dotSizes !== null && Array.isArray(level.dotSizes) && level.dotSizes.length > 0) {
      levelObj.dotSizes = level.dotSizes.map((s) => ({
        size: s.size || "",
        score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
      }));
    } else {
      levelObj.dotSizes = PREDEFINED_DOT_SIZES.map((s) => ({
        size: s.size,
        score: s.score,
      }));
    }
    
    // Include default flags
    levelObj.useDefaultColors = level.useDefaultColors || 'default';
    levelObj.useDefaultDotSizes = level.useDefaultDotSizes || 'default';
    
    // Include dots array with color and colorScore
    if (level.dots !== undefined && level.dots !== null && Array.isArray(level.dots)) {
      levelObj.dots = level.dots.map((dot) => ({
        color: dot.color || "",
        colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || getColorScore(dot.color)),
      }));
    } else {
      levelObj.dots = [];
    }
    
    // Include targetScore
    levelObj.targetScore = typeof level.targetScore === 'number' ? level.targetScore : (level.targetScore !== undefined ? Number(level.targetScore) || 0 : 0);
    
    return levelObj;
  });
  
  console.log(`[getAllLevelConfigs] Returning ${result.length} levels`);
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

  const result = {
    _id: level._id.toString(),
    level: level.level,
    background: level.background ?? "",
    logoUrl: level.logoUrl ?? "",
    createdAt: level.createdAt,
    updatedAt: level.updatedAt,
  };
  
  // Include colors array, always return from DB (sorted in ascending order)
  if (level.colors !== undefined && level.colors !== null && Array.isArray(level.colors) && level.colors.length > 0) {
    result.colors = level.colors.map((c) => ({
      color: c.color || "",
      score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
    }));
    // Sort colors in ascending order by color value
    result.colors.sort((a, b) => a.color.localeCompare(b.color));
  } else {
    result.colors = PREDEFINED_COLORS.map((c) => ({
      color: c.color,
      score: c.score,
    }));
    // Sort colors in ascending order
    result.colors.sort((a, b) => a.color.localeCompare(b.color));
  }
  
  // Include dotSizes array, always return from DB
  if (level.dotSizes !== undefined && level.dotSizes !== null && Array.isArray(level.dotSizes) && level.dotSizes.length > 0) {
    result.dotSizes = level.dotSizes.map((s) => ({
      size: s.size || "",
      score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
    }));
  } else {
    result.dotSizes = PREDEFINED_DOT_SIZES.map((s) => ({
      size: s.size,
      score: s.score,
    }));
  }
  
  // Include default flags
  result.useDefaultColors = level.useDefaultColors || 'default';
  result.useDefaultDotSizes = level.useDefaultDotSizes || 'default';
  
  // Include dots array with color and colorScore
  if (level.dots !== undefined && level.dots !== null && Array.isArray(level.dots)) {
    result.dots = level.dots.map((dot) => ({
      color: dot.color || "",
      colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || getColorScore(dot.color)),
    }));
  } else {
    result.dots = [];
  }
  
  // Include targetScore
  result.targetScore = typeof level.targetScore === 'number' ? level.targetScore : (level.targetScore !== undefined ? Number(level.targetScore) || 0 : 0);
  
  return result;
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

  // Process colors array - always save to DB in ascending order
  let processedColors = [];
  let useDefaultColors = 'default';
  
  if (Array.isArray(payload.colors) && payload.colors.length > 0) {
    processedColors = payload.colors.map((c) => ({
      color: c.color || "",
      score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
    }));
    // Sort colors in ascending order by color value (as shown in UI)
    processedColors.sort((a, b) => a.color.localeCompare(b.color));
    // Check if colors match predefined (exact match)
    const sortedPredefined = [...PREDEFINED_COLORS].sort((a, b) => a.color.localeCompare(b.color));
    const isDefault = JSON.stringify(processedColors) === JSON.stringify(sortedPredefined);
    useDefaultColors = isDefault ? 'default' : 'custom';
  } else {
    processedColors = PREDEFINED_COLORS.map((c) => ({
      color: c.color,
      score: c.score,
    }));
    // Sort colors in ascending order
    processedColors.sort((a, b) => a.color.localeCompare(b.color));
    useDefaultColors = 'default';
  }

  // Process dotSizes array - always save to DB
  let processedDotSizes = [];
  let useDefaultDotSizes = 'default';
  
  if (Array.isArray(payload.dotSizes) && payload.dotSizes.length > 0) {
    // Validate that all items have size and score
    const validDotSizes = payload.dotSizes.filter((s) => s && s.size);
    if (validDotSizes.length > 0) {
      processedDotSizes = validDotSizes.map((s) => ({
        size: s.size || "",
        score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
      }));
      // Check if dotSizes match predefined (exact match)
      const isDefault = JSON.stringify(processedDotSizes.sort((a, b) => a.size.localeCompare(b.size))) === 
                        JSON.stringify([...PREDEFINED_DOT_SIZES].sort((a, b) => a.size.localeCompare(b.size)));
      useDefaultDotSizes = isDefault ? 'default' : 'custom';
    } else {
      // If array exists but has no valid items, use defaults
      processedDotSizes = PREDEFINED_DOT_SIZES.map((s) => ({
        size: s.size,
        score: s.score,
      }));
      useDefaultDotSizes = 'default';
    }
  } else {
    // Always use predefined dotSizes with default scores if not provided or empty
    processedDotSizes = PREDEFINED_DOT_SIZES.map((s) => ({
      size: s.size,
      score: s.score,
    }));
    useDefaultDotSizes = 'default';
  }
  
  // Process dots array - save color and colorScore
  let processedDots = [];
  if (Array.isArray(payload.dots)) {
    processedDots = payload.dots.map((dot) => {
      const color = dot.color || "";
      const colorScore = dot.colorScore !== undefined && dot.colorScore !== null
        ? (typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || 0))
        : getColorScore(color);
      
      return {
        color: color,
        colorScore: colorScore,
      };
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

  // Process targetScore
  const targetScore = payload.targetScore !== undefined && payload.targetScore !== null
    ? (typeof payload.targetScore === 'number' ? payload.targetScore : (Number(payload.targetScore) || 0))
    : 0;

  const created = await LevelConfig.create({
    level: levelNumber,
    background: backgroundValue || null,
    colors: processedColors,
    dotSizes: processedDotSizes,
    dots: processedDots,
    logoUrl: payload.logoUrl ?? null,
    useDefaultColors: useDefaultColors,
    useDefaultDotSizes: useDefaultDotSizes,
    targetScore: targetScore,
  });
  
  console.log(`[createLevelConfig] Saved level ${levelNumber} with ${processedColors.length} colors, ${processedDotSizes.length} dot sizes, ${processedDots.length} dots, and targetScore: ${targetScore}`);

  const result = {
    _id: created._id.toString(),
    level: created.level,
    background: created.background ?? "",
    logoUrl: created.logoUrl ?? "",
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    colors: processedColors,
    dotSizes: processedDotSizes,
    dots: processedDots,
    useDefaultColors: useDefaultColors,
    useDefaultDotSizes: useDefaultDotSizes,
    targetScore: targetScore,
  };
  return result;
}

// ✅ Sirf existing level update, naya auto-create nahi
async function updateLevelConfig(levelNumber, payload) {
  await connectToDatabase();

  const levelNumberInt = Number(levelNumber);

  const exists = await LevelConfig.findOne({ level: levelNumberInt }).lean();
  if (!exists) return null;

  // Get existing level data for merging
  const existing = await LevelConfig.findOne({ level: levelNumberInt }).lean();
  
  // Process colors array - save provided colors, merge new ones with existing if needed
  let processedColors = [];
  let useDefaultColors = 'default';
  
  if (Array.isArray(payload.colors) && payload.colors.length > 0) {
    // Process new colors from payload
    const newColors = payload.colors.map((c) => ({
      color: c.color || "",
      score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
    }));
    
    // Get existing colors
    const existingColors = existing && existing.colors && Array.isArray(existing.colors) && existing.colors.length > 0
      ? existing.colors.map((c) => ({ color: c.color || "", score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0) }))
      : [];
    
    // Create a map of existing colors by color value (for merging)
    const existingColorsMap = new Map();
    existingColors.forEach((c) => {
      existingColorsMap.set(c.color.toLowerCase(), c);
    });
    
    // Merge: new colors override/update existing ones, add new ones
    // This allows adding new colors while keeping existing ones
    newColors.forEach((c) => {
      existingColorsMap.set(c.color.toLowerCase(), c);
    });
    
    // Convert map back to array (this includes both existing and new colors)
    processedColors = Array.from(existingColorsMap.values());
    // Sort colors in ascending order by color value (as shown in UI)
    processedColors.sort((a, b) => a.color.localeCompare(b.color));
    
    // Check if final colors match predefined
    const sortedPredefined = [...PREDEFINED_COLORS].sort((a, b) => a.color.localeCompare(b.color));
    const isDefault = JSON.stringify(processedColors) === JSON.stringify(sortedPredefined);
    useDefaultColors = isDefault ? 'default' : 'custom';
  } else {
    // If not provided, keep existing or use defaults
    if (existing && existing.colors && Array.isArray(existing.colors) && existing.colors.length > 0) {
      processedColors = existing.colors.map((c) => ({
        color: c.color || "",
        score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
      }));
      // Sort colors in ascending order by color value (as shown in UI)
      processedColors.sort((a, b) => a.color.localeCompare(b.color));
      // Check if existing colors match predefined
      const sortedPredefined = [...PREDEFINED_COLORS].sort((a, b) => a.color.localeCompare(b.color));
      const isDefault = JSON.stringify(processedColors) === JSON.stringify(sortedPredefined);
      useDefaultColors = isDefault ? 'default' : 'custom';
    } else {
      processedColors = PREDEFINED_COLORS.map((c) => ({
        color: c.color,
        score: c.score,
      }));
      // Sort colors in ascending order
      processedColors.sort((a, b) => a.color.localeCompare(b.color));
      useDefaultColors = 'default';
    }
  }

  // Process dotSizes array - save provided sizes, merge new ones with existing if needed
  let processedDotSizes = [];
  let useDefaultDotSizes = 'default';
  
  if (Array.isArray(payload.dotSizes) && payload.dotSizes.length > 0) {
    // Validate that all items have size and score
    const validDotSizes = payload.dotSizes.filter((s) => s && s.size);
    if (validDotSizes.length > 0) {
      // Process new sizes from payload
      const newSizes = validDotSizes.map((s) => ({
        size: s.size || "",
        score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
      }));
      
      // Get existing sizes
      const existingDotSizes = existing && existing.dotSizes && Array.isArray(existing.dotSizes) && existing.dotSizes.length > 0
        ? existing.dotSizes.map((s) => ({ size: s.size || "", score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0) }))
        : [];
      
      // Create a map of existing sizes by size name (for merging)
      const existingSizesMap = new Map();
      existingDotSizes.forEach((s) => {
        existingSizesMap.set(s.size.toLowerCase(), s);
      });
      
      // Merge: new sizes override/update existing ones, add new ones
      // This allows adding new sizes while keeping existing ones
      newSizes.forEach((s) => {
        existingSizesMap.set(s.size.toLowerCase(), s);
      });
      
      // Convert map back to array (this includes both existing and new sizes)
      processedDotSizes = Array.from(existingSizesMap.values());
      
      // Check if final sizes match predefined
      const isDefault = JSON.stringify(processedDotSizes.sort((a, b) => a.size.localeCompare(b.size))) === 
                        JSON.stringify([...PREDEFINED_DOT_SIZES].sort((a, b) => a.size.localeCompare(b.size)));
      useDefaultDotSizes = isDefault ? 'default' : 'custom';
    } else {
      // If array exists but has no valid items, check existing or use defaults
      if (existing && existing.dotSizes && Array.isArray(existing.dotSizes) && existing.dotSizes.length > 0) {
        processedDotSizes = existing.dotSizes.map((s) => ({
          size: s.size || "",
          score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
        }));
        // Check if existing sizes match predefined
        const isDefault = JSON.stringify(processedDotSizes.sort((a, b) => a.size.localeCompare(b.size))) === 
                          JSON.stringify([...PREDEFINED_DOT_SIZES].sort((a, b) => a.size.localeCompare(b.size)));
        useDefaultDotSizes = isDefault ? 'default' : 'custom';
      } else {
        processedDotSizes = PREDEFINED_DOT_SIZES.map((s) => ({
          size: s.size,
          score: s.score,
        }));
        useDefaultDotSizes = 'default';
      }
    }
  } else {
    // If not provided or empty, keep existing or use defaults
    if (existing && existing.dotSizes && Array.isArray(existing.dotSizes) && existing.dotSizes.length > 0) {
      processedDotSizes = existing.dotSizes.map((s) => ({
        size: s.size || "",
        score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
      }));
      // Check if existing sizes match predefined
      const isDefault = JSON.stringify(processedDotSizes.sort((a, b) => a.size.localeCompare(b.size))) === 
                        JSON.stringify([...PREDEFINED_DOT_SIZES].sort((a, b) => a.size.localeCompare(b.size)));
      useDefaultDotSizes = isDefault ? 'default' : 'custom';
    } else {
      // Always use predefined dotSizes with default scores
      processedDotSizes = PREDEFINED_DOT_SIZES.map((s) => ({
        size: s.size,
        score: s.score,
      }));
      useDefaultDotSizes = 'default';
    }
  }
  
  // Process dots array - assign colors from colors array in round-robin fashion
  let processedDots = null; // Use null to indicate "don't update"
  
  // Create a set of valid colors for quick lookup (normalized to lowercase for comparison)
  const validColorsSet = new Set(
    processedColors.map((c) => String(c.color || "").trim().toLowerCase())
  );
  
  if (Array.isArray(payload.dots)) {
    // Filter out null/undefined dots first
    const validDots = payload.dots.filter((dot) => dot != null && dot !== undefined);
    
    // Use processed colors for assignment (already sorted)
    const colorsForDots = processedColors.length > 0 ? processedColors : PREDEFINED_COLORS;
    
    // Filter out dots that use colors not in the colors array
    const dotsWithValidColors = validDots.filter((dot) => {
      if (!dot || !dot.color) return true; // Keep dots without color (will be assigned one)
      const dotColor = String(dot.color || "").trim().toLowerCase();
      return validColorsSet.has(dotColor);
    });
    
    processedDots = dotsWithValidColors.map((dot, index) => {
      // Ensure dot has required fields, with safe defaults
      const dotColor = dot && typeof dot.color === 'string' ? String(dot.color).trim() : "";
      let color = dotColor || "";
      let colorScore = dot.colorScore !== undefined && dot.colorScore !== null
        ? (typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || 0))
        : 0;
      
      // If no color assigned, cycle through colors array evenly (round-robin)
      if (!color && colorsForDots.length > 0) {
        const colorIndex = index % colorsForDots.length;
        const selectedColor = colorsForDots[colorIndex];
        if (selectedColor && selectedColor.color) {
          color = String(selectedColor.color);
          colorScore = typeof selectedColor.score === 'number' ? selectedColor.score : (Number(selectedColor.score) || getColorScore(color));
        }
      } else if (color && !colorScore) {
        // If color exists but no score, calculate it from colors array or use getColorScore
        const colorItem = colorsForDots.find((c) => c && c.color && String(c.color).toLowerCase() === color.toLowerCase());
        colorScore = colorItem 
          ? (typeof colorItem.score === 'number' ? colorItem.score : (Number(colorItem.score) || 0))
          : getColorScore(color);
      }
      
      // Ensure color is always a non-empty string
      if (!color || color === "") {
        // Fallback to first color from colors array
        if (colorsForDots.length > 0 && colorsForDots[0] && colorsForDots[0].color) {
          color = String(colorsForDots[0].color);
          colorScore = typeof colorsForDots[0].score === 'number' ? colorsForDots[0].score : (Number(colorsForDots[0].score) || getColorScore(color));
        } else {
          color = "#000000"; // Ultimate fallback
          colorScore = 0;
        }
      }
      
      return {
        color: String(color),
        colorScore: typeof colorScore === 'number' ? colorScore : (Number(colorScore) || 0),
      };
    });
  } else if (payload.colors !== undefined) {
    // If colors are updated but dots are not provided, filter existing dots based on new colors
    // This handles the case where a color is deleted but dots are not explicitly updated
    if (existing && Array.isArray(existing.dots) && existing.dots.length > 0) {
      processedDots = existing.dots
        .filter((dot) => {
          if (!dot || !dot.color) return false;
          const dotColor = String(dot.color || "").trim().toLowerCase();
          return validColorsSet.has(dotColor);
        })
        .map((dot) => ({
          color: String(dot.color || ""),
          colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || getColorScore(dot.color || "")),
        }));
    }
  }

  // Use background field directly, or fall back to old structure for backward compatibility
  let backgroundValue = payload.background ?? "";
  if (!backgroundValue && payload.backgroundType) {
    // Fallback to old structure if background field is not provided
    backgroundValue = payload.backgroundType === "image" 
      ? (payload.backgroundImageUrl ?? "")
      : (payload.backgroundColor ?? "");
  }

  console.log(`[updateLevelConfig] Updating level ${levelNumberInt} with ${processedColors.length} colors, ${processedDotSizes.length} dot sizes, and ${processedDots ? processedDots.length : 0} dots`);

  // Build update object - only include fields that should be updated
  const updateObj = {
    background: backgroundValue || null,
    colors: processedColors,
    dotSizes: processedDotSizes,
    logoUrl: payload.logoUrl !== undefined ? (payload.logoUrl || null) : existing.logoUrl,
    useDefaultColors: useDefaultColors,
    useDefaultDotSizes: useDefaultDotSizes,
  };

  // Only update dots if they were provided in payload (processedDots is not null)
  if (processedDots !== null) {
    updateObj.dots = processedDots;
  }
  
  // Update targetScore if provided
  if (payload.targetScore !== undefined) {
    updateObj.targetScore = typeof payload.targetScore === 'number' 
      ? payload.targetScore 
      : (Number(payload.targetScore) || 0);
  }

  const updated = await LevelConfig.findOneAndUpdate(
    { level: levelNumberInt },
    { $set: updateObj },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return null;

  // Get the final dots array from updated document
  const finalDots = Array.isArray(updated.dots)
    ? updated.dots.map((dot) => ({
        color: String(dot.color || ""),
        colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || getColorScore(dot.color || "")),
      }))
    : [];

  const result = {
    _id: updated._id.toString(),
    level: updated.level,
    background: updated.background ?? "",
    logoUrl: updated.logoUrl ?? "",
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    colors: processedColors,
    dotSizes: processedDotSizes,
    dots: finalDots,
    useDefaultColors: useDefaultColors,
    useDefaultDotSizes: useDefaultDotSizes,
    targetScore: typeof updated.targetScore === 'number' ? updated.targetScore : (updated.targetScore !== undefined ? Number(updated.targetScore) || 0 : 0),
  };
  return result;
}

// Get level by ID
async function getLevelConfigById(levelId) {
  await connectToDatabase();
  
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(levelId)) {
    return null;
  }

  const level = await LevelConfig.findById(levelId).lean();

  if (!level) return null;

  const result = {
    _id: level._id.toString(),
    level: level.level,
    background: level.background ?? "",
    logoUrl: level.logoUrl ?? "",
    createdAt: level.createdAt,
    updatedAt: level.updatedAt,
  };
  
  // Include colors array
  if (level.colors !== undefined && level.colors !== null && Array.isArray(level.colors) && level.colors.length > 0) {
    result.colors = level.colors.map((c) => ({
      color: c.color || "",
      score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
    }));
    result.colors.sort((a, b) => a.color.localeCompare(b.color));
  } else {
    result.colors = PREDEFINED_COLORS.map((c) => ({
      color: c.color,
      score: c.score,
    }));
    result.colors.sort((a, b) => a.color.localeCompare(b.color));
  }
  
  // Include dotSizes array
  if (level.dotSizes !== undefined && level.dotSizes !== null && Array.isArray(level.dotSizes) && level.dotSizes.length > 0) {
    result.dotSizes = level.dotSizes.map((s) => ({
      size: s.size || "",
      score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
    }));
  } else {
    result.dotSizes = PREDEFINED_DOT_SIZES.map((s) => ({
      size: s.size,
      score: s.score,
    }));
  }
  
  result.useDefaultColors = level.useDefaultColors || 'default';
  result.useDefaultDotSizes = level.useDefaultDotSizes || 'default';
  
  // Include dots array
  if (level.dots !== undefined && level.dots !== null && Array.isArray(level.dots)) {
    result.dots = level.dots.map((dot) => ({
      color: dot.color || "",
      colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || getColorScore(dot.color)),
    }));
  } else {
    result.dots = [];
  }
  
  // Include targetScore
  result.targetScore = typeof level.targetScore === 'number' ? level.targetScore : (level.targetScore !== undefined ? Number(level.targetScore) || 0 : 0);
  
  return result;
}

// Update level by ID with partial update
async function updateLevelConfigById(levelId, payload) {
  await connectToDatabase();
  
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(levelId)) {
    return null;
  }

  const existing = await LevelConfig.findById(levelId).lean();
  if (!existing) return null;

  // Build update object - only include fields that are in payload
  const updateObj = {};
  
  // Update background if provided
  if (payload.background !== undefined) {
    updateObj.background = payload.background || null;
  }
  
  // Update logoUrl if provided
  if (payload.logoUrl !== undefined) {
    updateObj.logoUrl = payload.logoUrl || null;
  }
  
  // Update colors if provided
  if (payload.colors !== undefined && Array.isArray(payload.colors)) {
    const validColors = payload.colors.filter((c) => c != null && c.color);
    if (validColors.length > 0) {
      const processedColors = validColors.map((c) => ({
        color: String(c.color || ""),
        score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
      }));
      processedColors.sort((a, b) => a.color.localeCompare(b.color));
      updateObj.colors = processedColors;
      
      // Check if matches predefined
      const sortedPredefined = [...PREDEFINED_COLORS].sort((a, b) => a.color.localeCompare(b.color));
      const isDefault = JSON.stringify(processedColors) === JSON.stringify(sortedPredefined);
      updateObj.useDefaultColors = isDefault ? 'default' : 'custom';
    }
  }
  
  // Update dotSizes if provided
  if (payload.dotSizes !== undefined && Array.isArray(payload.dotSizes)) {
    const validSizes = payload.dotSizes.filter((s) => s != null && s.size);
    if (validSizes.length > 0) {
      const processedDotSizes = validSizes.map((s) => ({
        size: String(s.size || ""),
        score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
      }));
      updateObj.dotSizes = processedDotSizes;
      
      // Check if matches predefined
      const isDefault = JSON.stringify(processedDotSizes.sort((a, b) => a.size.localeCompare(b.size))) === 
                        JSON.stringify([...PREDEFINED_DOT_SIZES].sort((a, b) => a.size.localeCompare(b.size)));
      updateObj.useDefaultDotSizes = isDefault ? 'default' : 'custom';
    }
  }
  
  // Get current colors (from payload if provided, otherwise from existing)
  let currentColors = [];
  if (payload.colors !== undefined && Array.isArray(payload.colors) && payload.colors.length > 0) {
    currentColors = payload.colors.map((c) => ({
      color: String(c.color || ""),
      score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
    }));
  } else if (existing.colors && Array.isArray(existing.colors)) {
    currentColors = existing.colors.map((c) => ({
      color: String(c.color || ""),
      score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
    }));
  }
  
  // Create a set of valid colors for quick lookup (normalized to lowercase for comparison)
  const validColorsSet = new Set(
    currentColors.map((c) => String(c.color || "").trim().toLowerCase())
  );
  
  // Update dots if provided
  if (payload.dots !== undefined && Array.isArray(payload.dots)) {
    const validDots = payload.dots.filter((dot) => dot != null && dot.color);
    // Filter out dots that use colors not in the colors array
    const dotsWithValidColors = validDots.filter((dot) => {
      const dotColor = String(dot.color || "").trim().toLowerCase();
      return validColorsSet.has(dotColor);
    });
    
    if (dotsWithValidColors.length >= 0) { // Allow empty array to clear dots
      const processedDots = dotsWithValidColors.map((dot) => {
        const dotColor = String(dot.color || "").trim();
        if (!dotColor) return null;
        return {
          color: dotColor,
          colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || 0),
        };
      }).filter((dot) => dot != null);
      updateObj.dots = processedDots;
    }
  } else if (payload.colors !== undefined && validColorsSet.size > 0) {
    // If colors are updated but dots are not provided, filter existing dots based on new colors
    if (existing.dots && Array.isArray(existing.dots) && existing.dots.length > 0) {
      const filteredDots = existing.dots
        .filter((dot) => {
          if (!dot || !dot.color) return false;
          const dotColor = String(dot.color || "").trim().toLowerCase();
          return validColorsSet.has(dotColor);
        })
        .map((dot) => ({
          color: String(dot.color || ""),
          colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || getColorScore(dot.color || "")),
        }));
      updateObj.dots = filteredDots;
    }
  }
  
  // Update targetScore if provided
  if (payload.targetScore !== undefined) {
    updateObj.targetScore = typeof payload.targetScore === 'number' 
      ? payload.targetScore 
      : (Number(payload.targetScore) || 0);
  }

  // Only update if there are changes
  if (Object.keys(updateObj).length === 0) {
    return getLevelConfigById(levelId);
  }

  const updated = await LevelConfig.findByIdAndUpdate(
    levelId,
    { $set: updateObj },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return null;

  return getLevelConfigById(levelId);
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
  getLevelConfigById,
  createLevelConfig,
  updateLevelConfig,
  updateLevelConfigById,
  deleteLevelConfig,
};
