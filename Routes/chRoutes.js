const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

// Create a new chapter
router.post('/chapters', chapterController.createChapter);

// Get all chapters for a specific program
router.get('/programs/:program_id/chapters', chapterController.getChaptersForProgram);

// Update an existing chapter
router.put('/chapters/:id', chapterController.updateChapter);

// Delete a chapter
router.delete('/chapters/:id', chapterController.deleteChapter);

// Get chapter progress for a program (Admin)
router.get('/programs/:program_id/progress', chapterController.getChapterProgress);

// Add progress to a chapter (for Professional/Admin)
router.get('/chapters', chapterController.getChaptersByProgramId);
// Fetch chapters with progress
router.get('/chapters/progress', chapterController.getChaptersWithProgress);

// Update chapter progress
router.post('/chapters/progress', chapterController.updateChapterProgress);
router.get('/chapters/last-progress', chapterController.getLastChapterProgress);
router.get('/progress', chapterController.getProgressForProgram); // Get progress data for a program


module.exports = router;
