const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Create a debug server to capture all requests
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.originalUrl}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  next();
});

// Load all routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/blood-tests', require('./routes/bloodTests'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/import-export', require('./routes/importExport'));

// 404 handler with detailed logging
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

const PORT = 3001;

// Initialize database and start server
async function startDebugServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Debug server running on port ${PORT}`);
      console.log(`📡 Frontend should use: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Debug server failed:', error.message);
  }
}

startDebugServer();
