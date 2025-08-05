const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load .env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 1000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Hardcoded Admin Credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "karn123";

// Data File
const DATA_FILE = "apkData.json";

// Multer Setup for APK + Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Load APKs from JSON
const loadAPKData = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Save APKs to JSON
const saveAPKData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ✅ Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password" });
  }
});

// ✅ Upload APK + Image
app.post("/api/upload", upload.fields([
  { name: "apkFile" },
  { name: "image" }
]), (req, res) => {
  const { title, description, category } = req.body;
  const apkFile = req.files["apkFile"]?.[0];
  const image = req.files["image"]?.[0];

  if (!apkFile || !image) {
    return res.status(400).json({ success: false, message: "APK file and image are required." });
  }

  const newAPK = {
    id: Date.now(),
    title,
    description,
    category,
    apkPath: apkFile.path,
    imagePath: image.path,
    uploadDate: new Date(),
  };

  const apkData = loadAPKData();
  apkData.push(newAPK);
  saveAPKData(apkData);

  res.json({ success: true, message: "APK uploaded successfully", data: newAPK });
});

// ✅ Get All APKs
app.get("/api/apks", (req, res) => {
  const apkData = loadAPKData();
  res.json(apkData);
});

// ✅ Delete APK by ID
app.delete("/api/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let apkData = loadAPKData();

  const apk = apkData.find((a) => a.id === id);
  if (!apk) {
    return res.status(404).json({ success: false, message: "APK not found" });
  }

  // Delete Files
  try {
    if (fs.existsSync(apk.apkPath)) fs.unlinkSync(apk.apkPath);
    if (fs.existsSync(apk.imagePath)) fs.unlinkSync(apk.imagePath);
  } catch (err) {
    console.error("File delete error:", err);
  }

  apkData = apkData.filter((a) => a.id !== id);
  saveAPKData(apkData);

  res.json({ success: true, message: "APK deleted successfully" });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});















