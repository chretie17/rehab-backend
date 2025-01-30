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
router.put('/participants/:id', rehabController.updateRehabParticipant);


module.exports = router;
