const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) => 
    jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});


//Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.json({ token: generateToken(user), user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    res.json({ token: generateToken(user), user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user);
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);


// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  res.json({ name: req.user.name, email: req.user.email });
});

module.exports = router;