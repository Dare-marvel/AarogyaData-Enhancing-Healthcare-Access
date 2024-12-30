const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/authentication');
const { check } = require('express-validator');

// File routes

router.get('/files', patientController.getFiles);
router.post('/files', patientController.uploadFiles);
router.delete('/files/:id', patientController.deleteFile);


router.get('/doctors', auth, patientController.getAllDoctors);
// router.get('/doctors/:specialization', auth, patientController.getDoctorsBySpecialization);
router.get('/doctor/schedule/:doctorId', auth, patientController.getDoctorSchedule);
router.post('/book', auth, patientController.bookAppointment);
router.get('/patient', auth, patientController.getPatientAppointments);
router.put('/cancel/:appointmentId', auth, patientController.cancelAppointment);
router.get('/doctor/:doctorId', auth, patientController.getDoctorDetails);

// Profile Routes
router.get('/profile', auth, patientController.getProfile);

router.put('/profile', [
  auth,
  [
    check('age', 'Age is required').not().isEmpty(),
    check('height', 'Height is required').not().isEmpty(),
    check('weight', 'Weight is required').not().isEmpty()
  ]
], patientController.updateProfile);

module.exports = router;



