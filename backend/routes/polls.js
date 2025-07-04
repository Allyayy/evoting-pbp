// backend/routes/polls.js
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authenticateToken = require('../middleware/authenticateToken');

// Create a new poll (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, candidates } = req.body;

    if (!title || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'Invalid poll data' });
    }

    const pollRef = await db.collection('polls').add({
      title,
      candidates,
      createdBy: req.user.uid,
      createdAt: new Date(),
    });

    res.status(201).json({ pollId: pollRef.id });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Get all polls (public route)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('polls').orderBy('createdAt', 'desc').get();
    const polls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Get a single poll by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const pollDoc = await db.collection('polls').doc(req.params.id).get();
    if (!pollDoc.exists) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json({ id: pollDoc.id, ...pollDoc.data() });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

module.exports = router;
