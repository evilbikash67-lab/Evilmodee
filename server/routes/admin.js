const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const admin = require('../config/firebaseAdmin');
const { adminAuth } = require('../middleware/adminAuth');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// Admin login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Incorrect password' });
});

// Get all model configs
router.get('/settings', adminAuth, async (req, res) => {
  const snapshot = await admin.firestore().collection('modelConfigs').get();
  const configs = {};
  snapshot.forEach(doc => configs[doc.id] = doc.data());
  res.json(configs);
});

// Update model config
router.post('/settings', adminAuth, async (req, res) => {
  const { alias, ...config } = req.body;
  if (!alias) return res.status(400).json({ error: 'Alias required' });
  await admin.firestore().collection('modelConfigs').doc(alias).set(config, { merge: true });
  res.json({ success: true });
});

// Broadcast announcement
router.post('/announce', adminAuth, async (req, res) => {
  const { message, type = 'info' } = req.body;
  await admin.firestore().collection('announcements').add({
    message,
    type,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  res.json({ success: true });
});

// Get latest announcement
router.get('/announcement', async (req, res) => {
  const snapshot = await admin.firestore()
    .collection('announcements')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snapshot.empty) return res.json(null);
  res.json(snapshot.docs[0].data());
});

// Maintenance mode
router.get('/maintenance', adminAuth, async (req, res) => {
  const doc = await admin.firestore().collection('settings').doc('maintenance').get();
  res.json({ enabled: doc.exists ? doc.data().enabled : false });
});

router.post('/maintenance', adminAuth, async (req, res) => {
  const { enabled } = req.body;
  await admin.firestore().collection('settings').doc('maintenance').set({ enabled });
  res.json({ success: true });
});

// Usage logs (admin only)
router.get('/logs', adminAuth, async (req, res) => {
  const snapshot = await admin.firestore()
    .collection('usageLogs')
    .orderBy('timestamp', 'desc')
    .limit(200)
    .get();
  const logs = [];
  snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
  res.json(logs);
});

router.delete('/logs', adminAuth, async (req, res) => {
  const batch = admin.firestore().batch();
  const snapshot = await admin.firestore().collection('usageLogs').get();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  res.json({ success: true });
});

module.exports = router;
