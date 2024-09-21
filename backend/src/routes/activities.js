const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, activityController.getActivities);
router.post('/', authMiddleware, activityController.createActivity);

module.exports = router;
