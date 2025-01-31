const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');

// ✅ Route to get dashboard statistics
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;
