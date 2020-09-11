const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

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

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (location) profileFields.location = location;
    if (website) profileFields.website = website;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;
    if (status) profileFields.status = status;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log({ error: [{ message: err.message }] });
      res.status(500).send('Server Error');
    }
  }
);

router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.log({ error: [{ message: err.message }] });
    res.status(500).send('Server Error');
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.log({ error: [{ message: err.message }] });
    if ((err.kind = 'ObjectId')) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    await User.findByIdAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.log({ error: [{ message: err.message }] });
    res.status(500).send('Server Error');
  }
});

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    let newExperience = {};
    if (title) newExperience.title = title;
    if (company) newExperience.company = company;
    if (location) newExperience.location = location;
    if (from) newExperience.from = from;
    if (to) newExperience.to = to;
    if (current) newExperience.current = current;
    if (description) newExperience.description = description;
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        res.status(400).json({ msg: 'User not found' });
      }
      profile.experience.unshift(newExperience);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log({ error: [{ message: err.message }] });
      res.status(500).send('Server Error');
    }
  }
);

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    if (removeIndex == -1) {
      res.status(400).json({ message: 'No education found' });
    }
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error({ error: [{ msg: err.message }] });
  }
});

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
      check('from', 'From is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    let newEducation = {};
    if (school) newEducation.school = school;
    if (degree) newEducation.degree = degree;
    if (fieldofstudy) newEducation.fieldofstudy = fieldofstudy;
    if (from) newEducation.from = from;
    if (to) newEducation.to = to;
    if (current) newEducation.current = current;
    if (description) newEducation.description = description;
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        res.status(400).json({ msg: 'User not found' });
      }
      profile.education.unshift(newEducation);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log({ error: [{ message: err.message }] });
      res.status(500).send('Server Error');
    }
  }
);

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    if (removeIndex == -1) {
      return res.status(400).json({ message: 'No education found' });
    }
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error({ error: [{ msg: err.message }] });
  }
});

module.exports = router;
