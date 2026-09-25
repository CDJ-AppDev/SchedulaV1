const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

router.post('/term', authenticateToken, asyncHandler(async (req, res) => {
  const { name, program_id, year_level, semester } = req.body;

  if (!program_id || year_level === undefined || !semester) {
    return res.status(400).json({ error: 'Missing required fields: program_id, year_level, semester' });
  }

  try {
    const result = await userService.saveTerm(req.user.user_id, name, program_id, year_level, semester);
    res.status(201).json({ message: 'Program selection saved', user_id: req.user.user_id, term_id: result.term_id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to save TermID selection' });
  }
}));

router.get('/term', authenticateToken, asyncHandler(async (req, res) => {
  const { termId } = req.query;
  try {
    const term = await userService.getTerm(req.user.user_id, termId);
    res.json(term);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Server error' });
  }
}));

router.get('/user-session', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const session = await userService.getSession(req.user.user_id);
    res.json(session);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Server error' });
  }
}));

router.put('/user/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await userService.updateProfile(req.user.user_id, username, email, password);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message || 'Error updating profile' });
  }
}));

router.delete('/user/profile', authenticateToken, asyncHandler(async (req, res) => {
  try {
    await userService.deleteProfile(req.user.user_id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Server error: failed to delete account' });
  }
}));

router.get('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const prefs = await userService.getUserPreferences(req.user.user_id);
    res.json(prefs);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Server error fetching preferences' });
  }
}));

router.put('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const { blockedTimes } = req.body;
  try {
    const prefs = await userService.updateUserPreferences(req.user.user_id, blockedTimes || []);
    res.json({ message: 'Preferences updated successfully', preferences: prefs });
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message || 'Error updating preferences' });
  }
}));

module.exports = router;
