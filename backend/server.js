import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use(express.static(path.join(path.resolve(), "frontend", "build"))); // serve React build

// Storage setup for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Data store
const DATA_FILE = "apks.json";
let apks = [];
if (fs.existsSync(DATA_FILE)) {
  apks = JSON.parse(fs.readFileSync(DATA_FILE));
}

// ---------- AUTH MIDDLEWARE ----------
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ---------- ROUTES ----------

// Health check for Render auto-ping
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Login for admin
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "2h" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

// Get all APKs
app.get("/apks", (req, res) => {
  res.json(apks);
});

// Search APKs
app.get("/apks/search/:query", (req, res) => {
  const query = req.params.query.toLowerCase();
  const results = apks.filter(
    (apk) =>
      apk.name.toLowerCase().includes(query) ||
      apk.category.toLowerCase().includes(query)
  );
  res.json(results);
});

// Upload APK (secured)
app.post(
  "/apks",
  authenticateToken,
  upload.fields([{ name: "icon" }, { name: "apk" }]),
  (req, res) => {
    const { name, description, category, downloadUrl } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: "Name and category required" });
    }

    const newApk = {
      id: Date.now(),
      name,
      description,
      category,
      icon: req.files["icon"]
        ? "/uploads/" + req.files["icon"][0].filename
        : null,
      apkFile: req.files["apk"]
        ? "/uploads/" + req.files["apk"][0].filename
        : downloadUrl || null,
    };

    apks.push(newApk);
    fs.writeFileSync(DATA_FILE, JSON.stringify(apks, null, 2));
    res.status(201).json(newApk);
  }
);

// Delete APK
app.delete("/apks/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  apks = apks.filter((apk) => apk.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(apks, null, 2));
  res.json({ message: "Deleted successfully" });
});

// ---------- CATCH ALL (for React) ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(path.resolve(), "frontend", "build", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));







