const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');

// Create a new help request
router.post('/request-help', helpController.requestHelp);

// Get help requests for a guardian
router.get('/guardian/:guardianId', helpController.getGuardianHelpRequests);

router.get('/all', helpController.getAllHelpRequests);

// Update the status of a help request
router.put('/update/:id', helpController.updateHelpRequestStatus);

router.get('/help-requests', helpController.getAllHelpRequests);

router.get('/help-summary', helpController.getHelpSummary);

module.exports = router;
