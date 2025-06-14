const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Assuming you have bcrypt for password hashing

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pinNumber: { // ⭐ This is the critical field
    type: String, // Ensure it's String to match frontend input
    required: true, // ⭐ IMPORTANT: Prevents saving null or undefined
    unique: true,   // ⭐ Ensures no duplicates
    trim: true,
  },
  regulationNumber: {
    type: String, // Or Number, depending on your exact usage
    required: true,
    trim: true,
  },
  mobileNumber: { // Ensure this matches your backend field name
    type: String, // Storing as string to preserve leading zeros if any
    required: true,
    unique: true, // Often mobile numbers are unique too
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  file_url: { // This will store the Base64 image string
    type: String,
    required: true,
  },
  user_role: {
    type: String,
    enum: ['student', 'admin', 'librarian'], // Example roles
    default: 'student',
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const OrderSchema = new mongoose.Schema({
  Order_ID: {
    type: String,
    required: true,
  },
  User_Name: {
    type: String,
    required: true,
  },
  Subjects: [
    {
      code: { type: String, required: true },
      name: { type: String, required: true }
    }
  ],
  Order_Date: {
    type: String, // Store as "DD-MM-YYYY"
    default: function () {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  },
  Status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  }
});

// Hash password before saving (important for security)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', OrderSchema);
// Export the Models
module.exports = User;
module.exports.Order = Order;