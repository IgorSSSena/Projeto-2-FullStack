import jwt from 'jsonwebtoken';

/**
 * Middleware that verifies the presence and validity of a JSON Web Token in
 * the Authorization header.  On success, sets req.userId to the decoded
 * identifier and passes control to the next handler.  On failure, returns
 * an appropriate HTTP error.
 */
export default function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.id;
    next();
  });
}