// backend/controllers/emailController.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // To load environment variables from the .env file

// Create a transporter object using your email service
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as the email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address from environment variables
    pass: process.env.EMAIL_PASS, // Your app password from environment variables
  },
});

// Function to send email
const sendEmail = async (req, res) => {
  const { peerId, email } = req.body; // Extract data from request body

  // Set up email data
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // List of receivers
    subject: 'Peer ID for Video Call', // Subject line
    text: `Your Peer ID is: ${peerId}`, // Plain text body
  };

  try {
    // Send mail
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error });
  }
};

module.exports = {
  sendEmail,
};
