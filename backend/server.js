import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Temporary in-memory storage
let apkList = [];

// Fetch all APKs
app.get("/api/apks", (req, res) => {
  res.json(apkList);
});

// Add APK
app.post(
  "/api/apks",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  (req, res) => {
    const { name, category, description } = req.body;
    const iconUrl = `/uploads/${req.files.icon[0].filename}`;
    const fileUrl = `/uploads/${req.files.file[0].filename}`;
    const newApk = {
      _id: Date.now().toString(),
      name,
      category,
      description,
      iconUrl,
      fileUrl,
    };
    apkList.push(newApk);
    res.json(newApk);
  }
);

// Delete APK
app.delete("/api/apks/:id", (req, res) => {
  const { id } = req.params;
  apkList = apkList.filter((apk) => apk._id !== id);
  res.json({ success: true });
});

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));



