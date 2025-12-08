const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "default-secret-change-in-production";

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set, using default secret. This is insecure for production!");
}

function generateToken(user) {
  return jwt.sign(
    { email: user.email, role: user.role },
    secret,
    { expiresIn: "8h" }
  );
}

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { generateToken, verifyToken };
