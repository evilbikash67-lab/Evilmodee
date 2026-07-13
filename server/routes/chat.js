const express = require('express');
const router = express.Router();
const { streamCompletion } = require('../services/aiService');
const MODEL_MAP = require('../config/modelMap');
const admin = require('../config/firebaseAdmin');
const { sanitizeInput } = require('../middleware/sanitize');

router.post('/completions', sanitizeInput, async (req, res) => {
  const { alias, messages } = req.body;
  const realModel = MODEL_MAP[alias];
  if (!realModel) {
    return res.status(400).json({ error: 'Invalid model alias' });
  }

  // Fetch admin config (system prompt, parameters)
  let config = {};
  try {
    const doc = await admin.firestore().collection('modelConfigs').doc(alias).get();
    if (doc.exists) config = doc.data();
  } catch (err) {
    console.warn('Firestore config read failed, using defaults');
  }

  if (config.enabled === false) {
    return res.status(403).json({ error: 'This model is currently disabled by admin' });
  }

  const systemPrompt = config.systemPrompt || '';
  const temperature = config.temperature ?? 0.7;
  const maxTokens = config.maxTokens ?? 512;
  const topP = config.topP ?? 0.9;

  // Prepend system prompt if exists
  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  // Check maintenance mode
  const maintDoc = await admin.firestore().collection('settings').doc('maintenance').get();
  if (maintDoc.exists && maintDoc.data().enabled) {
    return res.status(503).json({ error: 'Service under maintenance. Please try later.' });
  }

  // Log usage (anonymous)
  const logEntry = {
    alias,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip,
  };
  admin.firestore().collection('usageLogs').add(logEntry).catch(() => {});

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  try {
    await streamCompletion(
      {
        modelId: realModel,
        messages: fullMessages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
      },
      (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
      abortController.signal
    );
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI generation failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
