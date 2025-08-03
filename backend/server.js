import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
const JWT_SECRET = "supersecret"; // use environment variable in production

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Admin login route
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// Protect admin-only routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    next();
  });
};

// Example protected route
app.post("/api/admin/upload", verifyToken, (req, res) => {
  res.json({ message: "APK uploaded successfully!" });
});

// Serve frontend
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "frontend", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


