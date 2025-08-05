import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Session setup for login
app.use(session({
  secret: 'apkstore_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/apkstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const apkSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  apkFile: String,
  imageFile: String
});

const Apk = mongoose.model('Apk', apkSchema);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image') ? 'uploads/images/' : 'uploads/apks/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Auth Middleware
function checkAuth(req, res, next) {
  if (req.session && req.session.user === 'admin') {
    return next();
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// 🔐 Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'karn123') {
    req.session.user = 'admin';
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// 🚪 Logout API
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 📥 Upload APK
app.post('/api/upload', checkAuth, upload.fields([
  { name: 'apkFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const apkFile = req.files['apkFile'][0].filename;
    const imageFile = req.files['imageFile'][0].filename;

    const newApk = new Apk({ title, description, category, apkFile, imageFile });
    await newApk.save();
    res.status(201).json({ message: 'APK uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error });
  }
});

// 📜 Get all APKs
app.get('/api/apks', async (req, res) => {
  try {
    const apks = await Apk.find();
    res.json(apks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch APKs', error });
  }
});

// ❌ Delete APK
app.delete('/api/apks/:id', checkAuth, async (req, res) => {
  try {
    const apk = await Apk.findById(req.params.id);
    if (!apk) return res.status(404).json({ message: 'APK not found' });

    fs.unlinkSync(path.join(__dirname, '/uploads/apks/', apk.apkFile));
    fs.unlinkSync(path.join(__dirname, '/uploads/images/', apk.imageFile));
    await Apk.findByIdAndDelete(req.params.id);

    res.json({ message: 'APK deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error });
  }
});

// 📦 Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});











