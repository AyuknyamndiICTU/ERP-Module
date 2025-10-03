const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email configuration
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP)
  // In production, configure with real SMTP settings
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development mode - use ethereal email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

/**
 * Send registration approval email to student
 */
const sendRegistrationApprovalEmail = async (studentData, credentials) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@ictu.edu.cm',
      to: studentData.email,
      subject: 'ICTU Registration Approved - Welcome to ICTU!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #2196f3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .credentials { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ICTU</div>
            <h2>Institute of Communication Technology University</h2>
          </div>
          
          <div class="content">
            <h3>🎉 Congratulations! Your Registration Has Been Approved</h3>
            
            <p>Dear ${studentData.firstName} ${studentData.lastName},</p>
            
            <p>We are pleased to inform you that your registration application has been approved by the coordinators. Welcome to the ICTU family!</p>
            
            <div class="credentials">
              <h4>Your ICTU Account Details:</h4>
              <p><strong>Matricule:</strong> ${studentData.matricule}</p>
              <p><strong>Email:</strong> ${studentData.email}</p>
              <p><strong>Temporary Password:</strong> ${credentials.tempPassword}</p>
              <p><strong>Faculty:</strong> ${studentData.faculty?.name || 'N/A'}</p>
              <p><strong>Department:</strong> ${studentData.department?.name || 'N/A'}</p>
              <p><strong>Major:</strong> ${studentData.major?.name || 'N/A'}</p>
            </div>
            
            <h4>Next Steps:</h4>
            <ol>
              <li>Login to the ICTU portal using your email and temporary password</li>
              <li>Change your password immediately after first login</li>
              <li>Complete your profile information</li>
              <li>Check your course enrollment and timetable</li>
              <li>Complete fee payment as per the installment schedule</li>
            </ol>
            
            <p><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">ICTU Student Portal</a></p>
            
            <p><strong>Important:</strong> Please change your temporary password immediately after your first login for security purposes.</p>
            
            <p>If you have any questions or need assistance, please contact:</p>
            <ul>
              <li>Academic Office: academic@ictu.edu.cm</li>
              <li>Finance Office: finance@ictu.edu.cm</li>
              <li>IT Support: support@ictu.edu.cm</li>
            </ul>
            
            <p>We look forward to your academic journey with us!</p>
            
            <p>Best regards,<br>
            ICTU Administration<br>
            Institute of Communication Technology University</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Institute of Communication Technology University. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Registration approval email sent to ${studentData.email}. Message ID: ${info.messageId}`);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending registration approval email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send registration rejection email to student
 */
const sendRegistrationRejectionEmail = async (studentData, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@ictu.edu.cm',
      to: studentData.email,
      subject: 'ICTU Registration Application Update',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .reason { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ICTU</div>
            <h2>Institute of Communication Technology University</h2>
          </div>
          
          <div class="content">
            <h3>Registration Application Update</h3>
            
            <p>Dear ${studentData.firstName} ${studentData.lastName},</p>
            
            <p>Thank you for your interest in joining the Institute of Communication Technology University (ICTU).</p>
            
            <p>After careful review by our coordinators, we regret to inform you that your registration application (Matricule: ${studentData.matricule}) cannot be approved at this time.</p>
            
            <div class="reason">
              <h4>Reason:</h4>
              <p>${reason}</p>
            </div>
            
            <h4>What You Can Do:</h4>
            <ul>
              <li>Review the reason provided above</li>
              <li>Address any issues mentioned</li>
              <li>Submit a new application if you meet the requirements</li>
              <li>Contact our admissions office for clarification</li>
            </ul>
            
            <p>If you believe this decision was made in error or if you have additional information to support your application, please contact:</p>
            <ul>
              <li>Admissions Office: admissions@ictu.edu.cm</li>
              <li>Academic Office: academic@ictu.edu.cm</li>
              <li>Phone: +237 XXX XXX XXX</li>
            </ul>
            
            <p>We appreciate your understanding and encourage you to reapply once you have addressed the concerns mentioned.</p>
            
            <p>Best regards,<br>
            ICTU Admissions Team<br>
            Institute of Communication Technology University</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Institute of Communication Technology University. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Registration rejection email sent to ${studentData.email}. Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending registration rejection email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send fee payment reminder email
 */
const sendFeePaymentReminderEmail = async (studentData, installmentDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@ictu.edu.cm',
      to: studentData.email,
      subject: 'ICTU Fee Payment Reminder',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .installment { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ICTU</div>
            <h2>Fee Payment Reminder</h2>
          </div>
          
          <div class="content">
            <h3>⚠️ Fee Payment Due</h3>
            
            <p>Dear ${studentData.firstName} ${studentData.lastName},</p>
            
            <p>This is a reminder that your fee payment is due. Please ensure timely payment to avoid any disruption to your academic activities.</p>
            
            <div class="installment">
              <h4>Payment Details:</h4>
              <p><strong>Matricule:</strong> ${studentData.matricule}</p>
              <p><strong>Amount Due:</strong> ${installmentDetails.amount} FCFA</p>
              <p><strong>Due Date:</strong> ${installmentDetails.dueDate}</p>
              <p><strong>Semester:</strong> ${installmentDetails.semester}</p>
            </div>
            
            <p><strong>Payment Methods:</strong></p>
            <ul>
              <li>Bank Transfer</li>
              <li>Mobile Money</li>
              <li>Cash Payment at Finance Office</li>
            </ul>
            
            <p><strong>Important:</strong> Access to the student portal may be restricted if payment is not received by the due date.</p>
            
            <p>For payment assistance or queries, contact:</p>
            <ul>
              <li>Finance Office: finance@ictu.edu.cm</li>
              <li>Phone: +237 XXX XXX XXX</li>
            </ul>
            
            <p>Thank you for your prompt attention to this matter.</p>
            
            <p>Best regards,<br>
            ICTU Finance Department</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Institute of Communication Technology University. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Fee payment reminder email sent to ${studentData.email}. Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending fee payment reminder email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRegistrationApprovalEmail,
  sendRegistrationRejectionEmail,
  sendFeePaymentReminderEmail
};
