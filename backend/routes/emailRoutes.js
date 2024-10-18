// backend/routes/emailRoutes.js
const express = require('express');
const router = express.Router();

// Function to create email routes
const emailRoutes = (transporter) => {
    // POST route to send email
    router.post('/send', async (req, res) => {
        const { peerId, email } = req.body; // Extract data from request body

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Receiver address
            subject: 'Peer ID for Video Call', // Subject line
            text: `Your Peer ID is: ${peerId}`, // Email body
        };

        try {
            await transporter.sendMail(mailOptions); // Send the email
            return res.status(200).json({ message: 'Email sent successfully!' });
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Failed to send email', error });
        }
    });

    return router; // Return the router
};

module.exports = emailRoutes; // Export the emailRoutes function
