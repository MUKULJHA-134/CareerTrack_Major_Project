require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

const user = process.env.EMAIL_USER;
const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

console.log('=== CareerTrack Email Diagnostic ===');
console.log('EMAIL_USER   :', user);
console.log('EMAIL_PASS   :', pass ? `(set, length=${pass.length})` : '(NOT SET)');
console.log('ADMIN_EMAIL  :', process.env.ADMIN_EMAIL);
console.log('');

if (!user || !pass) {
  console.log('ERROR: EMAIL_USER or EMAIL_PASS is missing in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

console.log('Step 1: Verifying SMTP connection to Gmail...');
transporter.verify(function (error, success) {
  if (error) {
    console.log('VERIFY FAILED!');
    console.log('  Error code    :', error.code);
    console.log('  Error message :', error.message);
    if (error.code === 'EAUTH') {
      console.log('');
      console.log('  CAUSE: Gmail authentication failed.');
      console.log('  FIX: The App Password is wrong or expired, OR');
      console.log('       2-Step Verification is OFF on your Google Account.');
      console.log('  SOLUTION:');
      console.log('    1. Go to https://myaccount.google.com/apppasswords');
      console.log('    2. Make sure 2-Step Verification is ON');
      console.log('    3. Create a NEW App Password and paste it in backend/.env EMAIL_PASS');
    }
    return;
  }

  console.log('Step 1: SMTP connection VERIFIED successfully!');
  console.log('Step 2: Sending test email to', process.env.ADMIN_EMAIL, '...');

  transporter.sendMail({
    from: 'CareerTrack Recruitment <' + user + '>',
    to: process.env.ADMIN_EMAIL,
    subject: 'CareerTrack Test Email - System Working!',
    html: '<h2>CareerTrack Email Test</h2><p>If you received this, your Gmail notification system is working correctly!</p>'
  }, function (err, info) {
    if (err) {
      console.log('SEND FAILED:', err.message);
    } else {
      console.log('');
      console.log('SUCCESS! Test email sent!');
      console.log('MessageId:', info.messageId);
      console.log('');
      console.log('Check inbox of:', process.env.ADMIN_EMAIL);
      console.log('Also check SPAM / Promotions folder if not in inbox.');
    }
  });
});

