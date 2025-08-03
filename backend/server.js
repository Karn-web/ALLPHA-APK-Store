import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

// Load APK list
const dataFile = path.join("backend", "data.json");
let apks = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile)) : [];

// Save helper
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(apks, null, 2));
}

// Multer setup for icon + APK file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Health check
app.get("/health", (req, res) => res.send("OK"));

// Fetch APKs
app.get("/apks", (req, res) => {
  res.json(apks);
});

// Upload APK (Admin)
app.post(
  "/upload",
  upload.fields([
    { name: "apkFile", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  (req, res) => {
    const { name, description, category } = req.body;
    const apkFile = req.files.apkFile ? req.files.apkFile[0].filename : null;
    const icon = req.files.icon ? req.files.icon[0].filename : null;

    if (!name || !apkFile) {
      return res.status(400).json({ error: "Name and APK file required" });
    }

    const newApk = {
      id: Date.now(),
      name,
      description,
      category,
      icon,
      downloadUrl: apkFile,
    };

    apks.push(newApk);
    saveData();
    res.json({ message: "APK added successfully", apk: newApk });
  }
);

app.listen(5000, () => console.log("Server running on port 5000"));






