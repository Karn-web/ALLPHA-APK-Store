const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🛡️ CSP Headers for Google Ads
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; frame-src 'self' https://www.google.com https://googleads.g.doubleclick.net; script-src 'self' https://www.googletagmanager.com https://pagead2.googlesyndication.com 'unsafe-inline'; img-src 'self' https://allpha-apk-store.onrender.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline'; connect-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com"
  );
  next();
});

// 📁 Static frontend files
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📁 File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 🔐 Admin login using SECURITY CODE
const SECURITY_CODE = 'GURJANTSANDHU';

app.post('/api/admin/login', (req, res) => {
  const { code } = req.body;
  if (code === SECURITY_CODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid security code' });
  }
});

// 📤 Upload new APK
app.post('/api/apks', upload.single('apk'), (req, res) => {
  const { title, description, category } = req.body;
  const apkFile = req.file;
  if (!apkFile) {
    return res.status(400).json({ success: false, message: 'APK file is required' });
  }

  const apkData = {
    id: Date.now(),
    title,
    description,
    category,
    apkUrl: `/uploads/${apkFile.filename}`,
    imageUrl: ''
  };

  const dbPath = path.join(__dirname, 'apks.json');
  const apks = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : [];
  apks.push(apkData);
  fs.writeFileSync(dbPath, JSON.stringify(apks, null, 2));

  res.json({ success: true, apk: apkData });
});

// 🖼️ Upload image separately
app.post('/api/apks/:id/image', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const imageFile = req.file;
  if (!imageFile) {
    return res.status(400).json({ success: false, message: 'Image file is required' });
  }

  const dbPath = path.join(__dirname, 'apks.json');
  const apks = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : [];

  const apkIndex = apks.findIndex(apk => apk.id === parseInt(id));
  if (apkIndex === -1) {
    return res.status(404).json({ success: false, message: 'APK not found' });
  }

  apks[apkIndex].imageUrl = `/uploads/${imageFile.filename}`;
  fs.writeFileSync(dbPath, JSON.stringify(apks, null, 2));

  res.json({ success: true, apk: apks[apkIndex] });
});

// 🧾 Fetch all APKs
app.get('/api/apks', (req, res) => {
  const dbPath = path.join(__dirname, 'apks.json');
  const apks = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : [];
  res.json(apks);
});

// ❌ Delete APK
app.delete('/api/apks/:id', (req, res) => {
  const { id } = req.params;
  const dbPath = path.join(__dirname, 'apks.json');
  let apks = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : [];

  const apkIndex = apks.findIndex(apk => apk.id === parseInt(id));
  if (apkIndex === -1) {
    return res.status(404).json({ success: false, message: 'APK not found' });
  }

  // Delete uploaded files
  const apkToDelete = apks[apkIndex];
  if (apkToDelete.apkUrl) {
    const apkPath = path.join(__dirname, apkToDelete.apkUrl);
    if (fs.existsSync(apkPath)) fs.unlinkSync(apkPath);
  }
  if (apkToDelete.imageUrl) {
    const imagePath = path.join(__dirname, apkToDelete.imageUrl);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }

  apks.splice(apkIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(apks, null, 2));
  res.json({ success: true });
});

// 🌐 React frontend catch-all route
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found');
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

























