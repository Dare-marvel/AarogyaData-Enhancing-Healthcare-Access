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

  // console.log('Current month:', currentMonth, 'Current year:', currentYear);

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

  if (!doctor.clinicSchedules || doctor.clinicSchedules.size === 0) {
    console.log('Doctor has no clinic schedules');
    throw new Error('No schedules available for this doctor.');
  }

  // Extract YYYY-MM-DD format from the input date
  let formattedDate;
  
  if (date instanceof Date) {
    // If it's a Date object
    formattedDate = date.toISOString().split('T')[0];
  } else if (typeof date === 'string') {
    if (date.includes('T')) {
      // If it's an ISO string with time part (2025-05-02T12:00:00+05:00)
      formattedDate = new Date(date).toISOString().split('T')[0];
    } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's already in YYYY-MM-DD format
      formattedDate = date;
    } else {
      // Any other string format
      formattedDate = new Date(date).toISOString().split('T')[0];
    }
  }
  
  // console.log(`Formatted date for lookup: ${formattedDate}`);
  
  // Try getting the schedule with the formatted date
  const scheduleDate = doctor.clinicSchedules.get(formattedDate);

  if (!scheduleDate) {
    console.log(`No schedule found for date: ${formattedDate}`);
    console.log('Available dates are: ' + [...doctor.clinicSchedules.keys()].join(', '));
    throw new Error('No schedule found for this date.');
  }

  return scheduleDate.slots.filter((slot) => slot.status === 'available');
};

// const formatUTCTime = (isoString) => {
//   const date = new Date(isoString);
//   const hours = String(date.getUTCHours()).padStart(2, '0');
//   const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//   return `${hours}:${minutes}`; // e.g., "21:57"
// };

const bookAppointment = async (doctorName, date, time, patientId) => {
  const doctor = await Doctor.findOne({ username: doctorName });
  if (!doctor) throw new Error('Doctor not found.');

  let formattedDate;
  
  if (date instanceof Date) {
    // If it's a Date object
    formattedDate = date.toISOString().split('T')[0];
  } else if (typeof date === 'string') {
    if (date.includes('T')) {
      // If it's an ISO string with time part (2025-05-02T12:00:00+05:00)
      formattedDate = new Date(date).toISOString().split('T')[0];
    } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's already in YYYY-MM-DD format
      formattedDate = date;
    } else {
      // Any other string format
      formattedDate = new Date(date).toISOString().split('T')[0];
    }
  }

  const scheduleDate = doctor.clinicSchedules.get(formattedDate);
  if (!scheduleDate) throw new Error('No schedule found for this date.');

  const slot = scheduleDate.slots.find((slot) => {
    const formattedSlotTime = new Date(slot.startTime).toISOString().slice(11, 16); // Extracts HH:MM in UTC
    const formattedTime = time.slice(11, 16); // Extracts HH:MM (already UTC)
  
    console.log(`Comparing slot time (${formattedSlotTime}) with time (${formattedTime})`);
  
    return formattedSlotTime === formattedTime && slot.status === 'available';
  });
  if (!slot) throw new Error('Slot not available.');

  slot.patientId = patientId;
  slot.status = 'scheduled';
  await doctor.save();

  const patient = await Patient.findById(patientId);
  patient.appointments.push({
    doctorId: doctor._id,
    date : scheduleDate.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    venue: scheduleDate.venue,
    status: 'scheduled',
  });
  await patient.save();

  return { message: 'Appointment booked successfully.' };
};

const handleDialogflowRequest = async (req, res) => {
  const { message, languageCode, sessionId, inputContexts } = req.body;
  // const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId || `session-${Date.now()}`
  );
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
    queryParams: {
      contexts: req.body.contexts || [], 
    }
  };

  console.log("Checking message", message)

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    const parameters = result.parameters.fields;
    const intent = result.intent.displayName;
    const outputContexts = result.outputContexts;

    // const simpleparams = structjson.structProtoToJson(result.parameters);

    // console.log("Checking params", simpleparams)
    // console.log(`DialogFlow response: ${JSON.stringify(result, null, 2)}`);

    // let responseData = {
    //   fulfillmentText: result.fulfillmentText,
    //   intentName: intent,
    //   parameters: parameters,
    //   allRequiredParamsPresent: result.allRequiredParametersPresent
    // };

    console.log("checking intent", intent)

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
        // console.log("checking parameters ", parameters)
        const doctorName = parameters.DoctorName.stringValue;

        try {
          const availableDates = await getDoctorAvailability(doctorName);
          // console.log("available dates in intent", availableDates)
          if (!availableDates.length) {
            res.json({ fulfillmentText: `Sorry, Dr. ${doctorName} has no available dates this month.` });
          } else {
            const dateResponse = availableDates.join(', ');
            return res.json({
              fulfillmentText: availableDates.length
                ? `Dr. ${doctorName} is available on: ${dateResponse}. Please say a date.`
                : `Sorry, Dr. ${doctorName} has no available dates this month.`,
              intent: 'BookAppointmentInitial',
              parameters: { DoctorName: doctorName },
              context: {
                nextExpected: 'GetAppointmentDate',
                outputContexts: outputContexts,
                availableDates: availableDates,
                step: 1                         // Booking flow step number
              }
            });
          }
        } catch (error) {
          // console.log("Got some error here")
          console.error('Error fetching doctor availability:', error);
          res.json({ fulfillmentText: `Could not fetch availability for Dr. ${doctorName}. Please try again later.` });
        }
        break;
      }

      case 'GetAppointmentDate': {
        const doctorName = inputContexts?.doctorName;
        const date = parameters.date.stringValue;
        // console.log("checking date in app date ", date)

        // console.log("checking date ", date)

        try {
          const availableSlots = await getAvailableSlots(doctorName, date);
          if (!availableSlots.length) {
            res.json({ fulfillmentText: `No slots are available for Dr. ${doctorName} on ${date}. Please choose another date.` });
          } else {
            // const slotResponse = availableSlots
            //   .map(slot => `${slot.startTime} - ${slot.endTime} (${slot.venue})`)
            //   .join(', ');
            return res.json({
              fulfillmentText: availableSlots.length
                ? `Available slots on ${date}: Are displayed on the screen. Please choose a time slot.`
                : `No slots available on ${date}. Try another date.`,
              intent: 'GetAppointmentDate',
              parameters: { DoctorName: doctorName, date: date },
              context: {
                nextExpected: 'time_selection',
                outputContexts: outputContexts,
                availableSlots: availableSlots, // Array of {startTime, endTime, venue}
                step: 2,
                selectedDate: date
              }
            });
          }
        } catch (error) {
          console.error('Error fetching available slots:', error);
          res.json({ fulfillmentText: `Could not fetch slots for ${date}. Please try again later.` });
        }
        break;
      }

      case 'GetAppointmentTimeSlot': {
        // const doctorName = parameters.DoctorName.stringValue;
        // const date = parameters.date.stringValue;
        console.log("checking start time in time slot", parameters)

        const startTime = parameters.time.stringValue;
        const date = inputContexts?.selectedDate;
        const doctorName = inputContexts?.doctorName;

        console.log("checking date ", date)

        try {
          const bookingResult = await bookAppointment(doctorName, date, startTime, req.user.id);
          return res.json({
            fulfillmentText: `Your appointment with Dr. ${doctorName} on ${date} at ${startTime} is confirmed!`,
            intent: 'GetTimeSlot',
            parameters: { DoctorName: doctorName, date: date, startTime: startTime },
            context: {
              bookingComplete: true,
              outputContexts: outputContexts,
              confirmation: bookingResult,
              step: 3
            },
            navigation: {  // Optional: Redirect to appointments page
              shouldNavigate: true,
              url: '/patient/appointments'
            }
          });
        } catch (error) {
          console.error('Error booking appointment:', error);
          res.json({
            fulfillmentText: `Booking failed for ${startTime}. Please try again.`,
            intent: 'error',
            context: { error: true, step: 3 }
          });
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
