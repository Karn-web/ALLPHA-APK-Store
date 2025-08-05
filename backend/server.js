const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Hardcoded admin login
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "karn123";

// JSON file to store APK data
const DATA_FILE = "apkData.json";

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// Load APK data
const loadAPKData = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Save APK data
const saveAPKData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ✅ LOGIN route
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password" });
  }
});

// ✅ UPLOAD APK route
app.post("/api/upload", upload.fields([{ name: "apkFile" }, { name: "image" }]), (req, res) => {
  const { title, description, category } = req.body;
  const apkFile = req.files["apkFile"]?.[0];
  const image = req.files["image"]?.[0];

  if (!apkFile || !image) {
    return res.status(400).json({ success: false, message: "APK file and image are required" });
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

  res.json({ success: true, message: "APK uploaded", data: newAPK });
});

// ✅ GET all APKs
app.get("/api/apks", (req, res) => {
  const apkData = loadAPKData();
  res.json(apkData);
});

// ✅ DELETE APK by ID
app.delete("/api/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let apkData = loadAPKData();

  const apk = apkData.find((apk) => apk.id === id);
  if (!apk) return res.status(404).json({ success: false, message: "APK not found" });

  // Delete files
  try {
    if (fs.existsSync(apk.apkPath)) fs.unlinkSync(apk.apkPath);
    if (fs.existsSync(apk.imagePath)) fs.unlinkSync(apk.imagePath);
  } catch (e) {
    console.error("File delete error:", e);
  }

  apkData = apkData.filter((apk) => apk.id !== id);
  saveAPKData(apkData);

  res.json({ success: true, message: "APK deleted" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});














