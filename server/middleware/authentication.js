  const jwt = require('jsonwebtoken');

  module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');
    // console.log('Received token:', token);

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // console.log("got user ", req.user)
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
