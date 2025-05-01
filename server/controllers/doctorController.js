const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const moment = require('moment');


// Get all patients assigned to the doctor
exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const patients = await Patient.find({
      '_id': { $in: doctor.patientIds }
    }).select('-password');

    // Exclude handwrittenNotes and reports from the response
    const patientsWithoutFiles = patients.map(patient => {
      const { handwrittenNotes, reports, ...patientObj } = patient.toObject();
      return patientObj;
    });

    res.json(patientsWithoutFiles);
  } catch (error) {
    console.error('Error in getPatients:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // console.log("maybe",req.user.id)
    const doctor = await Doctor.findById(req.user.id).select('-password');
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this route

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// New routes for getting schedule and updating schedule

exports.getSchedules = async (req, res) => {
  try {
    const doctorId = req.user.id; // Getting ID from auth middleware
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update status of completed slots
    doctor.clinicSchedules.forEach((schedule, key) => {
      schedule.slots.forEach(slot => {
        if (moment(slot.endTime).isBefore(moment()) && slot.status !== 'cancelled') {
          slot.status = 'completed';
        }
      });
    });

    await doctor.save();

    // Convert the Map to an array for sorting
    const schedulesArray = Array.from(doctor.clinicSchedules.values());

    // Sort schedules by date
    const sortedSchedules = schedulesArray.sort((a, b) =>
      moment(a.date).valueOf() - moment(b.date).valueOf()
    );

    res.json(sortedSchedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createTimeSlots = (date, startTime, endTime) => {
  const slots = [];
  
  // Use createDateTime to combine date and time
  let current = createDateTime(date, startTime);
  const endDateTime = createDateTime(date, endTime);

  // Generate slots in 10-minute intervals
  while (current < endDateTime) {
    const slotEnd = new Date(current.getTime() + 10 * 60 * 1000); // Add 10 minutes

    slots.push({
      startTime: current,
      endTime: slotEnd,
      patientId: null,
      status: 'available',
    });

    current = slotEnd; // Move to the next slot
  }
  
  return slots;
};


function createDateTime(date, time) {
  const [year, month, day] = date.split('-'); // Split date into components
  const [hours, minutes] = time.split(':'); // Split time into components

  // Use Date.UTC for precise control, then adjust for local timezone
  const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes)));
  return new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

exports.addClinicSchedule = async (req, res) => {
  try {
    const { date, startTime, endTime, venue } = req.body;
    const doctorId = req.user.id;

    // console.log("before ", req.body);

    // Validate date and time formats
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (!moment(startTime, 'HH:mm', true).isValid() || !moment(endTime, 'HH:mm', true).isValid()) {
      return res.status(400).json({
        message: 'Invalid time format. Use HH:mm'
      });
    }

    const slots = createTimeSlots(date, startTime, endTime);
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    // Create start and end datetime for the schedule
    const scheduleStartTime = createDateTime(date, startTime);
    const scheduleEndTime = createDateTime(date, endTime);

    // Convert date to string format to use as Map key
    const dateKey = date;

    // console.log("in doctor ", dateKey, scheduleStartTime, scheduleEndTime);

    doctor.clinicSchedules.set(dateKey, {
      date: new Date(date).toISOString(),
      startTime: scheduleStartTime,
      endTime: scheduleEndTime,
      venue,
      slots
    });

    await doctor.save();

    res.status(200).json({
      message: 'Schedule added successfully'
    });
  } catch (error) {
    console.error('Add Schedule Error:', error);
    res.status(500).json({
      message: 'Error adding schedule',
      error: error.message
    });
  }
};

exports.updateSlotStatus = async (req, res) => {
  try {
    const { scheduleId, slotId, status, patientId } = req.body;
    const doctorId = req.user.id;

    // First get the doctor document to find the correct date key
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find the correct date key by matching the schedule
    let targetDateKey = null;
    for (const [dateKey, schedule] of doctor.clinicSchedules.entries()) {
      const targetSlot = schedule.slots.find(slot => slot._id.toString() === slotId);
      if (targetSlot) {
        targetDateKey = dateKey;
        break;
      }
    }

    if (!targetDateKey) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Update the specific slot
    const result = await Doctor.updateOne(
      {
        '_id': doctorId,
        [`clinicSchedules.${targetDateKey}.slots._id`]: slotId
      },
      {
        $set: {
          [`clinicSchedules.${targetDateKey}.slots.$.status`]: status,
          ...(patientId && { [`clinicSchedules.${targetDateKey}.slots.$.patientId`]: patientId })
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Slot not found or no changes made' });
    }

    res.status(200).json({ message: 'Slot updated successfully' });
  } catch (error) {
    console.error('Update Slot Error:', error);
    res.status(500).json({
      message: 'Error updating slot',
      error: error.message
    });
  }
};

//


// exports.getSchedule = async (req, res) => {
//   try {
//     // console.log("fetching schedule", req.user.id)
//     const doctor = await Doctor.findById(req.user.id);
//     res.json(doctor.schedule || {});
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.updateSchedule = async (req, res) => {
//   try {
//     const { date, slots } = req.body;
//     const doctor = await Doctor.findById(req.user.id);

//     if (!doctor.schedule) {
//       doctor.schedule = new Map();
//     }

//     if (slots === null) {
//       doctor.schedule.delete(date); // Remove the date entirely
//     } else {
//       doctor.schedule.set(date, slots);
//     }

//     await doctor.save();
//     res.json(doctor.schedule.toObject() || {});
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

exports.importSchedule = async (req, res) => {
  try {
    const { scheduleData } = req.body;
    const doctor = await Doctor.findById(req.user.id);

    const newSchedule = new Map();
    let lastDate = null;
    let lastVenue = null;

    scheduleData.forEach(row => {
      // If a new date and venue are provided, update the context
      if (row.date) {
        lastDate = row.date;
      }
      if (row.venue) {
        lastVenue = row.venue;
      }

      // Skip rows without startTime or endTime
      if (!row.startTime || !row.endTime) return;

      // Initialize the clinic schedule for the current date if not already set
      if (!newSchedule.has(lastDate)) {
        newSchedule.set(lastDate, {
          date: new Date(lastDate),
          venue: lastVenue || '',
          startTime: new Date(row.startTime), // Start time of the schedule (first slot)
          endTime: new Date(row.endTime),    // End time of the schedule (last slot)
          slots: []
        });
      }

      // Add the slot to the schedule
      const slot = {
        startTime: new Date(row.startTime),
        endTime: new Date(row.endTime),
        status: row.status || 'available',
        patientId: row.patientId || null
      };
      newSchedule.get(lastDate).slots.push(slot);

      // Update the overall endTime for the schedule
      const schedule = newSchedule.get(lastDate);
      if (new Date(row.endTime) > schedule.endTime) {
        schedule.endTime = new Date(row.endTime);
      }
    });

    // Update the doctor's clinic schedules
    doctor.clinicSchedules = newSchedule;
    await doctor.save();

    res.json({ message: 'Schedule imported successfully', clinicSchedules: doctor.clinicSchedules });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ message: error.message });
  }
};


exports.exportSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    const scheduleArray = [];

    // Iterate over the Map (doctor.clinicSchedules)
    doctor.clinicSchedules.forEach((clinicSchedule, date) => {
      const { slots, venue } = clinicSchedule;

      // Push each time slot under the date and venue
      slots.forEach((slot, index) => {
        scheduleArray.push({
          date: index === 0 ? date : '',  // Fill date for the first row, empty for subsequent
          venue: index === 0 ? venue : '', // Fill venue for the first row, empty for subsequent
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          patientId: slot.patientId
        });
      });

      // Add an empty row after each date group for clarity
      scheduleArray.push({
        date: '',
        venue: '',
        startTime: '',
        endTime: '',
        status: '',
        patientId: ''
      });
    });

    res.json(scheduleArray);
  } catch (error) {
    console.error('Error exporting schedule:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to export schedule', error: error.message });
  }
};


exports.searchDoctors = async (req, res) => {
  try {
    const { searchType, query } = req.query;
    let searchCriteria = {};

    if (searchType === 'username') {
      searchCriteria = {
        username: { $regex: query, $options: 'i' }
      };
    } else if (searchType === 'specialization') {
      searchCriteria = {
        specialization: { $regex: query, $options: 'i' }
      };
    }

    const doctors = await Doctor.find(searchCriteria)
      .select('-password -appointments -patientIds -schedule')
      .sort({ username: 1 });

    res.json(doctors);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controllers for editing patient info

// @desc    Add allergy to patient
// @route   POST /api/patients/:patientId/allergies
// @access  Private
exports.addAllergy = async (req, res) => {
  try {
      const { allergy } = req.body;
      const { patientId } = req.params;

      if (!allergy) {
          return res.status(400).json({ message: 'Please provide an allergy' });
      }

      const patient = await Patient.findById(patientId);

      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      // Check if doctor has access to this patient

      // Check if allergy already exists
      if (patient.allergies.includes(allergy)) {
          return res.status(400).json({ message: 'Allergy already exists' });
      }

      patient.allergies.push(allergy);
      await patient.save();

      res.status(200).json(patient);
  } catch (error) {
      console.error('Error in addAllergy:', error.message);
      res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove allergy from patient
// @route   DELETE /api/patients/:patientId/allergies
// @access  Private
exports.removeAllergy = async (req, res) => {
  try {
      const { allergy } = req.body;
      const { patientId } = req.params;

      if (!allergy) {
          return res.status(400).json({ message: 'Please provide an allergy' });
      }

      const patient = await Patient.findById(patientId);

      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      // Check if doctor has access to this patient


      // Check if allergy exists before removing
      if (!patient.allergies.includes(allergy)) {
          return res.status(400).json({ message: 'Allergy not found' });
      }

      patient.allergies = patient.allergies.filter(a => a !== allergy);
      await patient.save();

      res.status(200).json(patient);
  } catch (error) {
      console.error('Error in removeAllergy:', error.message);
      res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add medication to patient
// @route   POST /api/patients/:patientId/medications
// @access  Private
exports.addMedication = async (req, res) => {
  try {
      const { medication } = req.body;
      const { patientId } = req.params;

      if (!medication) {
          return res.status(400).json({ message: 'Please provide a medication' });
      }

      const patient = await Patient.findById(patientId);

      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      // Check if doctor has access to this patient

      // Check if medication already exists
      if (patient.currentMedications.includes(medication)) {
          return res.status(400).json({ message: 'Medication already exists' });
      }

      patient.currentMedications.push(medication);
      await patient.save();

      res.status(200).json(patient);
  } catch (error) {
      console.error('Error in addMedication:', error.message);
      res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove medication from patient
// @route   DELETE /api/patients/:patientId/medications
// @access  Private
exports.removeMedication = async (req, res) => {
  try {
      const { medication } = req.body;
      const { patientId } = req.params;

      if (!medication) {
          return res.status(400).json({ message: 'Please provide a medication' });
      }

      const patient = await Patient.findById(patientId);

      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      // Check if doctor has access to this patient

      // Check if medication exists before removing
      if (!patient.currentMedications.includes(medication)) {
          return res.status(400).json({ message: 'Medication not found' });
      }

      patient.currentMedications = patient.currentMedications.filter(m => m !== medication);
      await patient.save();

      res.status(200).json(patient);
  } catch (error) {
      console.error('Error in removeMedication:', error.message);
      res.status(500).json({ message: 'Server Error' });
  }
};


// Adding items to Patient's Medical History
exports.addMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { disease, date } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.medicalHistory.push({ disease, date });
    await patient.save();

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error adding medical history', error: error.message });
  }
};

// Deleting items from Patient's Medical History
exports.deleteMedicalHistory = async (req, res) => {
  try {
    const { patientId, entryId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.medicalHistory = patient.medicalHistory.filter(
      entry => entry._id.toString() !== entryId
    );
    
    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medical history', error: error.message });
  }
};

// Remove Patient from My Patients
exports.removePatient = async (req, res) => {
  try {
      const { patientId } = req.params;
      const doctorId = req.user.id; // From the auth middleware

      // Find the doctor and remove the patient ID from patientIds array
      const doctor = await Doctor.findByIdAndUpdate(
          doctorId, 
          { $pull: { patientIds: patientId } }, 
          { new: true }
      );

      if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
      }

      // Optional: You might want to update the patient's status or handle patient-side logic
      await Patient.findByIdAndUpdate(
          patientId, 
          { $set: { assignedDoctor: null } }
      );

      res.json({ 
          message: 'Patient removed successfully', 
          patientIds: doctor.patientIds 
      });
  } catch (error) {
      console.error('Error removing patient:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};