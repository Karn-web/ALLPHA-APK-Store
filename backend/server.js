import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = "your-secret-key";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const DATA_FILE = path.join(process.cwd(), "data.json");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password123") {
    const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  try {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

app.get("/apks", (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
  } catch (err) {
    console.error("Error reading APKs:", err);
    res.status(500).json({ error: "Failed to load APKs" });
  }
});

const multiUpload = upload.fields([
  { name: "icon", maxCount: 1 },
  { name: "apk", maxCount: 1 },
]);

app.post("/apks", verifyToken, multiUpload, (req, res) => {
  try {
    const { name, description, category, downloadUrl } = req.body;
    const icon = req.files.icon ? `/uploads/${req.files.icon[0].filename}` : null;
    const apk = req.files.apk ? `/uploads/${req.files.apk[0].filename}` : null;

    if (!name || !description || !category || !icon || (!apk && !downloadUrl)) {
      return res.status(400).json({ error: "All required fields missing" });
    }

    let data = [];
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE));
    }

    const newApk = {
      id: Date.now(),
      name,
      description,
      category,
      icon,
      downloadUrl: downloadUrl || apk,
    };

    data.push(newApk);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(newApk);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to save APK" });
  }
});

app.delete("/apks/:id", verifyToken, (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.status(404).json({ error: "Not found" });
    let data = JSON.parse(fs.readFileSync(DATA_FILE));
    data = data.filter((apk) => apk.id !== parseInt(req.params.id));
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete APK" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));









