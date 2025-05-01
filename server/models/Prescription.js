const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescription_id: { type: String, required: true },
  firebase_path: { type: String, required: true },
  patient_name: { type: String, required: true },
  doctor_name: { type: String, required: true }
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
