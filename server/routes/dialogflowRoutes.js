const express = require('express');
const { handleDialogflowRequest } = require('../controllers/dialogflowController');
const router = express.Router();
const auth = require('../middleware/authentication');

router.post('/',auth, handleDialogflowRequest);

module.exports = router;
