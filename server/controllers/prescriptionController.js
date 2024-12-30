const Prescription = require('../models/Prescription');

// Fetch all prescriptions
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch a prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log("id", id)
    const prescription = await Prescription.findOne({ prescription_id: id });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
