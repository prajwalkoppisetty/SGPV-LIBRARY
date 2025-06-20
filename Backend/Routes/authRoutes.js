const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Order } = require('../models/User'); // Correctly import Order model
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const nodemailer = require('nodemailer');

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
    {
        id: user._id,
        email: user.email,
        name: user.name,
        pinNumber: user.pinNumber,
        branch: user.branch,
        user_role: user.user_role,
        mobileNumber: user.mobileNumber // <-- keep this, it's small
        // file_url: user.file_url      // <-- REMOVE THIS LINE!
    },
    process.env.JWT_SECRET,
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
            userRole: user.user_role,
            mobileNumber: user.mobileNumber,
            file_url: user.file_url // <-- OK to send in response body
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
  try {
    // Fetch user from DB using id from JWT
    const user = await User.findById(req.user.id);
    if (user) {
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          pinNumber: user.pinNumber,
          branch: user.branch,
          userRole: user.user_role,
          mobileNumber: user.mobileNumber,
          file_url: user.file_url
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

//Orders Route-to Create the order by Student
router.post('/Create_Order', protect, async (req, res) => {
  const { Order_ID, subjects } = req.body;

  if (!Order_ID || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: 'Order ID and subjects array are required.' });
  }

  // Check for duplicate Order_ID
  const exists = await Order.exists({ Order_ID });
  if (exists) {
    return res.status(409).json({ message: 'Order ID already exists. Please try again.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const order = new Order({
      Order_ID,
      User_Name: user.name,
      Subjects: subjects,
      Status: 'pending'
    });

    await order.save();

    res.status(201).json({ message: 'Order created successfully!', Order_ID, order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order.' });
  }
});

// Check if Order_ID exists (for uniqueness)
router.get('/check_order_id/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await Order.exists({ Order_ID: id });
    res.json({ exists: !!exists });
  } catch {
    res.json({ exists: false });
  }
});

