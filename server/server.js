require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const pharmacistRoutes = require('./routes/pharmacistRoutes');
const dialogflowRoutes = require('./routes/dialogflowRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patients', geminiRoutes);
app.use('/api/pharmacist', pharmacistRoutes);
app.use('/api/dialogflow', dialogflowRoutes);
app.use('/api/prescription', prescriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));