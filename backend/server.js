// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');
const nodemailer = require('nodemailer'); // Import nodemailer
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    origin: 'https://8e80-27-107-137-62.ngrok-free.app'// This allows your frontend to communicate with the backend
}));
app.use(bodyParser.json());

// Create a transporter object using your email service
const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail as the email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address from environment variables
        pass: process.env.EMAIL_PASS, // Your app password from environment variables
    },
});

// Routes
app.use('/api/email', emailRoutes(transporter)); // Pass transporter to emailRoutes

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
