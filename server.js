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

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// File upload route (Admin only)
app.post('/upload', upload.single('apk'), (req, res) => {
  res.json({ message: 'APK uploaded successfully', file: req.file });
});

// Fetch uploaded APKs
app.get('/apks', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read files' });
    res.json(files);
  });
});

// Admin login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Karn123' && password === 'GURJANTSANDHU') {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const path = require('path');

// Serve React build files
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
