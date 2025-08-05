const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// Session middleware
app.use(session({
  secret: 'apkstore_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin login credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'karn123'; // ← your new password

// Middleware to protect admin routes
function authMiddleware(req, res, next) {
  if (req.session && req.session.loggedIn) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Handle login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Handle logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Storage setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Load APK data from JSON
const apkFilePath = path.join(__dirname, 'apk-data.json');
function readApkData() {
  try {
    return JSON.parse(fs.readFileSync(apkFilePath));
  } catch (err) {
    return [];
  }
}
function saveApkData(data) {
  fs.writeFileSync(apkFilePath, JSON.stringify(data, null, 2));
}

// Upload APK
app.post('/api/upload', authMiddleware, upload.fields([{ name: 'apk' }, { name: 'image' }]), (req, res) => {
  const { title, description, category } = req.body;
  const apkFile = req.files['apk']?.[0];
  const imageFile = req.files['image']?.[0];

  if (!apkFile || !imageFile) {
    return res.status(400).json({ error: 'APK and image required' });
  }

  const apkData = readApkData();
  const newApk = {
    id: Date.now(),
    title,
    description,
    category,
    apkPath: `/uploads/${apkFile.filename}`,
    imagePath: `/uploads/${imageFile.filename}`,
  };
  apkData.push(newApk);
  saveApkData(apkData);

  res.json({ message: 'Upload successful', apk: newApk });
});

// Get all APKs
app.get('/api/apks', (req, res) => {
  const apkData = readApkData();
  res.json(apkData);
});

// Delete APK
app.delete('/api/delete/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  let apkData = readApkData();
  const apkToDelete = apkData.find(apk => apk.id === id);

  if (!apkToDelete) {
    return res.status(404).json({ error: 'APK not found' });
  }

  // Delete files
  if (apkToDelete.apkPath) fs.unlinkSync(path.join(__dirname, apkToDelete.apkPath));
  if (apkToDelete.imagePath) fs.unlinkSync(path.join(__dirname, apkToDelete.imagePath));

  apkData = apkData.filter(apk => apk.id !== id);
  saveApkData(apkData);

  res.json({ message: 'Deleted successfully' });
});

// Serve frontend (for production deployment)
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});












