const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');

// ✅ System Summary
router.get('/system-summary', reportController.getSystemSummary);

// ✅ Professional Reports
router.get('/professional', reportController.getProfessionalReport);

// ✅ Guardian Reports
router.get('/guardian', reportController.getGuardianReport);
router.get('/guardian/participants', reportController.getGuardianParticipants);

// ✅ Date-Based Reports
router.get('/date/help-requests', reportController.getDateBasedHelpRequests);
router.get('/date/admissions', reportController.getDateBasedAdmissions);
router.get('/date/chapter-progress', reportController.getChapterProgressForDateRange);

module.exports = router;
