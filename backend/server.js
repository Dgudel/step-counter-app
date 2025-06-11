const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/steps', require('./routes/steps'));
app.use('/api/stats', require('./routes/stats'));

// Serve static assets in production only if frontend build exists
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  const indexPath = path.join(frontendBuildPath, 'index.html');
  
  // Only serve static files if the build directory exists
  if (require('fs').existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    // If no frontend build, just serve a simple message
    app.get('/', (req, res) => {
      res.send('Backend API is running');
    });
  }
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 