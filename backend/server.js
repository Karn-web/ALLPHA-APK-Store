const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 1000;

const APK_DATA_PATH = path.join(__dirname, 'apkData.json');
const SECURITY_CODE = 'GURJANTSANDHU';

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Content Security Policy header to allow ads and Google recaptcha
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://pagead2.googlesyndication.com; " +
    "img-src 'self' https://pagead2.googlesyndication.com; " +
    "frame-src 'self' https://www.google.com;"
  );
  next();
});

// Serve React frontend static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// -------- API Routes -------- //

// Admin panel security code check (replaces username/password login)
app.post('/api/admin-auth', (req, res) => {
  const { securityCode } = req.body;
  if (securityCode === SECURITY_CODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid security code' });
  }
});

// Get all APKs
app.get('/api/apks', (req, res) => {
  fs.readFile(APK_DATA_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read apkData.json:', err);
      return res.status(500).json({ error: 'Failed to read APK data' });
    }
    try {
      const apks = JSON.parse(data);
      res.json(apks);
    } catch (parseErr) {
      console.error('Error parsing apkData.json:', parseErr);
      return res.status(500).json({ error: 'Corrupted APK data' });
    }
  });
});

// Upload new APK data
app.post('/api/upload', (req, res) => {
  const { name, description, category, image, apk } = req.body;

  if (!name || !description || !category || !image || !apk) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  fs.readFile(APK_DATA_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read apkData.json:', err);
      return res.status(500).json({ error: 'Failed to read existing APK data' });
    }

    let apks = [];
    try {
      apks = JSON.parse(data);
    } catch {
      // If corrupted, reset array
      apks = [];
    }

    apks.push({ name, description, category, image, apk });

    fs.writeFile(APK_DATA_PATH, JSON.stringify(apks, null, 2), err => {
      if (err) {
        console.error('Failed to write apkData.json:', err);
        return res.status(500).json({ error: 'Failed to save APK data' });
      }
      res.json({ success: true, message: 'APK uploaded successfully' });
    });
  });
});

// Delete APK by name
app.delete('/api/delete/:name', (req, res) => {
  const apkName = req.params.name;

  fs.readFile(APK_DATA_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read apkData.json:', err);
      return res.status(500).json({ error: 'Failed to read APK data' });
    }

    let apks = [];
    try {
      apks = JSON.parse(data);
    } catch {
      apks = [];
    }

    const filteredApks = apks.filter(apk => apk.name !== apkName);

    fs.writeFile(APK_DATA_PATH, JSON.stringify(filteredApks, null, 2), err => {
      if (err) {
        console.error('Failed to write apkData.json:', err);
        return res.status(500).json({ error: 'Failed to delete APK' });
      }
      res.json({ success: true, message: `APK "${apkName}" deleted` });
    });
  });
});

// Catch-all: serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






















