// src/api/emailService.js
import axios from 'axios'; // Ensure axios is imported

export const sendEmail = async (peerId, email) => {
  console.log('Sending email with data:', { peerId, email }); // Log the data being sent
  
  try {
   // const response = await axios.post('http://localhost:5000/api/email/send', {
    const response = await axios.post('https://8e80-27-107-137-62.ngrok-free.app/api/email/send', {
      peerId,
      email
    });
    return response.data; // Return the response data if successful
  } catch (error) {
    console.error('Error sending email:', error); // Log the error for debugging
    throw new Error('Failed to send email. Please try again.'); // Throw an error for further handling
  }
};


