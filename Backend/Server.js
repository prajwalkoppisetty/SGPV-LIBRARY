const Express = require('express');
const Mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ⭐ ADD THIS LINE: Import the path module
require('dotenv').config();

const app = Express();
const PORT = process.env.PORT || 3000; // Define PORT for consistent use

app.use(Express.json());
app.use(cors());

// ⭐ ADD THIS LINE: Serve static files from the 'uploads' directory
// This makes files in 'backend/uploads' accessible via '/uploads' URL path from the browser
app.use('/uploads', Express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("Error: MONGO_URI is not defined in your .env file!");
    console.error("Please create a .env file in your project root with MONGO_URI=<your_connection_string>");
    process.exit(1);
}

// ⭐ MODIFY THIS LINE: Remove deprecated options if Mongoose v6+ is used
Mongoose.connect(mongoURI)
.then(() => {
    console.log('MongoDB Atlas Connected! 🚀');
})
.catch((err) => {
    console.error('MongoDB Atlas Connection Error:', err);
    console.error('Error details:', err.message);
    process.exit(1);
});

// --- Routes ---

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SGPV Library Backend Status</title>
        </head>
        <body>
            <h1>Welcome to the Library Management System Backend!</h1>
            <p>Your server is running correctly and connected to MongoDB Atlas.</p>
            <p>Use API endpoints to interact with the system.</p>
        </body>
        </html>
    `);
});

// ⭐ ADD THESE LINES: Import and use your authentication routes
const authRoutes = require('../Backend/Routes/authRoutes'); // Assuming authRoutes.js is in a 'routes' folder
app.use('/api/auth', authRoutes); // All routes in authRoutes will be prefixed with /api/auth

// server
app.listen(PORT, () => { // ⭐ MODIFY THIS LINE: Use the PORT variable
    console.log(`Server is running on port ${PORT}`);
});