const Activity = require('../models/activity');

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(100);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { userId, action, details } = req.body;
    const newActivity = new Activity({ userId, action, details });
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating activity', error: error.message });
  }
};
