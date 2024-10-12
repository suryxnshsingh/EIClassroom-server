const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Access denied" });
  
    jwt.verify(token, 'your_jwt_secret', (err, teacher) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.teacher = teacher;
      next();
    });
  };

  module.exports = authenticateToken