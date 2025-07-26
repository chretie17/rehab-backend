const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/MembersReportController');

// ✅ Dashboard Overview Routes
router.get('/dashboard/stats', reportsController.getDashboardStats);

// ✅ Distribution Analysis Routes
router.get('/distribution/status', reportsController.getStatusDistribution);
router.get('/distribution/gender', reportsController.getGenderDistribution);
router.get('/analysis/condition', reportsController.getConditionAnalysis);
router.get('/demographics/age', reportsController.getAgeDemographics);

// ✅ Trend Analysis Routes
router.get('/trends/monthly-admissions', reportsController.getMonthlyAdmissionsTrend);

// ✅ Workload & Engagement Analysis Routes
router.get('/analysis/professional-workload', reportsController.getProfessionalWorkload);
router.get('/analysis/guardian-engagement', reportsController.getGuardianEngagement);

// ✅ Detailed Reports with Filters
router.get('/detailed/participants', reportsController.getDetailedParticipantsReport);

// ✅ Export Routes
router.get('/export/:type', reportsController.getExportData);

// ✅ Date Range Statistics
router.get('/stats/date-range', reportsController.getDateRangeStats);

module.exports = router;