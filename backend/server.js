const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// Session config
app.use(session({
  secret: 'secret_apk_store_key',
  resave: false,
  saveUninitialized: true
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Login credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'karn123'; // your password

// Auth middleware
function checkAuth(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Read/write JSON
const apkFilePath = path.join(__dirname, 'apk-data.json');

function readApkData() {
  try {
    return JSON.parse(fs.readFileSync(apkFilePath));
  } catch {
    return [];
  }
}

function saveApkData(data) {
  fs.writeFileSync(apkFilePath, JSON.stringify(data, null, 2));
}

// Upload APK
app.post('/api/upload', checkAuth, upload.fields([{ name: 'apk' }, { name: 'image' }]), (req, res) => {
  const { title, description, category } = req.body;
  const apkFile = req.files['apk']?.[0];
  const imageFile = req.files['image']?.[0];

  if (!apkFile || !imageFile) {
    return res.status(400).json({ error: 'Both APK and image are required' });
  }

  const apkData = readApkData();
  const newApk = {
    id: Date.now(),
    title,
    description,
    category,
    apkPath: `/uploads/${apkFile.filename}`,
    imagePath: `/uploads/${imageFile.filename}`
  };
  apkData.push(newApk);
  saveApkData(apkData);

  res.json({ message: 'Upload successful', apk: newApk });
});

// Get APKs
app.get('/api/apks', (req, res) => {
  const apkData = readApkData();
  res.json(apkData);
});

// Delete APK
app.delete('/api/delete/:id', checkAuth, (req, res) => {
  const id = parseInt(req.params.id);
  let apkData = readApkData();
  const apk = apkData.find(item => item.id === id);
  if (!apk) return res.status(404).json({ error: 'APK not found' });

  // Delete files
  if (apk.apkPath) fs.unlinkSync(path.join(__dirname, apk.apkPath));
  if (apk.imagePath) fs.unlinkSync(path.join(__dirname, apk.imagePath));

  apkData = apkData.filter(item => item.id !== id);
  saveApkData(apkData);

  res.json({ message: 'Deleted successfully' });
});

// Serve frontend build in production
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});













