const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Set up DialogFlow client
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.DIALOGFLOW_KEY_PATH,
});

// Book Appointment with Doctor
const getDoctorAvailability = async (doctorName) => {
  console.log('Input doctorName:', doctorName);
  
  const doctor = await Doctor.findOne({ username: doctorName });
  if (!doctor) throw new Error('Doctor not found.');
  
  // Extract available dates for the current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  console.log('Current month:', currentMonth, 'Current year:', currentYear);
  
  // The doctor.clinicSchedules is a Map, so we need to work with its entries
  const availableDates = [];
  
  // Convert Map entries to array for easier processing
  const scheduleEntries = Array.from(doctor.clinicSchedules.entries());
  
  // console.log('Clinic schedules:', doctor.clinicSchedules);
  
  for (const [dateString, scheduleData] of scheduleEntries) {
    // Use the date object directly from scheduleData
    const dateObj = new Date(scheduleData.date);
    
    const isInCurrentMonth = dateObj.getMonth() === currentMonth;
    const isInCurrentYear = dateObj.getFullYear() === currentYear;
    
    // console.log(`Checking date: ${dateString}`);
    // console.log(`Parsed Date Object:`, dateObj);
    // console.log(`Is in current month: ${isInCurrentMonth}, Is in current year: ${isInCurrentYear}`);
    
    if (isInCurrentMonth && isInCurrentYear) {
      availableDates.push(dateString);
    }
  }
  
  // console.log('Available dates:', availableDates);
  return availableDates;
};


const getAvailableSlots = async (doctorName, date) => {
  const doctor = await Doctor.findOne({ username: doctorName });
  if (!doctor) throw new Error('Doctor not found.');

  const scheduleDate = doctor.clinicSchedules.get(date);
  if (!scheduleDate) throw new Error('No schedule found for this date.');

  return scheduleDate.slots.filter((slot) => slot.status === 'available');
};

const bookAppointment = async (doctorName, date, time, patientId) => {
  const doctor = await Doctor.findOne({ username: doctorName });
  if (!doctor) throw new Error('Doctor not found.');

  const scheduleDate = doctor.clinicSchedules.get(date);
  if (!scheduleDate) throw new Error('No schedule found for this date.');

  const slot = scheduleDate.slots.find(
    (slot) => slot.startTime === time && slot.status === 'available'
  );
  if (!slot) throw new Error('Slot not available.');

  slot.patientId = patientId;
  slot.status = 'scheduled';
  await doctor.save();

  const patient = await Patient.findById(patientId);
  patient.appointments.push({
    doctorId: doctor._id,
    date,
    startTime: time,
    venue: scheduleDate.venue,
    status: 'scheduled',
  });
  await patient.save();

  return { message: 'Appointment booked successfully.' };
};

