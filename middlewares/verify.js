import jwt from "jsonwebtoken"

export const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({ error: true, message: "Token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified:", decoded); // ← check this
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT error:", err.message);
    return res.status(401).json({ error: true, message: "Unauthorized: Invalid token" });
  }
};
