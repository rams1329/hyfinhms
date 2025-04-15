import jwt from "jsonwebtoken";

// In-memory store for blacklisted tokens
// In a production environment, this should be a Redis store or database
const blacklistedTokens = new Set();

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000;

// Function to add a token to the blacklist
export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
  console.log(`Token blacklisted: ${token.substring(0, 10)}...`);
};

// Middleware to check session timeout and blacklisted tokens
const sessionTimeout = (req, res, next) => {
  const { token } = req.headers;
  
  // Skip if no token
  if (!token) {
    return next();
  }
  
  // Check if token is blacklisted
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
      sessionExpired: true
    });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the token issue time is older than session timeout
    const currentTime = Date.now();
    const tokenIssueTime = decoded.iat * 1000; // jwt iat is in seconds
    
    // If token is about to expire in the next minute, send a warning
    if ((currentTime - tokenIssueTime) > (SESSION_TIMEOUT - 60000)) {
      // Add a header to notify frontend that session is about to expire
      res.set('X-Session-About-To-Expire', 'true');
    }
    
    // If token has exceeded the timeout period
    if ((currentTime - tokenIssueTime) > SESSION_TIMEOUT) {
      // Blacklist the token
      blacklistToken(token);
      
      return res.status(401).json({
        success: false,
        message: "Session timeout. Please log in again.",
        sessionExpired: true
      });
    }
    
    next();
  } catch (error) {
    // If token verification fails
    console.log("Session verification error:", error.message);
    
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
      sessionExpired: true
    });
  }
};

export default sessionTimeout; 