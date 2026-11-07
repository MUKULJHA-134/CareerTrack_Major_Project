import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  Briefcase,
  Building,
  User,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { submitContactMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

const ContactPage = () => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    jobTitle: '',
    company: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      await submitContactMessage(formData);
      setSubmitted(true);
      showToast('Message sent successfully! An acknowledgement email was dispatched to your inbox.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit your message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      jobTitle: '',
      company: '',
      message: ''
    });
    setSubmitted(false);
  };

  return (
    <div className="container" style={{ padding: '60px 16px', maxWidth: '1000px' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(79, 70, 229, 0.12)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            color: 'var(--primary-400)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '16px'
          }}
        >
          <Mail size={15} /> Get in Touch with Recruitment Team
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
          Contact CareerTrack Support & Admin
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Have a question about a job opening, an existing application, or recruitment inquiries? Send us a message and our team will get back to you promptly.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}
      >
        {/* Left: Contact Info / Assurance Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="glass-card"
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}
            >
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '8px' }}>
              Direct Gmail Notification
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Submitting this form immediately routes your inquiry to our Administrator's Gmail inbox and dispatches a confirmation email with full details directly to your Gmail.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={18} color="var(--primary-400)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response Time</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>Within 24 to 48 Hours</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={18} color="#10B981" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Application Inquiries</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>Include Reference ID in message</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form / Success Banner */}
        <div
          className="glass-card"
          style={{
            padding: '36px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border-light)'
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}
              >
                <CheckCircle2 size={32} color="#10B981" />
              </div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.4rem', marginBottom: '10px' }}>
                Message Successfully Sent!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Your message has been delivered to the CareerTrack Admin. We have also sent an acknowledgement email to <strong>{formData.email}</strong>.
              </p>
              <button onClick={handleReset} className="btn btn-secondary">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--primary-400)" /> Your Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alex Johnson"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="var(--primary-400)" /> Your Gmail / Email Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. alex.johnson@gmail.com"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={14} color="var(--text-muted)" /> Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="e.g. Senior Frontend Engineer"
                    className="form-input"
                    value={formData.jobTitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} color="var(--text-muted)" /> Company (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Acme Corp"
                    className="form-input"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} color="var(--primary-400)" /> Subject <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. Inquiry regarding application status / Interview reschedule"
                  className="form-input"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">
                  Message <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Type your message here. Mention your application reference ID if applicable..."
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '12px' }}
              >
                {loading ? (
                  'Sending Email...'
                ) : (
                  <>
                    <Send size={16} /> Send Message to Admin
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

