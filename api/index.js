// Vercel serverless function wrapper for Express backend
const app = require('../school-backend/src/server.js');

// Export as Vercel serverless function
// Vercel routes /api/* requests to this function
// We need to handle the path correctly - Vercel may or may not strip /api
module.exports = (req, res) => {
  // Store original URL
  const originalUrl = req.url;
  
  // If URL starts with /api, remove it since our routes don't have /api prefix anymore
  if (originalUrl.startsWith('/api')) {
    req.url = originalUrl.replace(/^\/api/, '') || '/';
  }
  
  // Also update the originalUrl property if it exists
  if (req.originalUrl) {
    req.originalUrl = req.url;
  }
  
  return app(req, res);
};

