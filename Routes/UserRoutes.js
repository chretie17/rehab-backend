// routes/userRoutes.js

const express = require('express');
const router = express.Router();

// Import user controller
const userController = require('../Controllers/UserController');
const USERSCONTROLLER = require('../Controllers/Prof&Par');

// User Registration
router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);
router.get('/', userController.getAllUsers);

// Get User by ID
router.get('/:id', userController.getUserById);

// Update User
router.put('/:id', userController.updateUser);

// Delete User
router.delete('/:id', userController.deleteUser);
router.put('/verify/:id', userController.verifyUser);

router.post('/forgot-password', userController.forgotPassword);

router.post('/reset-password', userController.resetPassword);
router.get('/professionals/view-user/:id/:role', userController.getProfessionalDetails);

router.get('/guardians', userController.getAllGuardians);
router.get('/professionals', USERSCONTROLLER.getAllProfessionals);

module.exports = router;
