const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../frontend/build')));

const APK_DATA_PATH = path.join(__dirname, 'apkData.json');
const SECURITY_CODE = "GURJANTSANDHU";

// Admin panel security code check
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
    fs.readFile(APK_DATA_PATH, (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });
        res.json(JSON.parse(data));
    });
});

// Upload new APK info
app.post('/api/upload', (req, res) => {
    const { name, description, category, image, apk } = req.body;

    fs.readFile(APK_DATA_PATH, (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read existing data' });

        const apks = JSON.parse(data);
        apks.push({ name, description, category, image, apk });

        fs.writeFile(APK_DATA_PATH, JSON.stringify(apks, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Failed to write data' });
            res.json({ success: true });
        });
    });
});

// Delete APK
app.delete('/api/delete/:name', (req, res) => {
    const apkName = req.params.name;

    fs.readFile(APK_DATA_PATH, (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });

        let apks = JSON.parse(data);
        apks = apks.filter(apk => apk.name !== apkName);

        fs.writeFile(APK_DATA_PATH, JSON.stringify(apks, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Failed to write data' });
            res.json({ success: true });
        });
    });
});

// Serve React frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});





















