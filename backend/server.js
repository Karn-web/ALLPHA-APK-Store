const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 1000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Security code-based login (NO username/password)
const SECURITY_CODE = "GURJANTSANDHU";

app.post('/admin/login', (req, res) => {
  const { code } = req.body;
  if (code === SECURITY_CODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid security code" });
  }
});

// ✅ Upload route
app.post('/upload', upload.single('apk'), (req, res) => {
  const { title, description, category } = req.body;
  const apkInfo = {
    title,
    description,
    category,
    file: req.file.filename,
    date: new Date()
  };

  let data = [];
  if (fs.existsSync('data.json')) {
    data = JSON.parse(fs.readFileSync('data.json'));
  }
  data.push(apkInfo);
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.json({ success: true, message: 'APK uploaded successfully!' });
});

// ✅ Get APK list
app.get('/apks', (req, res) => {
  if (fs.existsSync('data.json')) {
    const data = JSON.parse(fs.readFileSync('data.json'));
    res.json(data);
  } else {
    res.json([]);
  }
});

// ✅ Delete APK
app.delete('/apks/:filename', (req, res) => {
  const filename = req.params.filename;
  let data = JSON.parse(fs.readFileSync('data.json'));
  data = data.filter(apk => apk.file !== filename);
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

  const filePath = path.join('uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

















