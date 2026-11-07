const { handleContactUsInquiry } = require('../utils/emailService');

// @desc    Submit Contact Us message
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message, jobTitle, company } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required fields.'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Process email sending
    const result = await handleContactUsInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      jobTitle: jobTitle ? jobTitle.trim() : 'General Inquiry',
      company: company ? company.trim() : 'CareerTrack'
    });

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been submitted! An acknowledgement email has been sent to your address.',
      delivery: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage
};

