const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Security Headers including updated Content-Security-Policy for AdSense
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagservices.com 'unsafe-inline'; " +
    "img-src 'self' https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net data:; " +
    "frame-src 'self' https://www.google.com https://googleads.g.doubleclick.net; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https://ep1.adtrafficquality.google https://pagead2.googlesyndication.com;"
  );
  next();
});

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Security code check route
app.post('/api/check-security', (req, res) => {
  const { code } = req.body;
  if (code === 'GURJANTSANDHU') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Security Code' });
  }
});

// Upload APK route
app.post('/api/upload', upload.single('apkFile'), (req, res) => {
  const { title, description, category } = req.body;
  const apkFile = req.file;
  if (!apkFile) return res.status(400).send('No APK file uploaded.');

  const metadata = {
    title,
    description,
    category,
    filename: apkFile.filename,
    originalname: apkFile.originalname,
    uploadedAt: new Date().toISOString(),
  };

  const metadataPath = path.join(__dirname, 'uploads', apkFile.filename + '.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  res.status(200).send('APK uploaded successfully.');
});

// Get all APKs
app.get('/api/apks', (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, 'uploads'));
  const apks = files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(__dirname, 'uploads', file));
      return JSON.parse(content);
    });
  res.json(apks);
});

// Delete APK
app.delete('/api/delete/:filename', (req, res) => {
  const { filename } = req.params;
  try {
    fs.unlinkSync(path.join(__dirname, 'uploads', filename));
    fs.unlinkSync(path.join(__dirname, 'uploads', filename + '.json'));
    res.status(200).send('APK deleted.');
  } catch (err) {
    res.status(500).send('Error deleting file.');
  }
});

// Download APK
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath);
});

// Serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});























