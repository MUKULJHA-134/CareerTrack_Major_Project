const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transporter
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      '⚠️ [Email Service] EMAIL_USER or EMAIL_PASS not set in .env. Emails will be logged to console instead of dispatched.'
    );
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 465,
    secure: process.env.EMAIL_SECURE === 'true' || true,
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, '') // remove spaces from Gmail app password if present
    },
    tls: {
      // Fix: Bypass self-signed certificate errors from local proxies / antivirus SSL inspection
      rejectUnauthorized: false
    }
  });
};

const getFromAddress = () => {
  const user = process.env.EMAIL_USER || 'no-reply@careertrack.com';
  const name = process.env.EMAIL_FROM_NAME || 'CareerTrack Careers';
  return `"${name}" <${user}>`;
};

const getAdminEmail = () => {
  return process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@careertrack.com';
};

/**
 * Base Responsive HTML Email Template with CareerTrack Branding
 */
const renderBaseTemplate = ({
  badgeText = 'CareerTrack Notification',
  badgeColor = '#4F46E5',
  heading = 'Application Notification',
  subtitle = 'Job Application & Recruitment Portal',
  contentHtml = '',
  recipientEmail = ''
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0f19;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%);
      padding: 32px 28px;
      text-align: center;
      border-bottom: 1px solid #374151;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }
    .logo-symbol {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
    }
    .brand-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
    }
    .brand-subtitle {
      color: #94a3b8;
      font-size: 13px;
      margin: 0;
    }
    .body {
      padding: 32px 28px;
      color: #cbd5e1;
      line-height: 1.6;
      font-size: 15px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: ${badgeColor}22;
      color: ${badgeColor};
      border: 1px solid ${badgeColor}55;
      margin-bottom: 16px;
    }
    .heading {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .info-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #334155;
      font-size: 14px;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #94a3b8;
      font-weight: 500;
    }
    .info-value {
      color: #f1f5f9;
      font-weight: 600;
      text-align: right;
    }
    .message-box {
      background: rgba(79, 70, 229, 0.08);
      border-left: 4px solid #6366f1;
      padding: 16px;
      border-radius: 4px;
      margin: 20px 0;
      color: #e2e8f0;
      white-space: pre-line;
    }
    .footer {
      background-color: #0d131f;
      padding: 24px 28px;
      text-align: center;
      border-top: 1px solid #1f2937;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #818cf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <span class="logo-symbol">💼</span>
        </div>
        <h1 class="brand-title">CareerTrack</h1>
        <p class="brand-subtitle">${subtitle}</p>
      </div>

      <div class="body">
        <div class="badge">${badgeText}</div>
        <h2 class="heading">${heading}</h2>
        ${contentHtml}
      </div>

      <div class="footer">
        <p style="margin: 0 0 8px 0;">This email was automatically generated and sent to <strong style="color: #94a3b8;">${recipientEmail || 'you'}</strong>.</p>
        <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} CareerTrack Recruitment System. All rights reserved.</p>
        <p style="margin: 0;">Need assistance? Contact our team at <a href="mailto:${getAdminEmail()}">${getAdminEmail()}</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generic Sender helper
 */
