const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Pharmacist = require('../models/Pharmacist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, ...additionalInfo } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists in any schema
    const existingUser = await Promise.all([
      Patient.findOne({ $or: [{ email }, { username }] }),
      Doctor.findOne({ $or: [{ email }, { username }] }),
      Pharmacist.findOne({ $or: [{ email }, { username }] })
    ]);

    if (existingUser.some(user => user !== null)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password

    // Create new entry based on role
    let newUser;
    switch (role) {
      case 'patient':
        newUser = new Patient({
          username,
          email,
          password,
          ...additionalInfo
        });
        break;
      case 'doctor':
        newUser = new Doctor({
          username,
          email,
          password,
          ...additionalInfo
        });
        break;
      case 'pharmacist':
        newUser = new Pharmacist({
          username,
          email,
          password,
          ...additionalInfo
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      id: newUser._id,
      name: newUser.username,
      email: newUser.email,
      token: token,
      role: role
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Search for user in all schemas
    const [patient, doctor, pharmacist] = await Promise.all([
      Patient.findOne({ email }),
      Doctor.findOne({ email }),
      Pharmacist.findOne({ email })
    ]);

    // Find which schema the user exists in
    let user = patient || doctor || pharmacist;
    let role = patient ? 'patient' : doctor ? 'doctor' : pharmacist ? 'pharmacist' : null;

    if (!user) {
      // console.log(" IN here ")
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }



    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      id: user._id,
      name: user.username,
      email: user.email,
      token: token,
      role: role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};