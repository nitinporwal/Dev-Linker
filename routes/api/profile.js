const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const auth = require('../../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['email', 'avatar']);

    if (!profile) {
      res.status(400).json({ msg: 'Proflie not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error({ error: [{ msg: err.message }] });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
