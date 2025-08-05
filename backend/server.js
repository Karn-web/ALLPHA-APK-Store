import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('mongodb+srv://karnlaptop1:<db_password>@cluster0.xiqttcr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define schema
const apkSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  imageUrl: String,
  apkUrl: String,
});

const APK = mongoose.model('APK', apkSchema);

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = file.mimetype.includes('image') ? 'images' : 'apks';
    const uploadPath = `uploads/${type}`;
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
app.get('/api/apks', async (req, res) => {
  const apks = await APK.find();
  res.json(apks);
});

app.post('/api/upload', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'apk', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const imageUrl = req.files['image']?.[0]?.path;
    const apkUrl = req.files['apk']?.[0]?.path;

    const apk = new APK({
      name,
      description,
      category,
      imageUrl,
      apkUrl,
    });

    await apk.save();
    res.status(201).json({ message: 'APK uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

app.delete('/api/apks/:id', async (req, res) => {
  try {
    const deleted = await APK.findByIdAndDelete(req.params.id);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete APK' });
  }
});

// ✅ Serve frontend (React build)
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});










