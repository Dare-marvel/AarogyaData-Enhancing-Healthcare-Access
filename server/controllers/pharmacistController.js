// pharmacistController.js
const Pharmacist = require('../models/Pharmacist');

// Get current pharmacist profile
exports.getCurrentPharmacist = async (req, res) => {
    try {
      const pharmacist = await Pharmacist.findById(req.user.id).select('-password');
      if (!pharmacist) {
        return res.status(404).json({ message: 'Pharmacist not found' });
      }
      res.json(pharmacist);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Update pharmacist profile
  exports.updatePharmacistProfile = async (req, res) => {
    try {
      const { username, email, yearsOfExperience, licenseNumber, pharmacy } = req.body;
      
      const pharmacist = await Pharmacist.findById(req.user.id);
      if (!pharmacist) {
        return res.status(404).json({ message: 'Pharmacist not found' });
      }
  
      pharmacist.username = username || pharmacist.username;
      pharmacist.email = email || pharmacist.email;
      pharmacist.yearsOfExperience = yearsOfExperience || pharmacist.yearsOfExperience;
      pharmacist.licenseNumber = licenseNumber || pharmacist.licenseNumber;
      pharmacist.pharmacy = pharmacy || pharmacist.pharmacy;
  
      await pharmacist.save();
      res.json(pharmacist);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };