const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { getEmailTemplate } = require('../utils/emailTemplates');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const emailService = {
  // Send email
  sendEmail: async ({ to, subject, html, text }) => {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '')
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
      
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  },

  // Welcome email
  sendWelcomeEmail: async (email, name) => {
    const subject = 'Welcome to Image9!';
    const html = getEmailTemplate('welcome', { name });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Password reset email
  sendPasswordResetEmail: async (email, name, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password';
    const html = getEmailTemplate('passwordReset', { name, resetUrl });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Password changed email
  sendPasswordChangedEmail: async (email, name) => {
    const subject = 'Password Changed Successfully';
    const html = getEmailTemplate('passwordChanged', { name });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Subscription confirmation
  sendSubscriptionConfirmation: async (email, name, planName, amount) => {
    const subject = 'Subscription Confirmed';
    const html = getEmailTemplate('subscriptionConfirmation', {
      name,
      planName,
      amount
    });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Subscription cancelled
  sendSubscriptionCancelled: async (email, name, planName) => {
    const subject = 'Subscription Cancelled';
    const html = getEmailTemplate('subscriptionCancelled', { name, planName });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Subscription expiry warning
  sendSubscriptionExpiryWarning: async (email, name, planName, expiryDate, daysRemaining) => {
    const subject = `Your ${planName} subscription expires in ${daysRemaining} days`;
    const html = getEmailTemplate('subscriptionExpiring', {
      name,
      planName,
      expiryDate,
      daysRemaining
    });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Subscription expired
  sendSubscriptionExpired: async (email, name, planName) => {
    const subject = 'Your Subscription Has Expired';
    const html = getEmailTemplate('subscriptionExpired', { name, planName });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Payment success
  sendPaymentSuccessEmail: async (email, name, amount) => {
    const subject = 'Payment Successful';
    const html = getEmailTemplate('paymentSuccess', { name, amount });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Payment failed
  sendPaymentFailedEmail: async (email, name, amount) => {
    const subject = 'Payment Failed';
    const html = getEmailTemplate('paymentFailed', { name, amount });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Refund processed
  sendRefundProcessedEmail: async (email, name, amount) => {
    const subject = 'Refund Processed';
    const html = getEmailTemplate('refundProcessed', { name, amount });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Email changed notification
  sendEmailChangedNotification: async (email, name) => {
    const subject = 'Email Address Changed';
    const html = getEmailTemplate('emailChanged', { name });

    return emailService.sendEmail({ to: email, subject, html });
  },

  // Account deleted
  sendAccountDeletedEmail: async (email, name) => {
    const subject = 'Account Deleted';
    const html = getEmailTemplate('accountDeleted', { name });

    return emailService.sendEmail({ to: email, subject, html });
  }
};

module.exports = emailService;