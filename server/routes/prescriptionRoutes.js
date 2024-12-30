const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// Route to fetch all prescriptions
router.get('/files', prescriptionController.getAllPrescriptions);

// Route to fetch a single prescription by ID
router.get('/files/:id', prescriptionController.getPrescriptionById);

module.exports = router;
