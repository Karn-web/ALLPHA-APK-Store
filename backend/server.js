const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Health Check Endpoint =====
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'OK', uptime: process.uptime() });
});

// ===== Multer Storage Setup =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===== Upload Endpoint =====
app.post('/api/upload', upload.single('apk'), (req, res) => {
  try {
    res.status(200).json({
      message: 'APK uploaded successfully',
      file: req.file
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ===== Serve Frontend Build =====
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ===== Global Error Handlers =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', err => {
  console.error('💥 Uncaught Exception:', err);
});

// ===== Auto-Ping Script (Keeps Render Awake) =====
setInterval(() => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  https.get(url + '/health', (res) => {
    console.log(`🔄 Auto-ping: ${url}/health -> ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Auto-ping error:', err.message);
  });
}, 5 * 60 * 1000); // every 5 minutes

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


