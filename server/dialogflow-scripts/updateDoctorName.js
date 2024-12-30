const axios = require('axios');
const Doctor = require('./models/Doctor'); // Adjust path as needed

const DIALOGFLOW_PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID;
const DIALOGFLOW_KEY = process.env.DIALOGFLOW_KEY_PATH;

const updateDoctorEntities = async () => {
  try {
    // Fetch doctor usernames from your database
    const doctors = await Doctor.find({}, 'username').exec();
    const doctorEntities = doctors.map((doctor) => ({
      value: doctor.username,
      synonyms: [doctor.username], // Add synonyms if necessary
    }));

    // Dialogflow API endpoint
    const url = `https://dialogflow.googleapis.com/v2/projects/${DIALOGFLOW_PROJECT_ID}/agent/entityTypes/b9cb1618-e18d-48a9-95c1-974c7a4567ef/entities:batchUpdate`;

    // Make the API request to update entities
    await axios.post(
      url,
      {
        entities: doctorEntities,
      },
      {
        headers: {
          Authorization: `Bearer ${DIALOGFLOW_KEY}`,
        },
      }
    );

    console.log('Doctor entities updated successfully.');
  } catch (error) {
    console.error('Error updating doctor entities:', error);
  }
};

updateDoctorEntities();
