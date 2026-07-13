require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const chatRoutes = require('./routes/chat');
const modelsRoutes = require('./routes/models');
const adminRoutes = require('./routes/admin');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '5mb' }));
app.use('/api', generalLimiter);

app.use('/api/chat', chatRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 EVIL MOD API running on port ${PORT}`);
});