const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = getFromAddress();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`📧 [MOCK EMAIL DISPATCH]`);
    console.log(`From:    ${from}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`------------------------------------------------------`);
    console.log(text || '(HTML Body Rendered)');
    console.log(`======================================================\n`);
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html
    });
    console.log(`✅ [Email Service] Dispatched to ${to}: MessageId=${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [Email Service Error] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. User Application Confirmation Email
 */
const sendCandidateApplicationConfirmation = async (application, job) => {
  const applicationDate = new Date(application.createdAt || Date.now()).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const contentHtml = `
    <p>Dear <strong>${application.candidateName}</strong>,</p>
    <p>Thank you for your interest in joining <strong>${job.company || 'our team'}</strong>. We have successfully received your job application for the position of <strong>${job.title}</strong>.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Application Ref ID</span>
        <span class="info-value" style="color: #38bdf8;">${application.applicationReferenceId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Job Title</span>
        <span class="info-value">${job.title}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Company</span>
        <span class="info-value">${job.company}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Department</span>
        <span class="info-value">${job.department || 'General'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Submission Date</span>
        <span class="info-value">${applicationDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Status</span>
        <span class="info-value" style="color: #a855f7;">Application Received</span>
      </div>
    </div>

    <p>Our recruiting team will thoroughly evaluate your qualifications, resume, and experience against the requirements for this role. You will receive real-time email notifications whenever your application status advances in the recruitment cycle.</p>
    <p>Please keep your Application Reference ID (<strong>${application.applicationReferenceId}</strong>) for any future correspondence regarding this application.</p>
    <br/>
    <p style="margin-bottom: 0;">Warm regards,<br/><strong>${job.company} Talent Acquisition Team</strong><br/>via CareerTrack</p>
  `;

  const html = renderBaseTemplate({
    badgeText: 'Application Received',
    badgeColor: '#10B981',
    heading: `Application Received: ${job.title}`,
    subtitle: `${job.company} Recruitment Portal`,
    contentHtml,
    recipientEmail: application.email
  });

  return sendMail({
    to: application.email,
    subject: `Application Received: ${job.title} at ${job.company} [Ref: ${application.applicationReferenceId}]`,
    html,
    text: `Hello ${application.candidateName}, your application for ${job.title} at ${job.company} has been received. Reference ID: ${application.applicationReferenceId}`
  });
};

/**
 * 2. Admin Notification on New Job Application
 */
const sendAdminApplicationNotification = async (application, job) => {
  const adminEmail = getAdminEmail();
  const applicationDate = new Date(application.createdAt || Date.now()).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const contentHtml = `
    <p>Hello Administrator,</p>
    <p>A new candidate has submitted an application through the CareerTrack public portal.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Applicant Name</span>
        <span class="info-value" style="color: #ffffff;">${application.candidateName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Applicant Email</span>
        <span class="info-value">${application.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Applicant Phone</span>
        <span class="info-value">${application.phone}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Job Applied For</span>
        <span class="info-value" style="color: #38bdf8;">${job.title}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Company</span>
        <span class="info-value">${job.company}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Experience</span>
        <span class="info-value">${application.experienceYears} Years</span>
      </div>
      <div class="info-row">
        <span class="info-label">Education</span>
        <span class="info-value">${application.education}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Reference ID</span>
        <span class="info-value">${application.applicationReferenceId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Submission Date</span>
        <span class="info-value">${applicationDate}</span>
      </div>
    </div>

    ${
      application.technicalSkills && application.technicalSkills.length > 0
        ? `<p><strong>Technical Skills:</strong> ${application.technicalSkills.join(', ')}</p>`
        : ''
    }

    <p>You can review this candidate's resume, update recruitment status, and log notes in the Admin Dashboard.</p>
  `;

  const html = renderBaseTemplate({
    badgeText: 'New Applicant Alert',
    badgeColor: '#6366F1',
    heading: `New Candidate: ${application.candidateName}`,
    subtitle: 'CareerTrack Recruiter Notification',
    contentHtml,
    recipientEmail: adminEmail
  });

  return sendMail({
    to: adminEmail,
    subject: `🔔 New Application: ${application.candidateName} applied for ${job.title} (${job.company})`,
    html,
    text: `New application received from ${application.candidateName} for ${job.title} at ${job.company}. Email: ${application.email}, Phone: ${application.phone}`
  });
};

/**
 * 3. Status Change Notification to User
 * Supported statuses:
 * - 'Submitted' / 'Application Received'
 * - 'Under Review'
 * - 'Shortlisted'
 * - 'Interview Scheduled'
 * - 'Selected'
 * - 'Rejected'
 */
const sendStatusUpdateNotification = async (application, job, newStatus, customNotes = '') => {
  const configs = {
    'Submitted': {
      badge: 'Application Received',
      color: '#10B981',
      heading: `Application Received: ${job.title}`,
      lead: `Your application has been received and logged into our recruitment system.`
    },
    'Under Review': {
      badge: 'Under Review',
      color: '#3B82F6',
      heading: `Application Status: Under Review`,
      lead: `Great news! Our hiring managers and technical recruiters are currently reviewing your background and profile for the <strong>${job.title}</strong> role at <strong>${job.company}</strong>.`
    },
    'Shortlisted': {
      badge: 'Shortlisted',
      color: '#8B5CF6',
      heading: `Congratulations! You are Shortlisted for ${job.title}`,
      lead: `We are excited to share that your application has been <strong>shortlisted</strong> for <strong>${job.title}</strong> at <strong>${job.company}</strong>! Your technical background and qualifications stood out among applicants.`
    },
    'Interview Scheduled': {
      badge: 'Interview Scheduled',
      color: '#F59E0B',
      heading: `Interview Scheduled: ${job.title}`,
      lead: `We are pleased to invite you for an interview for the <strong>${job.title}</strong> position at <strong>${job.company}</strong>.`
    },
    'Selected': {
      badge: 'Offer / Selected',
      color: '#10B981',
      heading: `Congratulations! You are Selected for ${job.title}`,
      lead: `We are thrilled to inform you that you have been <strong>selected</strong> for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>! The entire recruitment panel was deeply impressed by your performance.`
    },
    'Rejected': {
      badge: 'Application Update',
      color: '#EF4444',
      heading: `Update on your application for ${job.title}`,
      lead: `Thank you for taking the time and interest to apply for <strong>${job.title}</strong> with <strong>${job.company}</strong>. Unfortunately, we have decided to move forward with other candidates whose profiles more closely align with our immediate hiring requirements.`
    }
  };

  const statusConfig = configs[newStatus] || {
    badge: newStatus,
    color: '#6366F1',
    heading: `Application Status Updated: ${newStatus}`,
    lead: `The status of your application for <strong>${job.title}</strong> at <strong>${job.company}</strong> has been updated to: <strong>${newStatus}</strong>.`
  };

  const contentHtml = `
    <p>Dear <strong>${application.candidateName}</strong>,</p>
    <p>${statusConfig.lead}</p>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">To</span>
        <span class="info-value">${application.candidateName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Candidate Email</span>
        <span class="info-value">${application.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Company Name</span>
        <span class="info-value" style="color: #ffffff;">${job.company}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Job Title</span>
        <span class="info-value" style="color: #38bdf8;">${job.title}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Application Ref ID</span>
        <span class="info-value">${application.applicationReferenceId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Status</span>
        <span class="info-value" style="color: ${statusConfig.color}; font-size: 15px;">● ${newStatus}</span>
      </div>
    </div>

    ${
      customNotes
        ? `
        <div class="message-box">
          <strong style="display: block; margin-bottom: 6px; color: #818cf8;">Note from Recruiting Team:</strong>
          ${customNotes}
        </div>
        `
        : ''
    }

    ${
      newStatus === 'Selected'
        ? `<p style="color: #34d399; font-weight: 500;">Our Human Resources coordinator will soon reach out with your formal offer package and onboarding documentation.</p>`
        : newStatus === 'Interview Scheduled'
        ? `<p style="color: #fcd34d; font-weight: 500;">Our coordinator will connect with you shortly with the meeting link, date & time slot, and interview panel details.</p>`
        : newStatus === 'Rejected'
        ? `<p>We truly appreciate your effort and wish you every success in your professional endeavors. We will retain your profile for suitable future opportunities.</p>`
        : `<p>We will keep you informed as your application progresses through subsequent stages.</p>`
    }

    <br/>
    <p style="margin-bottom: 0;">Thank you,<br/><strong>${job.company} Hiring Team</strong><br/>via CareerTrack</p>
  `;

  const html = renderBaseTemplate({
    badgeText: statusConfig.badge,
    badgeColor: statusConfig.color,
    heading: statusConfig.heading,
    subtitle: `${job.company} Recruitment Status`,
    contentHtml,
    recipientEmail: application.email
  });

  return sendMail({
    to: application.email,
    subject: `Status Update: ${newStatus} - ${job.title} at ${job.company}`,
    html,
    text: `Hello ${application.candidateName}, your application status for ${job.title} at ${job.company} has been updated to "${newStatus}". Ref ID: ${application.applicationReferenceId}`
  });
};

/**
 * 4. Admin Sends Direct Custom Message to Candidate
 */
const sendAdminDirectMessage = async ({
  candidateName,
  candidateEmail,
  jobTitle,
  company,
  applicationReferenceId,
  subject,
  message,
  messageType = 'General Update'
}) => {
  const contentHtml = `
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>You have received an official communication from the recruitment team regarding your application.</p>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">To</span>
        <span class="info-value">${candidateName} (${candidateEmail})</span>
      </div>
      <div class="info-row">
        <span class="info-label">Company Name</span>
        <span class="info-value" style="color: #ffffff;">${company}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Job Title</span>
        <span class="info-value" style="color: #38bdf8;">${jobTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Application Ref ID</span>
        <span class="info-value">${applicationReferenceId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Notice Type</span>
        <span class="info-value" style="color: #a78bfa;">${messageType}</span>
      </div>
    </div>

    <div class="message-box">
      <strong style="display: block; margin-bottom: 8px; color: #818cf8; font-size: 14px;">Message from Hiring Team:</strong>
      ${message}
    </div>

    <p>If you have any questions or need to follow up, you can reply directly to this email.</p>
    <br/>
    <p style="margin-bottom: 0;">Thank you,<br/><strong>${company} Recruitment Team</strong><br/>Candidate: ${candidateEmail}</p>
  `;

  const html = renderBaseTemplate({
    badgeText: messageType,
    badgeColor: '#4F46E5',
    heading: subject || `Recruitment Notice: ${jobTitle}`,
    subtitle: `${company} Talent Acquisition`,
    contentHtml,
    recipientEmail: candidateEmail
  });

  return sendMail({
    to: candidateEmail,
    subject: `[CareerTrack] ${subject} - ${jobTitle} (${company})`,
    html,
    text: `Hello ${candidateName},\n\nMessage regarding your application for ${jobTitle} at ${company}:\n\n${message}\n\nRef: ${applicationReferenceId}`
  });
};

/**
 * 5. Contact Us Form:
 * a) Message from User sent to Admin
 * b) Acknowledgment sent to User
 */
const handleContactUsInquiry = async ({
  name,
  email,
  subject,
  message,
  jobTitle = 'General Inquiry',
  company = 'CareerTrack'
}) => {
  const adminEmail = getAdminEmail();
  const inquiryDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 1. Email to Admin
  const adminContentHtml = `
    <p>Hello Administrator,</p>
    <p>A new user inquiry has been submitted via the <strong>Contact Us</strong> portal form.</p>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">From Name</span>
        <span class="info-value" style="color: #ffffff;">${name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">From Email</span>
        <span class="info-value" style="color: #38bdf8;">${email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Subject</span>
        <span class="info-value">${subject}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Job / Topic</span>
        <span class="info-value">${jobTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Company Mentioned</span>
        <span class="info-value">${company}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date Submitted</span>
        <span class="info-value">${inquiryDate}</span>
      </div>
    </div>

    <div class="message-box">
      <strong style="display: block; margin-bottom: 8px; color: #818cf8;">User Inquiry Message:</strong>
      ${message}
    </div>

    <p>You can reply directly to the user by writing to <a href="mailto:${email}" style="color: #818cf8;">${email}</a>.</p>
  `;

  const adminHtml = renderBaseTemplate({
    badgeText: 'Contact Form Message',
    badgeColor: '#F59E0B',
    heading: `Inquiry from ${name}: ${subject}`,
    subtitle: 'CareerTrack User Support Portal',
    contentHtml: adminContentHtml,
    recipientEmail: adminEmail
  });

  const adminResult = await sendMail({
    to: adminEmail,
    subject: `📩 Contact Form Inquiry from ${name}: "${subject}"`,
    html: adminHtml,
    text: `New contact form inquiry from ${name} (${email}):\nSubject: ${subject}\nMessage:\n${message}`
  });

  // 2. Acknowledgment Email to User
  const userContentHtml = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for reaching out to <strong>CareerTrack</strong>. We have received your message, and our support & recruitment administration team will review your inquiry shortly.</p>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">To</span>
        <span class="info-value">${name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">User Email</span>
        <span class="info-value" style="color: #38bdf8;">${email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Subject</span>
        <span class="info-value">${subject}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Job Title / Topic</span>
        <span class="info-value">${jobTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Company</span>
        <span class="info-value">${company}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Received At</span>
        <span class="info-value">${inquiryDate}</span>
      </div>
    </div>

    <div class="message-box">
      <strong style="display: block; margin-bottom: 8px; color: #818cf8;">Your Submitted Message:</strong>
      ${message}
    </div>

    <p>Our team usually responds within 24 to 48 business hours. If your message is regarding an existing job application, please have your application reference ID ready.</p>
    <br/>
    <p style="margin-bottom: 0;">Thank you,<br/><strong>The CareerTrack Support & Operations Team</strong><br/>Recipient: ${email}</p>
  `;

  const userHtml = renderBaseTemplate({
    badgeText: 'Message Received',
    badgeColor: '#10B981',
    heading: 'We Received Your Message',
    subtitle: 'CareerTrack Help & Candidate Inquiries',
    contentHtml: userContentHtml,
    recipientEmail: email
  });

  const userResult = await sendMail({
    to: email,
    subject: `We have received your message: ${subject} - CareerTrack Support`,
    html: userHtml,
    text: `Hello ${name},\n\nThank you for reaching out to CareerTrack. We have received your inquiry regarding "${subject}". Our team will get back to you shortly.\n\nYour message:\n${message}`
  });

  return { adminResult, userResult };
};

module.exports = {
  sendCandidateApplicationConfirmation,
  sendAdminApplicationNotification,
  sendStatusUpdateNotification,
  sendAdminDirectMessage,
  handleContactUsInquiry
};

