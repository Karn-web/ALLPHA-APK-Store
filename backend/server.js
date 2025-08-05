const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 1000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security code (replaces old username/password system)
const SECURITY_CODE = 'GURJANTSANDHU';

// Get all APKs
app.get('/api/apks', (req, res) => {
  fs.readFile('apkData.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read APK data' });
    try {
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    } catch (e) {
      res.status(500).json({ error: 'Corrupted APK data' });
    }
  });
});

// Admin login using security code
app.post('/api/admin-login', (req, res) => {
  const { code } = req.body;
  if (code === SECURITY_CODE) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Invalid security code' });
});

// Upload new APK
app.post('/api/upload', (req, res) => {
  const { name, description, category } = req.body;
  const apkFile = req.files?.apk;
  const imageFile = req.files?.image;

  if (!apkFile || !imageFile) return res.status(400).json({ error: 'Both APK and image required' });

  const apkPath = path.join(__dirname, 'uploads', apkFile.name);
  const imagePath = path.join(__dirname, 'uploads', imageFile.name);

  apkFile.mv(apkPath, err => {
    if (err) return res.status(500).json({ error: 'Failed to save APK' });

    imageFile.mv(imagePath, err => {
      if (err) return res.status(500).json({ error: 'Failed to save image' });

      const newAPK = {
        id: Date.now(),
        name,
        description,
        category,
        apkUrl: `/uploads/${apkFile.name}`,
        imageUrl: `/uploads/${imageFile.name}`,
      };

      fs.readFile('apkData.json', 'utf8', (err, data) => {
        const apkData = err ? [] : JSON.parse(data || '[]');
        apkData.push(newAPK);

        fs.writeFile('apkData.json', JSON.stringify(apkData, null, 2), err => {
          if (err) return res.status(500).json({ error: 'Failed to save data' });
          res.json({ success: true, apk: newAPK });
        });
      });
    });
  });
});

// Delete APK
app.delete('/api/delete/:id', (req, res) => {
  const apkId = parseInt(req.params.id);

  fs.readFile('apkData.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read APK data' });

    const apkData = JSON.parse(data);
    const apkToDelete = apkData.find(a => a.id === apkId);

    if (!apkToDelete) return res.status(404).json({ error: 'APK not found' });

    fs.unlink(path.join(__dirname, apkToDelete.apkUrl), () => {});
    fs.unlink(path.join(__dirname, apkToDelete.imageUrl), () => {});

    const updatedData = apkData.filter(a => a.id !== apkId);

    fs.writeFile('apkData.json', JSON.stringify(updatedData, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to update data' });
      res.json({ success: true });
    });
  });
});

// Fallback to React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});




















