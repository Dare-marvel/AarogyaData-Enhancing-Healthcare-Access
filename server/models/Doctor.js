const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const timeSlotSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  status: {
    type: String,
    enum: ['available', 'scheduled', 'completed', 'cancelled'],
    default: 'available'
  }
});

const clinicScheduleSchema = new mongoose.Schema({
  date: Date,
  startTime: Date,
  endTime: Date,
  venue: String,
  slots: [timeSlotSchema]
});

const DoctorSchema = new mongoose.Schema({
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
  specialization: {
    type: String,
    required: true
  },
  yearsOfExperience: {
    type: Number,
    required: true
  },
  college: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  clinicSchedules: {
    type : Map,
    of: clinicScheduleSchema,
    default: new Map() 
  },
  patientIds: [String],
}, { timestamps: true });

DoctorSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Doctor', DoctorSchema);