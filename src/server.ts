import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import fs from "fs";
import { Recipe } from "./types/api";

interface RecipesData {
  recipes: Recipe[];
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*", // lub konkretne domeny np. 'http://localhost:8081'
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(express.json());

const uploadsDir = path.join(
  "D:",
  "PojebieMNie",
  "cookbook-mobile-app2",
  "src",
  "uploads"
);
const dataDir = path.join(
  "D:",
  "PojebieMNie",
  "cookbook-mobile-app2",
  "src",
  "data"
);

[uploadsDir, dataDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving file to:", uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = "recipe-" + uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", fileName);
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      console.log("Accepted file:", file.originalname);
      cb(null, true);
    } else {
      console.log("Rejected file:", file.originalname);
      cb(null, false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.get("/uploads/", (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).send("Error reading directory");
    }
    res.json(files);
  });
});

app.get("/recipes", (req: Request, res: Response) => {
  try {
    const recipesPath = path.join(dataDir, "recipes.json");
    if (!fs.existsSync(recipesPath)) {
      return res.json([]);
    }
    const recipesData = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
    res.json(recipesData.recipes);
  } catch (error) {
    console.error("Error getting recipes:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/recipes/:id", (req: Request, res: Response) => {
  try {
    const recipesPath = path.join(dataDir, "recipes.json");
    const recipesData = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
    const recipe = recipesData.recipes.find(
      (r: Recipe) => r.id === req.params.id
    );
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Error getting recipe:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/recipes", (req: Request<{}, {}, Recipe>, res: Response) => {
  try {
    console.log("HEADERS:", JSON.stringify(req.headers, null, 2));
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    console.log("Received recipe data:", req.body);
    const recipesPath = path.join(dataDir, "recipes.json");
    let recipesData: RecipesData = { recipes: [] };

    if (fs.existsSync(recipesPath)) {
      recipesData = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
    }

    const newRecipe: Recipe = {
      title: req.body.title,
      description: req.body.description,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      cookingTime: req.body.cookingTime,
      servings: req.body.servings,
      difficulty: req.body.difficulty,
      image: req.body.image,
      authorId: req.body.authorId,
      id: req.body.id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    recipesData.recipes.push(newRecipe);
    fs.writeFileSync(recipesPath, JSON.stringify(recipesData, null, 2));
    console.log("Recipe saved successfully:", newRecipe);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/recipes/:id", (req: Request, res: Response) => {
  try {
    const recipesPath = path.join(dataDir, "recipes.json");
    let recipesData = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
    const index = recipesData.recipes.findIndex(
      (r: Recipe) => r.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    recipesData.recipes[index] = {
      ...recipesData.recipes[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(recipesPath, JSON.stringify(recipesData, null, 2));
    console.log("Recipe updated successfully:", recipesData.recipes[index]);
    res.json(recipesData.recipes[index]);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/users/:userId/recipes", (req: Request, res: Response) => {
  try {
    const recipesPath = path.join(dataDir, "recipes.json");
    if (!fs.existsSync(recipesPath)) {
      return res.json([]);
    }
    const recipesData = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
    const userRecipes = recipesData.recipes.filter(
      (recipe: Recipe) => recipe.authorId === req.params.userId
    );
    res.json(userRecipes);
  } catch (error) {
    console.error("Error getting user recipes:", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.post(
  "/recipes/:id/image",
  upload.single("image"),
  async (req: Request, res: Response) => {
    console.log("UPLOAD REQUEST:", {
      file: req.file,
      body: req.body,
      params: req.params,
    });
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const recipesPath = path.join(dataDir, "recipes.json");
      let recipesData = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
      const index = recipesData.recipes.findIndex(
        (r: Recipe) => r.id === req.params.id
      );

      if (index === -1) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      recipesData.recipes[index].image = imageUrl;

      fs.writeFileSync(recipesPath, JSON.stringify(recipesData, null, 2));
      console.log("Image uploaded successfully:", imageUrl);
      res.json({ imageUrl });
    } catch (error: unknown) {
      console.error("Pełen błąd uploadu:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Server error", details: errorMessage });
    }
  }
);

app.use("/uploads", express.static(uploadsDir));

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
