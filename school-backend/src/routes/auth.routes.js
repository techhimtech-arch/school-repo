const express = require("express");
const router = express.Router();
const users = require("../config/users");
const { generateToken } = require("../middleware/auth");

// LOGIN API
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) return res.status(401).json({ error: "Invalid Credentials" });

  const token = generateToken(user);

  return res.json({
    message: "Login successful",
    token,
    role: user.role
  });
});

module.exports = router;
