const nodemailer = require('nodemailer');
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = require('../config');

let transporter;

if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT, 10),
    secure: EMAIL_SECURE, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    // For development with self-signed certificates (e.g. MailHog, MailCatcher)
    // tls: {
    //   rejectUnauthorized: false 
    // }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification error:', error);
    } else {
      console.log('Email transporter is ready to send emails.');
    }
  });

} else {
  console.warn('Email service is not configured. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM environment variables.');
  // Mock transporter for environments where email is not configured
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('Email sending is not configured. Mock sending email:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('HTML:', mailOptions.html);
      return Promise.resolve({ messageId: 'mock-message-id' });
    }
  };
}


/**
 * Sends an email.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML content of the email.
 * @returns {Promise<object>} - Nodemailer response object.
 */
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.error('Email transporter not initialized. Email not sent.');
    // Potentially throw an error or return a specific status
    return { error: 'Email service not configured.' };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Rethrow or handle as appropriate for your application
    // For now, we'll log and let the main operation continue
    return { error: 'Failed to send email.'}
  }
};

module.exports = { sendEmail };