const handleDialogflowRequest = async (req, res) => {
  const { message, languageCode } = req.body;
  const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
  const userRole = req.user.role;

  // console.log(`Received message: ${message}, Language code: ${languageCode}, Role: ${userRole}`);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode || 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    const parameters = result.parameters.fields;
    const intent = result.intent.displayName;
    // console.log(`DialogFlow response: ${JSON.stringify(result, null, 2)}`);

    console.log("checking params",result.parameters)

    // Check if the intent is navigation-related
    // if (intent === 'Navigate') {
    //   const requestedPage = result.parameters.fields.Page.stringValue;

    //   // Define allowed pages for each role
    //   const allowedPages = {
    //     doctor: ['profile', 'schedule_manager', 'my_patients'],
    //     patient: ['profile', 'appointments'],
    //     pharmacist: ['profile', 'scanner']
    //   };

    // console.log('requested page ',requestedPage)

    // Check if the requested page exists for the user's role
    //   if (allowedPages[userRole]?.includes(requestedPage)) {
    //     const newUrl = `/${userRole}/${requestedPage}`;
    //     res.send({
    //       reply: result.fulfillmentText,
    //       navigation: {
    //         url: newUrl,
    //         shouldNavigate: true
    //       }
    //     });
    //   } else {
    //     res.send({
    //       reply: "Sorry, you don't have access to this page. Please request a page that's available in your navigation menu.",
    //       navigation: {
    //         shouldNavigate: false
    //       }
    //     });
    //   }
    // }

    // else {
    //   // For non-navigation intents, just send the regular fulfillment text
    //   res.send({
    //     reply: result.fulfillmentText,
    //     navigation: {
    //       shouldNavigate: false
    //     }
    //   });
    // }

    switch (intent) {
      case 'BookAppointmentInitial': {
        console.log("checking parameters ", parameters)
        const doctorName = parameters.DoctorName.stringValue;

        try {
          const availableDates = await getDoctorAvailability(doctorName);
          console.log("available dates in intent", availableDates)
          if (!availableDates.length) {
            res.json({ fulfillmentText: `Sorry, Dr. ${doctorName} has no available dates this month.` });
          } else {
            const dateResponse = availableDates.join(', ');
            res.json({
              fulfillmentText: `Dr. ${doctorName} is available on the following dates: ${dateResponse}. Please select a date.`,
            });
          }
        } catch (error) {
          console.log("Got some error here")
          console.error('Error fetching doctor availability:', error);
          res.json({ fulfillmentText: `Could not fetch availability for Dr. ${doctorName}. Please try again later.` });
        }
        break;
      }

      case 'GetAppointmentDate': {
        const doctorName = parameters.DoctorName.stringValue;
        const date = parameters.date.stringValue;

        try {
          const availableSlots = await getAvailableSlots(doctorName, date);
          if (!availableSlots.length) {
            res.json({ fulfillmentText: `No slots are available for Dr. ${doctorName} on ${date}. Please choose another date.` });
          } else {
            const slotResponse = availableSlots
              .map(slot => `${slot.startTime} - ${slot.endTime} (${slot.venue})`)
              .join(', ');
            res.json({
              fulfillmentText: `Available slots on ${date} are: ${slotResponse}. Please choose a slot.`,
            });
          }
        } catch (error) {
          console.error('Error fetching available slots:', error);
          res.json({ fulfillmentText: `Could not fetch slots for ${date}. Please try again later.` });
        }
        break;
      }

      case 'GetTimeSlot': {
        const doctorName = parameters.DoctorName.stringValue;
        const date = parameters.date.stringValue;
        const startTime = parameters.startTime.stringValue;

        try {
          const bookingResponse = await bookAppointment(doctorName, date, startTime, req.user.id);
          res.json({ fulfillmentText: bookingResponse.message });
        } catch (error) {
          console.error('Error booking appointment:', error);
          res.json({ fulfillmentText: `Could not book the appointment. Please try again later.` });
        }
        break;
      }

      case 'Navigate': {
        const requestedPage = result.parameters.fields.Page.stringValue;

        // Define allowed pages for each role
        const allowedPages = {
          doctor: ['profile', 'schedule_manager', 'my_patients'],
          patient: ['profile', 'appointments'],
          pharmacist: ['profile', 'scanner']
        };

        // console.log('requested page ',requestedPage)

        // Check if the requested page exists for the user's role
        if (allowedPages[userRole]?.includes(requestedPage)) {
          const newUrl = `/${userRole}/${requestedPage}`;
          res.send({
            fulfillmentText: result.fulfillmentText,
            navigation: {
              url: newUrl,
              shouldNavigate: true
            }
          });
        } else {
          res.send({
            fulfillmentText: "Sorry, you don't have access to this page. Please request a page that's available in your navigation menu.",
            navigation: {
              shouldNavigate: false
            }
          });
        }
        break;
      }

      default:
        res.send({
          fulfillmentText: result.fulfillmentText,
          navigation: {
            shouldNavigate: false
          }
        });
    }

  } catch (error) {
    console.error('DialogFlow error:', error);
    res.status(500).send({ error: 'Error connecting to DialogFlow' });
  }
};

module.exports = { handleDialogflowRequest };
