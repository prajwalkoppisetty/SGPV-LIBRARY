const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path is correct
const multer = require('multer');

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Signup Route ---
router.post('/signup', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo uploaded or invalid file type.' });
  }

  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  // Destructure and normalize field names from req.body
  // The frontend uses 'pinNumber' and 'mobileNumber' (camelCase)
  // The backend DB schema is expected to use 'pin_number' and 'mobilenumber' (snake_case or consistent camelCase)
  // Let's ensure we use the camelCase from frontend and map it to DB's expected snake_case names for consistency.
  const {
    email,
    name,
    pinNumber, // Expecting 'pinNumber' from frontend (Signup.jsx)
    regulationNumber,
    mobileNumber, // Expecting 'mobileNumber' from frontend (Signup.jsx)
    password,
    branch
  } = req.body;

  const newErrors = {};
  let isValid = true;

  // Frontend Validations (re-checked for consistency with your Signup.jsx)
  if (!email || email.trim() === '') {
    newErrors.email = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = 'Email is invalid';
    isValid = false;
  }
  if (!name || name.trim() === '') {
    newErrors.name = 'Name is required';
    isValid = false;
  }
  if (!pinNumber || pinNumber.trim() === '') { // Use pinNumber from destructuring
    newErrors.pinNumber = 'Pin number is required';
    isValid = false;
  }
  if (!mobileNumber || mobileNumber.trim() === '') { // Use mobileNumber from destructuring
    newErrors.mobileNumber = 'Mobile number is required';
    isValid = false;
  } else if (!/^\d{10}$/.test(mobileNumber)) { // Use mobileNumber for validation
    newErrors.mobileNumber = 'Mobile number must be 10 digits';
    isValid = false;
  }
  if (!password || password.trim() === '') {
    newErrors.password = 'Password is required';
    isValid = false;
  } else if (password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
    isValid = false;
  }
  if (!regulationNumber || regulationNumber.trim() === '') {
    newErrors.regulationNumber = 'Regulation number is required';
    isValid = false;
  } else if (!/^\d{2}$/.test(regulationNumber)) {
    newErrors.regulationNumber = 'Regulation number must be 2 digits';
    isValid = false;
  }
  if (!branch || branch.trim() === '' || !['CME', 'CIVIL', 'ECE', 'EEE', 'MECH'].includes(branch)) {
    newErrors.branch = 'Please select a valid branch';
    isValid = false;
  }
  if (!base64Image) {
    newErrors.file_url = 'Photo conversion failed';
    isValid = false;
  }

  if (!isValid) {
    return res.status(400).json({ message: 'Validation failed', errors: newErrors });
  }

  try {
    // MongoDB $or query for existing user checks
    // Use the exact field names as defined in your User model
    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() }, // Always trim and lowercase email for consistency
        { pinNumber: pinNumber.trim() },     // Use 'pin_number' as per your User model schema
        { mobileNumber: mobileNumber.trim() } // Use 'mobilenumber' as per your User model schema
      ]
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
      if (existingUser.pin_number === pinNumber.trim()) {
        return res.status(409).json({ message: 'Pin Number already registered.' });
      }
      if (existingUser.mobilenumber === mobileNumber.trim()) {
        return res.status(409).json({ message: 'Mobile Number already registered.' });
      }
    }

    const user = new User({
      email: email.trim().toLowerCase(), // Save email trimmed and lowercased
      name: name.trim(),
      pinNumber: pinNumber.trim(), // Save as 'pin_number' in DB (assuming your model uses this)
      regulationNumber: regulationNumber.trim(),
      mobileNumber: mobileNumber.trim(), // Save as 'mobilenumber' in DB (assuming your model uses this)
      password: password, // Password will be hashed by pre-save hook in User model
      branch: branch.trim(),
      file_url: base64Image,
      user_role: 'student', // Default role for new signups
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully!', userId: user._id });

  } catch (error) {
    // Check for specific duplicate key errors if the above existingUser check somehow missed it
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
      if (error.keyPattern && error.keyPattern.pin_number) { // Assuming index is on pin_number
        return res.status(409).json({ message: 'Pin Number already registered.' });
      }
      if (error.keyPattern && error.keyPattern.mobileNumber) { // Assuming index is on mobilenumber
        return res.status(409).json({ message: 'Mobile Number already registered.' });
      }
    }
    console.error('Server error during signup:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '' || !password || password.trim() === '') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Assuming user.comparePassword method exists in your User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // No JWT or cookies are set here as per your request.
    // The frontend will receive the user ID and role directly.
    res.status(200).json({
      message: 'Login successful!',
      userId: user._id,
      userRole: user.user_role,
    });

  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ⭐ NEW: Logout Route (simple, without cookies)
// This will just send a success message. Frontend will handle client-side state change.
router.post('/logout', (req, res) => {
    // With no cookies/sessions being managed on the backend, this essentially just tells the client it's logged out.
    // The client-side logic needs to clear any stored user info (e.g., in localStorage) and redirect.
    res.status(200).json({ message: 'Logged out successfully.' });
});


module.exports = router;