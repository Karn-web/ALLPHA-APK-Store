const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend build
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// Load APK data from JSON
const apkDataPath = path.join(__dirname, 'apks.json');

// Multer setup for APK uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// === NEW ADMIN PANEL SECURITY ===
const SECURITY_CODE = 'GURJANTSANDHU';

// Admin login route
app.post('/api/adminlogin', (req, res) => {
  const { securityCode } = req.body;
  if (securityCode === SECURITY_CODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid security code' });
  }
});

// Upload APK
app.post('/api/upload', upload.single('apkFile'), (req, res) => {
  const { name, description, category, imageUrl } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  let apkList = [];
  if (fs.existsSync(apkDataPath)) {
    const data = fs.readFileSync(apkDataPath, 'utf-8');
    apkList = JSON.parse(data);
  }

  const newApk = {
    id: Date.now(),
    name,
    description,
    category,
    apkUrl: filePath,
    imageUrl,
  };

  apkList.push(newApk);
  fs.writeFileSync(apkDataPath, JSON.stringify(apkList, null, 2));

  res.json({ success: true, apk: newApk });
});

// Get all APKs
app.get('/api/apks', (req, res) => {
  if (fs.existsSync(apkDataPath)) {
    const data = fs.readFileSync(apkDataPath, 'utf-8');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

// Delete APK
app.delete('/api/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let apkList = [];

  if (fs.existsSync(apkDataPath)) {
    apkList = JSON.parse(fs.readFileSync(apkDataPath, 'utf-8'));
  }

  const filteredApks = apkList.filter(apk => apk.id !== id);
  fs.writeFileSync(apkDataPath, JSON.stringify(filteredApks, null, 2));
  res.json({ success: true });
});

// Serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
























