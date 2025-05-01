const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/authentication');

router.get('/patients', auth, doctorController.getPatients);

router.get('/profile', auth, doctorController.getProfile);
router.put('/profile', auth, doctorController.updateProfile);
// router.get('/schedule', auth, doctorController.getSchedule);
// router.put('/schedule', auth, doctorController.updateSchedule);
router.post('/schedule/import', auth, doctorController.importSchedule);
router.get('/schedule/export', auth, doctorController.exportSchedule);
router.get('/search', auth, doctorController.searchDoctors);

router.get('/schedules', auth, doctorController.getSchedules);
router.post('/add-schedule', auth, doctorController.addClinicSchedule);
router.put('/update-slot', auth, doctorController.updateSlotStatus);

// For editing patient info
router.post('/:patientId/allergies', auth, doctorController.addAllergy);
router.delete('/:patientId/allergies', auth, doctorController.removeAllergy);
router.post('/:patientId/medications', auth, doctorController.addMedication);
router.delete('/:patientId/medications', auth, doctorController.removeMedication);

// Medical History 
router.post('/:patientId/medical-history',auth, doctorController.addMedicalHistory);
router.delete('/:patientId/medical-history/:entryId',auth, doctorController.deleteMedicalHistory);

// Remove Patients from My Patients
router.delete('/patients/:patientId', auth, doctorController.removePatient);

module.exports = router;