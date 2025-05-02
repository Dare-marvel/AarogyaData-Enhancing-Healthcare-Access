const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const moment = require('moment');

// @desc    Get current patient's profile
// @route   GET /api/patient/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id)
      .select('-password')
      .populate('appointments');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Transform file data to include IDs
    const transformedPatient = {
      ...patient.toObject(),
      handwrittenNotes: patient.handwrittenNotes.map(file => ({
        _id: file._id.toString(),
        url: file.url,
        fileName: file.fileName,
        fileType: 'note'
      })),
      reports: patient.reports.map(file => ({
        _id: file._id.toString(),
        url: file.url,
        fileName: file.fileName,
        fileType: 'report'
      }))
    };

    res.json(transformedPatient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    age,
    height,
    weight,
    medicalHistory,
    allergies,
    currentMedications
  } = req.body;

  try {
    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update fields
    patient.age = age;
    patient.height = height;
    patient.weight = weight;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (allergies) patient.allergies = allergies;
    if (currentMedications) patient.currentMedications = currentMedications;

    await patient.save();
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all files (both handwrittenNotes and reports)
exports.getFiles = async (req, res) => {
  try {
    const { patientId, fileType } = req.query; // fileType can be 'handwrittenNotes' or 'reports'

    // console.log(patientId,fileType)
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    let files = [];
    if (fileType === 'handwrittenNotes') {
      files = patient.handwrittenNotes;
    } else if (fileType === 'reports') {
      files = patient.reports;
    } else {
      // If no fileType specified, return both
      files = [...patient.handwrittenNotes, ...patient.reports];
    }

    const filesWithIds = files.map(file => ({
      _id: file._id.toString(),
      url: file.url,
      fileName: file.fileName,
      fileType: fileType // to identify the type of file
    }));

    res.status(200).json({ files: filesWithIds });
  } catch (err) {
    console.error('Failed to fetch files:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// Upload files
exports.uploadFiles = async (req, res) => {
  try {
    const { patientId, fileType, files } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const fileDocs = files.map(({ url, fileName }) => ({
      url,
      fileName
    }));

    if (fileType === 'handwrittenNotes') {
      patient.handwrittenNotes.push(...fileDocs);
    } else if (fileType === 'reports') {
      patient.reports.push(...fileDocs);
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    await patient.save();
    res.status(200).json({ message: 'Files saved successfully' });
  } catch (err) {
    console.error('Failed to save files:', err);
    res.status(500).json({ error: 'Failed to save files' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { patientId, fileType } = req.body;
    const fileId = req.params.id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    let fileArray;
    if (fileType === 'handwrittenNotes') {
      fileArray = patient.handwrittenNotes;
    } else if (fileType === 'reports') {
      fileArray = patient.reports;
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const fileIndex = fileArray.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    fileArray.splice(fileIndex, 1);
    await patient.save();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Doctor.countDocuments();

    // Get paginated doctors
    const doctors = await Doctor.find()
      .select('-password -patientIds')
      .sort({ yearsOfExperience: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      doctors,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error in getAllDoctors:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getDoctorSchedule = async (req, res) => {
  try {
    // console.log("for patient", req.params.doctorId)
    const doctor = await Doctor.findById(req.params.doctorId);

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
    // const schedulesArray = Array.from(doctor.clinicSchedules.values());

    // // Sort schedules by date
    // const sortedSchedules = schedulesArray.sort((a, b) => 
    //   moment(a.date).valueOf() - moment(b.date).valueOf()
    // );

    res.json(doctor.clinicSchedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorDetails = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId)
      .select('-password -patientIds');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function combineDateAndTime(date, time) {
  const fullDate = new Date(date);
  const fullTime = new Date(time);

  fullDate.setHours(fullTime.getHours());
  fullDate.setMinutes(fullTime.getMinutes());
  fullDate.setSeconds(fullTime.getSeconds());
  fullDate.setMilliseconds(0);

  return fullDate;
}


exports.getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id)
      .populate({
        path: 'appointments.doctorId',
        select: 'username specialization'
      });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // const now = new Date();
    let isModified = false;

    // test
    // doctor.clinicSchedules.forEach((schedule, key) => {
    //       schedule.slots.forEach(slot => {
            // if (moment(slot.endTime).isBefore(moment()) && slot.status !== 'cancelled') {
            //   slot.status = 'completed';
            // }
    //       });
    //     });

        // test

    // Combine date and endTime for comparison
    patient.appointments.forEach(appointment => {
      // const endDateTime = combineDateAndTime(appointment.date, appointment.endTime);

      // if (endDateTime < now && appointment.status !== 'cancelled') {
      //   appointment.status = 'completed';
      //   isModified = true;
      // }

      if (moment(appointment.endTime).isBefore(moment()) && appointment.status !== 'cancelled') {
        appointment.status = 'completed';
        isModified = true;
      }
    });

    if (isModified) {
      await patient.save();
    }

    res.json(patient.appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


function createDateTime(date, time) {
  const [year, month, day] = date.split('-'); // Split date into components
  const [hours, minutes] = time.split(':'); // Split time into components

  // Use Date.UTC for precise control, then adjust for local timezone
  const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes)));
  return new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

exports.bookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { doctorId, date, startTime, endTime, venue, slotId } = req.body;

    // console.log("before booking",req.body)
    const patientId = req.user.id;

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

    // Validate inputs
    if (!doctorId || !venue) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create Date objects for start and end times
    const scheduleStartTime = createDateTime(date, startTime);
    const scheduleEndTime = createDateTime(date, endTime);

    // console.log(scheduleStartTime, scheduleEndTime);

    // Create Date object for the appointment date
    // const dateKey = date;

    const appointment = {
      date: new Date(date).toISOString(),
      startTime: scheduleStartTime,
      endTime: scheduleEndTime,
      venue,
      status: 'scheduled'
    };

    // console.log("while booking",appointment)

    // Update doctor's appointments
    const doctor = await Doctor.findById(doctorId).session(session);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Find and update the specific slot
    let slotUpdated = false;
    for (const [scheduleDate, schedule] of doctor.clinicSchedules) {
      const slotIndex = schedule.slots.findIndex(slot => slot._id.toString() === slotId);
      if (slotIndex !== -1) {
        // schedule.slots[slotIndex].startTime = scheduleStartTime;
        // schedule.slots[slotIndex].endTime = scheduleEndTime;
        schedule.slots[slotIndex].patientId = patientId;
        schedule.slots[slotIndex].status = 'scheduled';
        slotUpdated = true;
        break; // Exit loop once slot is found and updated
      }
    }

    if (!slotUpdated) {
      throw new Error('Slot not found');
    }

    // Add patientId to doctor's patientIds array if not already present 
    if (!doctor.patientIds.includes(patientId)) {
      doctor.patientIds.push(patientId);
    }

    await doctor.save();

    // Update patient's appointments
    const patient = await Patient.findById(patientId).session(session);
    if (!patient) {
      throw new Error('Patient not found');
    }

    patient.appointments.push({ ...appointment, doctorId });
    await patient.save();

    await session.commitTransaction();
    res.json({ message: 'Appointment booked successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { appointmentId } = req.params;
    const patientId = req.user.id;

    // Fetch the patient and ensure they exist
    const patient = await Patient.findById(patientId).session(session);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Find the appointment in the patient's appointments
    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'scheduled') {
      throw new Error('Cannot cancel this appointment');
    }

    // Remove the appointment from the patient's database
    patient.appointments = patient.appointments.filter(
      (apt) => apt._id.toString() !== appointmentId
    );
    await patient.save();

    // Update the doctor's schedule
    const doctor = await Doctor.findById(appointment.doctorId).session(session);

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Extract the schedule for the appointment date
    const appointmentDate = appointment.date.toISOString().split('T')[0];
    const clinicSchedule = doctor.clinicSchedules.get(appointmentDate);

    if (clinicSchedule) {
      const timeSlot = clinicSchedule.slots.find(
        slot =>
          slot.startTime.getTime() === appointment.startTime.getTime() &&
          slot.endTime.getTime() === appointment.endTime.getTime() &&
          slot.patientId?.toString() === patientId
      );

      if (timeSlot) {
        // Update the slot status and free it up
        timeSlot.status = 'available';
        timeSlot.patientId = null;
      }

      // Save the updated schedule
      doctor.clinicSchedules.set(appointmentDate, clinicSchedule);
      await doctor.save();
    }

    await session.commitTransaction();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};



// Helper function to generate schedule
// function generateNextSevenDaysSchedule() {
//   const schedule = new Map();
//   const timeSlots = [
//     '09:00 AM', '10:00 AM', '11:00 AM',
//     '02:00 PM', '03:00 PM', '04:00 PM'
//   ];

//   for (let i = 0; i < 7; i++) {
//     const date = new Date();
//     date.setDate(date.getDate() + i);
//     const dateStr = date.toISOString().split('T')[0];

//     schedule.set(dateStr, {
//       availableSlots: timeSlots.map(time => ({
//         time,
//         isBooked: false
//       })),
//       venue: 'Main Clinic'
//     });
//   }

//   return schedule;
// }