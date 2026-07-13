const express = require('express');
const router = express.Router();
const MODEL_MAP = require('../config/modelMap');

// Return aliases only (no real IDs)
router.get('/', (req, res) => {
  res.json({ models: Object.keys(MODEL_MAP) });
});

module.exports = router;
