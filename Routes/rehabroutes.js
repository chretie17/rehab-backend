const express = require('express');
const router = express.Router();
const rehabController = require('../controllers/RehabParticipantController');

router.post('/participants', rehabController.createRehabParticipant);
router.get('/participants', rehabController.getRehabParticipants);
router.get('/participant/:id', rehabController.getRehabParticipantById);
router.put('/assign', rehabController.assignGuardianAndProfessional);
router.put('/update-status', rehabController.updateRehabStatus);
router.delete('/participant/:id', rehabController.deleteRehabParticipant);
router.get('/professionals', rehabController.getAllProfessionals);
router.get('/guardians', rehabController.getAllGuardians);
router.get('/counselors', rehabController.getAllConselors); // ✅ Get all counselors
router.put('/participants/:participantId', rehabController.updateRehabParticipant);
router.get('/assigned/:professionalId', rehabController.getAssignedParticipants); // ✅ Get assigned rehab participants
router.put('/update-status/:participantId', rehabController.updateParticipantStatus); // ✅ Update participant status

// ✅ Route for Guardian to see all their participants
router.get('/guardian/:guardianId/participants', rehabController.getParticipantsByGuardian);

// ✅ Route for Guardian to see detailed progress of a specific participant
router.get('/guardian/participant/:participantId/progress', rehabController.getParticipantProgress);

module.exports = router;
