const express = require('express');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const SECURITY_CODE = 'GURJANTSANDHU';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set CSP headers to allow Google Ads
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://www.googletagservices.com; img-src 'self' https://*; style-src 'self' 'unsafe-inline'; frame-src 'self' https://www.google.com https://googleads.g.doubleclick.net"
  );
  next();
});

// File Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  },
});

const upload = multer({ storage });

// Read APK data
const readApks = () => {
  try {
    const data = fs.readFileSync('apks.json');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Write APK data
const writeApks = (data) => {
  fs.writeFileSync('apks.json', JSON.stringify(data, null, 2));
};

// Routes

// Security Code Login (no username/password)
app.post('/api/login', (req, res) => {
  const { code } = req.body;
  if (code === SECURITY_CODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid security code' });
  }
});

// Get all APKs
app.get('/api/apks', (req, res) => {
  const apks = readApks();
  res.json(apks);
});

// Upload APK
app.post('/api/upload', upload.single('apk'), (req, res) => {
  const { name, description, category, image } = req.body;
  const apks = readApks();

  const newApk = {
    id: Date.now().toString(),
    name,
    description,
    category,
    image,
    apkFile: `/uploads/${req.file.filename}`,
  };

  apks.push(newApk);
  writeApks(apks);
  res.json({ success: true, apk: newApk });
});

// Delete APK
app.delete('/api/delete/:id', (req, res) => {
  const apks = readApks();
  const filtered = apks.filter((apk) => apk.id !== req.params.id);
  writeApks(filtered);
  res.json({ success: true });
});

// Serve Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


























