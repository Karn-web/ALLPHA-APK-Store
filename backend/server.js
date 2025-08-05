const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 1000;

// ✅ Secure your server with proper headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https://allpha-apk-store.onrender.com; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// ✅ Serve frontend React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ✅ Store data in local JSON
const dataPath = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]));
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// ✅ Serve uploaded APKs & images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Admin Panel Route (Security Code Check)
app.get('/admin', (req, res) => {
  const code = req.query.code;
  if (code === 'GURJANTSANDHU') {
    res.sendFile(path.join(__dirname, '../frontend/build/admin.html'));
  } else {
    res.status(401).send('Unauthorized - Invalid Security Code');
  }
});

// ✅ Get all APKs
app.get('/api/apks', (req, res) => {
  const apks = readData();
  res.json(apks);
});

// ✅ Upload new APK with image
app.post('/api/upload', (req, res) => {
  const { name, description, category } = req.body;
  const apk = req.files?.apk;
  const image = req.files?.image;

  if (!name || !description || !category || !apk || !image) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const apkPath = `uploads/${Date.now()}_${apk.name}`;
  const imagePath = `uploads/${Date.now()}_${image.name}`;

  apk.mv(apkPath);
  image.mv(imagePath);

  const data = readData();
  const newApk = {
    id: Date.now(),
    name,
    description,
    category,
    apk: `/${apkPath}`,
    image: `/${imagePath}`
  };
  data.push(newApk);
  writeData(data);

  res.json({ message: 'APK uploaded successfully.', apk: newApk });
});

// ✅ Delete APK by ID
app.delete('/api/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let data = readData();
  const apkToDelete = data.find((apk) => apk.id === id);

  if (!apkToDelete) {
    return res.status(404).json({ error: 'APK not found' });
  }

  // Delete files
  fs.unlinkSync(path.join(__dirname, apkToDelete.apk));
  fs.unlinkSync(path.join(__dirname, apkToDelete.image));

  // Remove from JSON
  data = data.filter((apk) => apk.id !== id);
  writeData(data);

  res.json({ message: 'APK deleted successfully.' });
});

// ✅ Catch-all route for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// ✅ Start server on PORT 1000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


















