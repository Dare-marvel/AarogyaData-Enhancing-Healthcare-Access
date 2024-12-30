// routes/pharmacist.js
const express = require('express');
const router = express.Router();
const pharmacistController = require('../controllers/pharmacistController');
const auth = require('../middleware/authentication');

router.get('/profile', auth, pharmacistController.getCurrentPharmacist);
router.put('/profile', auth, pharmacistController.updatePharmacistProfile);

module.exports = router;