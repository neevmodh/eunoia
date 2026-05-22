/**
 * User Controller — Eunoia Platform
 * Anonymous user management with optional JWT tokens
 */

const { v4: uuidv4 } = require('uuid');
const { appendCSV, findCSV, updateCSV } = require('../utils/csvHelper');
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/users/register
 * Creates an anonymous user and returns a JWT token
 */
const registerUser = async (req, res) => {
  try {
    const { username, language = 'en' } = req.body;
    const userId = uuidv4();
    const finalUsername = username?.trim() || `Sakhi_${userId.substring(0, 6)}`;

    const record = {
      userId,
      username: finalUsername,
      language,
      wellnessStreak: 0,
      totalPoints: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    appendCSV('users.csv', record);

    // Generate JWT for this anonymous user
    const token = generateToken({ userId, username: finalUsername });

    res.json({
      success: true,
      message: 'Anonymous user created.',
      user: record,
      token,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Error creating user.' });
  }
};

/**
 * GET /api/users/:userId
 */
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = findCSV('users.csv', row => row.userId === userId);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    updateCSV('users.csv', 'userId', userId, { lastActive: new Date().toISOString() });

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user.' });
  }
};

/**
 * PUT /api/users/:userId
 */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, language } = req.body;

    updateCSV('users.csv', 'userId', userId, {
      ...(username && { username }),
      ...(language && { language }),
      lastActive: new Date().toISOString(),
    });

    res.json({ success: true, message: 'User updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user.' });
  }
};

/**
 * POST /api/users/:userId/streak
 * Increment wellness streak and award points
 */
const updateStreak = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = findCSV('users.csv', row => row.userId === userId);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    const currentStreak = parseInt(user.wellnessStreak) || 0;
    const currentPoints = parseInt(user.totalPoints) || 0;
    const newStreak = currentStreak + 1;
    const pointsEarned = newStreak % 7 === 0 ? 50 : 10; // Bonus on weekly streak

    updateCSV('users.csv', 'userId', userId, {
      wellnessStreak: newStreak,
      totalPoints: currentPoints + pointsEarned,
      lastActive: new Date().toISOString(),
    });

    res.json({
      success: true,
      streak: newStreak,
      pointsEarned,
      totalPoints: currentPoints + pointsEarned,
      milestone: newStreak % 7 === 0 ? `🎉 ${newStreak}-day streak!` : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating streak.' });
  }
};

module.exports = { registerUser, getUser, updateUser, updateStreak };
