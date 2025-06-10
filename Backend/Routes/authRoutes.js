const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// --- Multer Configuration for in-memory storage ---
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

// --- Helper function to generate JWT and set cookie ---
const generateTokenAndSetCookie = (user, statusCode, res) => {
    // 1. Generate JWT
    const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, pinNumber: user.pinNumber, branch: user.branch, user_role: user.user_role },
        process.env.JWT_SECRET, // Use your secret key from .env
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    // 2. Set JWT as an HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        sameSite: 'Lax', // Protects against CSRF attacks. 'Strict' is more secure but might affect some use cases. 'Lax' is a good balance.
        maxAge: 3600000 // 1 hour in milliseconds (matches token expiration)
    });

    // 3. Send success response (can include some non-sensitive user data)
    res.status(statusCode).json({
        message: 'Login Success !',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            pinNumber: user.pinNumber,
            branch: user.branch,
            userRole: user.user_role
        }
    });
};


// --- Signup Route ---
router.post('/signup', upload.single('photo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No photo uploaded or invalid file type.' });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const {
        email,
        name,
        pinNumber,
        regulationNumber,
        mobileNumber,
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
    if (!pinNumber || pinNumber.trim() === '') {
        newErrors.pinNumber = 'Pin number is required';
        isValid = false;
    }
    if (!mobileNumber || mobileNumber.trim() === '') {
        newErrors.mobileNumber = 'Mobile number is required';
        isValid = false;
    } else if (!/^\d{10}$/.test(mobileNumber)) {
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
        // Use consistent field names as per your User model (User.js)
        const existingUser = await User.findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { pinNumber: pinNumber.trim() }, // Make sure your User model uses 'pinNumber'
                { mobileNumber: mobileNumber.trim() } // Make sure your User model uses 'mobileNumber'
            ]
        });

        if (existingUser) {
            if (existingUser.email.toLowerCase() === email.toLowerCase()) {
                return res.status(409).json({ message: 'Email already registered.' });
            }
            if (existingUser.pinNumber === pinNumber.trim()) { // Check using 'pinNumber'
                return res.status(409).json({ message: 'Pin Number already registered.' });
            }
            if (existingUser.mobileNumber === mobileNumber.trim()) { // Check using 'mobileNumber'
                return res.status(409).json({ message: 'Mobile Number already registered.' });
            }
        }

        const user = new User({
            email: email.trim().toLowerCase(),
            name: name.trim(),
            pinNumber: pinNumber.trim(),
            regulationNumber: regulationNumber.trim(),
            mobileNumber: mobileNumber.trim(),
            password: password, // Will be hashed by pre-save hook
            branch: branch.trim(),
            file_url: base64Image,
            user_role: 'student' // Default role for new signups
        });

        await user.save();

        // Do NOT set cookie or auto-login after signup
        res.status(201).json({ message: 'Signed up successfully!' });

    } catch (error) {
        // Check for specific duplicate key errors
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.email) {
                return res.status(409).json({ message: 'Email already registered.' });
            }
            if (error.keyPattern && error.keyPattern.pinNumber) { // Use 'pinNumber'
                return res.status(409).json({ message: 'Pin Number already registered.' });
            }
            if (error.keyPattern && error.keyPattern.mobileNumber) { // Use 'mobileNumber'
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
            // Use generic message for security instead of "User not found"
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare password using bcrypt
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Use generic message for security instead of "Invalid password"
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT and set it as an HTTP-only cookie
        generateTokenAndSetCookie(user, 200, res);

    } catch (error) {
        console.error('Server error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- Logout Route ---
router.post('/logout', (req, res) => {
    // Clear the 'token' cookie by setting its expiration to a past date
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        expires: new Date(0) // Expire the cookie immediately
    });

    res.status(200).json({ message: 'Logged out successfully.' });
});

// --- Protected /me Route ---
router.get('/me', protect, async (req, res) => {
  if (req.user) {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        pinNumber: req.user.pinNumber,
        branch: req.user.branch,
        userRole: req.user.user_role // Include role
      }
    });
  } else {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

module.exports = router;