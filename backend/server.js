import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Folder to store uploads (APK & icons)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config (for file uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + "-" + file.fieldname + ext;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Serve uploaded files (icons & apks)
app.use("/uploads", express.static(uploadDir));

// In-memory database (replace with DB later)
let apks = [];

// Admin login (static credentials)
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "12345";

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Admin login route
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Get all APKs
app.get("/apks", (req, res) => {
  res.json(apks);
});

// Upload new APK
app.post(
  "/apks",
  upload.fields([
    { name: "apk", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const { name, description, category } = req.body;

      if (!req.files.apk || !req.files.icon) {
        return res.status(400).json({ error: "APK and Icon are required!" });
      }

      const apkFile = req.files.apk[0];
      const iconFile = req.files.icon[0];

      const newApk = {
        id: Date.now(),
        name,
        description,
        category,
        downloadUrl: `uploads/${apkFile.filename}`,
        icon: `uploads/${iconFile.filename}`,
      };

      apks.push(newApk);
      res.json({ success: true, apk: newApk });
    } catch (err) {
      console.error("Error uploading APK:", err);
      res.status(500).json({ error: "Server error while uploading APK." });
    }
  }
);

// Delete an APK (if needed)
app.delete("/apks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  apks = apks.filter((apk) => apk.id !== id);
  res.json({ success: true });
});

// Catch-all for production (React build)
const frontendPath = path.join(process.cwd(), "frontend", "build");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





