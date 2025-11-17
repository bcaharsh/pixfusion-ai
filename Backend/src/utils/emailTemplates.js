const welcomeEmail = (name) => {
  return {
    subject: 'Welcome to ImageGen AI!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ImageGen AI! 🎨</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining ImageGen AI! We're excited to have you on board.</p>
            <p>You've been credited with <strong>5 free image generations</strong> to get started. Create stunning AI-generated images with just a few clicks!</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Start Creating</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy creating!<br>The ImageGen AI Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ImageGen AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const subscriptionSuccessEmail = (name, planName, credits) => {
  return {
    subject: `Welcome to ${planName} Plan!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .badge { background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Activated!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your subscription to the <span class="badge">${planName}</span> plan has been activated!</p>
            <p>You now have <strong>${credits} image generation credits</strong> available.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Start Creating</a>
            </p>
            <p>Thank you for your support!</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const passwordResetEmail = (name, resetUrl) => {
  return {
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const creditsLowEmail = (name, remainingCredits) => {
  return {
    subject: 'Your Credits Are Running Low',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Credits Running Low</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>You have only <strong>${remainingCredits} credits</strong> remaining in your account.</p>
            <p>Upgrade your plan to continue creating amazing AI-generated images without interruption.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/pricing" class="button">Upgrade Now</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

module.exports = {
  welcomeEmail,
  subscriptionSuccessEmail,
  passwordResetEmail,
  creditsLowEmail
};