// Get all orders for the logged-in user
router.get('/my_orders', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Find all orders for this user (by User_Name)
    const orders = await Order.find({ User_Name: user.name }).sort({ Order_Date: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
});

// Admin: Get all pending orders
router.get('/admin/orders', protect, adminOnly, async (req, res) => {
  // TODO: Add admin check if needed
  try {
    const orders = await Order.find({ Status: 'pending' }).sort({ Order_Date: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// Admin: Accept order
router.post('/admin/orders/:id/accept', protect, adminOnly, async (req, res) => {
  // TODO: Add admin check if needed
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.Status = 'approved';
    await order.save();

    // Fetch user email and mobile
    const user = await User.findOne({ name: order.User_Name });

    // Attractive, business-style email
    if (user && user.email) {
      await sendEmail(
        user.email,
        'Your SGPV Library Order Has Been Accepted!',
        `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="color: #2563eb;">Hey ${user.name},</h2>
          <p>
            <strong>I am the SGPV Library Admin.</strong><br>
            We are pleased to inform you that your order <b>(Order ID: ${order.Order_ID})</b> has been <span style="color:green;font-weight:bold;">ACCEPTED</span>!
          </p>
          <p>
            <b>Order Details:</b>
            <ul>
              ${order.Subjects.map(subj => `<li><b>${subj.code}</b> - ${subj.name}</li>`).join('')}
            </ul>
          </p>
          <p>
            You will be notified when your books are ready for pickup.<br>
            Thank you for using <b>Sai Ganapathi Library</b>!
          </p>
          <hr>
          <p style="font-size:13px;color:#888;">This is an automated message from SGPV Library. Please do not reply.</p>
        </div>
        `
      );
    }

    res.json({ message: 'Order accepted and student notified.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept order.' });
  }
});

// Admin: Reject order
router.post('/admin/orders/:id/reject', protect, adminOnly, async (req, res) => {
  // TODO: Add admin check if needed
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Rejection reason required.' });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.Status = 'rejected';
    order.Reject_Reason = reason;
    await order.save();

    // Fetch user email and mobile
    const user = await User.findOne({ name: order.User_Name });

    // Attractive, business-style email
    if (user && user.email) {
      await sendEmail(
        user.email,
        'Your SGPV Library Order Has Been Rejected',
        `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="color: #dc2626;">Hey ${user.name},</h2>
          <p>
            <strong>I am the SGPV Library Admin.</strong><br>
            Unfortunately, your order <b>(Order ID: ${order.Order_ID})</b> has been <span style="color:red;font-weight:bold;">REJECTED</span>.
          </p>
          <p>
            <b>Reason for rejection:</b><br>
            <span style="color:#dc2626;">${reason}</span>
          </p>
          <p>
            If you have any questions, please contact the library staff.<br>
            Thank you for using <b>Sai Ganapathi Library</b>.
          </p>
          <hr>
          <p style="font-size:13px;color:#888;">This is an automated message from SGPV Library. Please do not reply.</p>
        </div>
        `
      );
    }

    res.json({ message: 'Order rejected and student notified.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject order.' });
  }
});

// Admin: Search order by Order_ID
router.get('/admin/orders/search/:orderId', protect, adminOnly, async (req, res) => {
  // TODO: Add admin check if needed
  try {
    const order = await Order.findOne({ Order_ID: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to search order.' });
  }
});

// Admin: Get all accepted, rejected, recieved, and completed orders (Order History)
router.get('/admin/orders/history', protect, adminOnly, async (req, res) => {
  try {
    // Include all relevant statuses for history
    const orders = await Order.find({ Status: { $in: ['rejected', 'completed'] } }).sort({ Order_Date: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order history.' });
  }
});

// Admin: Get all approved orders that are not yet marked as 'given'
router.get('/admin/orders/approved', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({ Status: 'approved' }).sort({ Order_Date: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approved orders.' });
  }
});

// Admin: Mark order as 'given' (recieved) and set Return_Date (14 days from today), send email, move to history
router.post('/admin/orders/:id/give', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Only allow if currently approved
    if (order.Status !== 'approved') {
      return res.status(400).json({ message: 'Order must be approved before giving.' });
    }

    // Set status and return date
    order.Status = 'recieved';
    const today = new Date();
    today.setDate(today.getDate() + 14);
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    order.Return_Date = `${day}-${month}-${year}`;

    await order.save();

    // Fetch user email
    const user = await User.findOne({ name: order.User_Name });

    // Send professional email with deadline
    if (user && user.email) {
      await sendEmail(
        user.email,
        'Books Issued - SGPV Library',
        `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="color: #2563eb;">Hey ${user.name},</h2>
          <p>
            <strong>I am the SGPV Library Admin.</strong><br>
            Your books for order <b>(Order ID: ${order.Order_ID})</b> have been <span style="color:green;font-weight:bold;">issued</span> to you.
          </p>
          <p>
            <b>Return Deadline:</b> <span style="color:#dc2626;">${order.Return_Date}</span>
          </p>
          <p>
            Please make sure to return the books on or before the deadline to avoid any penalties.<br>
            Thank you for using <b>Sai Ganapathi Library</b>!
          </p>
          <hr>
          <p style="font-size:13px;color:#888;">This is an automated message from SGPV Library. Please do not reply.</p>
        </div>
        `
      );
    }

    res.json({ message: 'Order marked as given and return deadline emailed to student.', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order.' });
  }
});

// Admin: Get all orders with status 'recieved' (books with students)
router.get('/admin/orders/recieved', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({ Status: 'recieved' }).sort({ Order_Date: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch taken books.' });
  }
});

// Admin: Mark order as returned (completed) and send thank you email
router.post('/admin/orders/:id/returned', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Only allow if currently 'recieved'
    if (order.Status !== 'recieved') {
      return res.status(400).json({ message: 'Order must be in recieved status.' });
    }

    // Set status to 'completed' and set Returned_Date to today
    order.Status = 'completed';
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    order.Returned_Date = `${day}-${month}-${year}`;
    await order.save();

    // Fetch user email
    const user = await User.findOne({ name: order.User_Name });

    // Send thank you email
    if (user && user.email) {
      await sendEmail(
        user.email,
        'Thank You for Returning Books - SGPV Library',
        `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="color: #2563eb;">Hey ${user.name},</h2>
          <p>
            <strong>I am the SGPV Library Admin.</strong><br>
            Thank you for returning your books (Order ID: <b>${order.Order_ID}</b>) on time!
          </p>
          <p>
            We appreciate your responsibility. You may now borrow new books as per library policy.<br>
            Thank you for using <b>Sai Ganapathi Library</b>!
          </p>
          <hr>
          <p style="font-size:13px;color:#888;">This is an automated message from SGPV Library. Please do not reply.</p>
        </div>
        `
      );
    }

    res.json({ message: 'Book marked as returned and thank you email sent.', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order.' });
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'prajwalkoppisettyhp@gmail.com',
        pass: 'msufopllixbzsfra' // Use an App Password, not your real password
    }
});

function sendEmail(to, subject, html) {
    return transporter.sendMail({
        to,
        subject,
        html
    });
}

module.exports = router;