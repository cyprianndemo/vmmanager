const nodemailer = require('nodemailer');
require('dotenv').config();

const sendNotification = async (email, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  let mailOptions = {
    from: `"Your Service" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject,
    text: text
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendNotification };