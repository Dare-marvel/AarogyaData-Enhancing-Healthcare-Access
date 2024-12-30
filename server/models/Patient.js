const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const fileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  date: Date,
  startTime: Date,
  endTime: Date,
  venue: String,
  status: {
    type: String,
    enum: ['available', 'scheduled', 'completed', 'cancelled'],
    default: 'available'
  }
});

const PatientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  medicalHistory: [{
    disease: String,
    date: Date
  }],
  allergies: [String],
  currentMedications: [String],
  handwrittenNotes: [fileSchema],
  reports: [fileSchema],
  appointments: [appointmentSchema]
}, { timestamps: true });

PatientSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);