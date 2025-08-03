const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// =================== ROUTES =================== //

// Upload route (Admin Only)
app.post('/upload', upload.fields([
  { name: 'apk', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), (req, res) => {
  const { name, category, description } = req.body;

  if (!req.files.apk || !req.files.image) {
    return res.status(400).json({ error: 'APK and Image required' });
  }

  const apkFile = req.files.apk[0].filename;
  const imageFile = req.files.image[0].filename;

  // Save APK metadata to apks.json
  const metaPath = path.join('uploads', 'apks.json');
  let apks = [];
  if (fs.existsSync(metaPath)) {
    apks = JSON.parse(fs.readFileSync(metaPath));
  }

  apks.push({
    name,
    category,
    description,
    file: apkFile,
    image: imageFile
  });

  fs.writeFileSync(metaPath, JSON.stringify(apks, null, 2));

  res.json({ message: 'APK uploaded successfully' });
});

// Fetch all uploaded APKs
app.get('/apks', (req, res) => {
  const metaPath = path.join('uploads', 'apks.json');
  if (!fs.existsSync(metaPath)) {
    return res.json([]);
  }
  const apks = JSON.parse(fs.readFileSync(metaPath));
  res.json(apks);
});

// Delete APK
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const metaPath = path.join('uploads', 'apks.json');

  if (!fs.existsSync(metaPath)) {
    return res.status(404).json({ error: 'No APKs found' });
  }

  let apks = JSON.parse(fs.readFileSync(metaPath));
  const apk = apks.find(apk => apk.file === filename);

  if (!apk) {
    return res.status(404).json({ error: 'APK not found' });
  }

  // Remove from array
  apks = apks.filter(apk => apk.file !== filename);
  fs.writeFileSync(metaPath, JSON.stringify(apks, null, 2));

  // Delete files
  if (fs.existsSync(path.join('uploads', filename))) {
    fs.unlinkSync(path.join('uploads', filename));
  }
  if (apk.image && fs.existsSync(path.join('uploads', apk.image))) {
    fs.unlinkSync(path.join('uploads', apk.image));
  }

  res.json({ message: 'APK deleted successfully' });
});

// Admin login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Karn123' && password === 'GURJANTSANDHU') {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// =================== FRONTEND SERVE =================== //

// Serve React build files
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// =================== START SERVER =================== //

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
