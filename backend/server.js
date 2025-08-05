const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ New simple security code-based admin auth
app.post("/admin/login", (req, res) => {
  const { code } = req.body;
  if (code === "GURJANTSANDHU") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid security code" });
  }
});

// Upload APK info
let apkDataFile = "apks.json";
const loadApkData = () => {
  if (!fs.existsSync(apkDataFile)) fs.writeFileSync(apkDataFile, "[]");
  return JSON.parse(fs.readFileSync(apkDataFile));
};
const saveApkData = (data) => fs.writeFileSync(apkDataFile, JSON.stringify(data, null, 2));

// Upload route
app.post("/upload", upload.single("apkFile"), (req, res) => {
  const { name, description, category, imageUrl } = req.body;
  const newApk = {
    id: Date.now(),
    name,
    description,
    category,
    imageUrl,
    file: req.file.filename,
  };
  const data = loadApkData();
  data.push(newApk);
  saveApkData(data);
  res.json({ success: true, apk: newApk });
});

// Get all APKs
app.get("/apks", (req, res) => {
  const data = loadApkData();
  res.json(data);
});

// Delete APK
app.delete("/apk/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let data = loadApkData();
  const apk = data.find((a) => a.id === id);
  if (apk) {
    fs.unlinkSync(path.join("uploads", apk.file));
    data = data.filter((a) => a.id !== id);
    saveApkData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

// React frontend fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

















