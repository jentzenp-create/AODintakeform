'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ===== Types =====
interface FormData {
  referrer: string;
  name: string;
  phone: string;
  email: string;
  business_name: string;
  goals: string;
  custom_goal: string;
  connections: string;
  custom_connection: string;
}

interface StepConfig {
  key: keyof FormData;
  number: string;
  question: string;
  subtitle?: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'select';
  options?: string[];
  validation?: (value: string) => string | null;
}

// ===== Step Configuration =====
const steps: StepConfig[] = [
  {
    key: 'referrer',
    number: '01',
    question: 'Who sent you here?',
    subtitle: 'Select from the list below.',
    placeholder: 'Select who referred you...',
    type: 'select',
    options: ['Joe Wexler', 'Jentzen Pepple'],
    validation: (v) => (!v ? 'Please select who sent you' : null),
  },
  {
    key: 'name',
    number: '02',
    question: "What's your name?",
    subtitle: "Let's start with a proper introduction.",
    placeholder: 'Type your full name...',
    type: 'text',
    validation: (v) => (v.trim().length < 2 ? 'Please enter your name' : null),
  },
  {
    key: 'phone',
    number: '03',
    question: "What's your phone number?",
    subtitle: 'The best number to reach you at.',
    placeholder: '(555) 123-4567',
    type: 'tel',
    validation: (v) => {
      const digits = v.replace(/\D/g, '');
      return digits.length < 10 ? 'Please enter a valid phone number' : null;
    },
  },
  {
    key: 'email',
    number: '04',
    question: "What's your email address?",
    subtitle: "We'll use this to keep in touch.",
    placeholder: 'you@company.com',
    type: 'email',
    validation: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Please enter a valid email address',
  },
  {
    key: 'business_name',
    number: '05',
    question: "What's your business name?",
    subtitle: "Tell us about your company or organization.",
    placeholder: 'Your business or organization...',
    type: 'text',
    validation: (v) => (v.trim().length < 2 ? 'Please enter your business name' : null),
  },
  {
    key: 'goals',
    number: '06',
    question: 'What goals are you trying to achieve this month or this year?',
    subtitle: 'Think big — we want to help you get there.',
    placeholder: 'Select your main goal...',
    type: 'select',
    options: [
      'Grow Disposable Income',
      'Free up Your Time',
      'Bring More Magic Into Your Life'
    ],
    validation: (v) => (!v ? 'Please select a goal' : null),
  },
  {
    key: 'connections',
    number: '07',
    question: 'Who do you need to meet to help you accomplish those goals?',
    subtitle: "That's what we're here for — connecting you with the right people.",
    placeholder: 'Select a category...',
    type: 'select',
    options: [
      'Community Leaders',
      'Finance, Accounting, Professional Services',
      'Leadership',
      'Veterans and Medical',
      'Real Estate',
      'Other'
    ],
    validation: (v) => (!v ? 'Please select who you need to meet' : null),
  },
];

// ===== Phone Formatter =====
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

// ===== Animation Variants =====
const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.98,
  }),
};

// ===== Component =====
export default function IntakeForm() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    referrer: '',
    name: '',
    phone: '',
    email: '',
    business_name: '',
    goals: '',
    custom_goal: '',
    connections: '',
    custom_connection: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // ===== GHL Calendar Configuration =====
  const GHL_CALENDAR_URL = 'https://api.leadconnectorhq.com/widget/booking/LpLtnmSUQgUXS7ewMbmI';

  // Push pre-fill params to parent URL and load GHL embed script
  useEffect(() => {
    if (showBooking) {
      // Build params for pre-filling
      const params = new URLSearchParams();
      if (formData.name) {
        const nameParts = formData.name.trim().split(/\s+/);
        params.set('first_name', nameParts[0] || '');
        params.set('last_name', nameParts.slice(1).join(' ') || '');
        params.set('name', formData.name.trim());
      }
      if (formData.email) params.set('email', formData.email.trim());
      if (formData.phone) {
        // Send digits only for better GHL compatibility
        const phoneDigits = formData.phone.replace(/\D/g, '');
        params.set('phone', phoneDigits);
      }

      // Set params on the parent page URL so form_embed.js picks them up
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

      // Remove any existing GHL script so it re-initializes with new URL params
      const existingScript = document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Load GHL embed script (will read parent URL params)
      const script = document.createElement('script');
      script.src = 'https://link.msgsndr.com/js/form_embed.js';
      script.type = 'text/javascript';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Clean up URL params when leaving booking screen
        window.history.replaceState({}, '', window.location.pathname);
      };
    }
  }, [showBooking, formData]);

  // Build the pre-filled calendar iframe URL (belt-and-suspenders: params on both iframe src AND parent URL)
  const getCalendarUrl = () => {
    const params = new URLSearchParams();
    if (formData.name) {
      const nameParts = formData.name.trim().split(/\s+/);
      params.set('first_name', nameParts[0] || '');
      params.set('last_name', nameParts.slice(1).join(' ') || '');
      params.set('name', formData.name.trim());
    }
    if (formData.email) params.set('email', formData.email.trim());
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      params.set('phone', phoneDigits);
    }
    return `${GHL_CALENDAR_URL}?${params.toString()}`;
  };

  // Total steps for progress (not counting welcome)
  const totalSteps = steps.length;
  const progressPercent = currentStep < 0 ? 0 : ((currentStep + 1) / totalSteps) * 100;

  // Auto-focus input on step change
  useEffect(() => {
    if (currentStep >= 0 && inputRef.current) {
      // Focus after the animation has mostly settled
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const validateCurrentStep = useCallback((): boolean => {
    if (currentStep < 0) return true;
    const step = steps[currentStep];
    const value = formData[step.key];
    const error = step.validation?.(value);
    if (error) {
      setErrors((prev) => ({ ...prev, [step.key]: error }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[step.key];
      return next;
    });
    return true;
  }, [currentStep, formData]);

  const goNext = useCallback(async () => {
    if (!validateCurrentStep()) return;

    // If on last step, submit
    if (currentStep === totalSteps - 1) {
      setIsSubmitting(true);

      const submitData = { ...formData };
      if (submitData.goals && submitData.custom_goal) {
        submitData.goals = `${submitData.goals}\n\nElaboration: ${submitData.custom_goal}`;
      }
      if (submitData.connections === 'Other') {
        submitData.connections = submitData.custom_connection ? `Other: ${submitData.custom_connection}` : 'Other';
      } else if (submitData.connections && submitData.custom_connection) {
        submitData.connections = `${submitData.connections}\n\nElaboration: ${submitData.custom_connection}`;
      }

      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        if (!res.ok) throw new Error('Failed to submit');
        setIsComplete(true);
      } catch {
        setErrors((prev) => ({
          ...prev,
          _submit: 'Something went wrong. Please try again.',
        }));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setDirection(1);
    setCurrentStep((s) => s + 1);
  }, [currentStep, formData, totalSteps, validateCurrentStep]);

  const goBack = useCallback(() => {
    if (currentStep <= -1) return;
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleInputChange = (key: keyof FormData, value: string) => {
    const formatted = key === 'phone' ? formatPhone(value) : value;
    setFormData((prev) => ({ ...prev, [key]: formatted }));
    // Clear error on type
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const step = steps[currentStep];
      // For textareas, require Ctrl/Cmd+Enter
      if (step?.type === 'textarea') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          goNext();
        }
        return;
      }
      e.preventDefault();
      goNext();
    }
  };

  // ===== Welcome Screen =====
  if (currentStep === -1 && !isComplete) {
    return (
      <>
        <div className="bg-animated">
          <div className="orb-1" />
          <div className="orb-2" />
          <div className="grid-overlay" />
        </div>

        <div className="form-container">
          <AnimatePresence mode="wait">
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="step-wrapper"
              style={{ textAlign: 'center', alignItems: 'center' }}
            >
              {/* Decorative Icon */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(92,157,215,0.2), rgba(92,157,215,0.05))',
                border: '1px solid rgba(92,157,215,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5C9DD7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>

              <h1 className="welcome-title">Acres of Diamonds</h1>
              <p className="welcome-subtitle">
                The wealth of opportunity is closer than you think. Tell us your story, and we&apos;ll help you find the diamonds in your own journey.
              </p>

              <div style={{ marginTop: '1rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setDirection(1);
                    setCurrentStep(0);
                  }}
                  style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}
                >
                  Get Started
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                Takes about 3 minutes to complete
              </p>

              <div style={{ marginTop: '3rem', opacity: 0.5 }}>
                <Link href="/dashboard" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                  DIAMOND PORTAL
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </>
    );
  }

  // ===== Post-Submission: Booking Screen =====
  if (isComplete && showBooking) {
    return (
      <>
        <div className="bg-animated">
          <div className="orb-1" />
          <div className="orb-2" />
          <div className="grid-overlay" />
        </div>

        <div className="booking-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="booking-wrapper"
          >
            {/* Header */}
            <div className="booking-header">
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(92,157,215,0.25), rgba(92,157,215,0.08))',
                border: '1px solid rgba(92,157,215,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C9DD7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h18" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                </svg>
              </div>
              <div>
                <h2 className="booking-title">Book Your Roundtable</h2>
                <p className="booking-subtitle">
                  Choose a day that works best for you. Your info has been pre-filled!
                </p>
              </div>
            </div>

            {/* Pre-filled info badge */}
            <motion.div
              className="booking-prefill-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Pre-filled for {formData.name || 'you'}</span>
            </motion.div>

            {/* GHL Calendar Embed */}
            <motion.div
              className="booking-calendar-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <iframe
                src={getCalendarUrl()}
                className="booking-calendar-iframe"
                title="Book a Roundtable"
                frameBorder="0"
                allowFullScreen
              />
            </motion.div>

            {/* Skip link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ textAlign: 'center', marginTop: '1.5rem' }}
            >
              <button
                onClick={() => setShowBooking(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                ← Back to confirmation
              </button>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  // ===== Thank You Screen =====
  if (isComplete) {
    return (
      <>
        <div className="bg-animated">
          <div className="orb-1" />
          <div className="orb-2" />
          <div className="grid-overlay" />
        </div>

        <div className="form-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="thankyou-container"
          >
            <motion.div
              className="thankyou-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>

            <motion.h2
              className="thankyou-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Thank You!
            </motion.h2>

            <motion.p
              className="thankyou-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Thank you for your submission! We will be looking for opportunities to connect you with the right people to help you achieve your goals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                width: 200,
                height: 2,
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                marginTop: '0.5rem',
              }}
            />

            {/* Book a Roundtable CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              style={{ marginTop: '2rem', textAlign: 'center' }}
            >
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Ready to take the next step? Join us at a roundtable!
              </p>
              <button
                className="btn-primary"
                onClick={() => setShowBooking(true)}
                style={{ padding: '1rem 2rem', fontSize: '1rem', gap: '0.5rem' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h18" />
                </svg>
                Book a Roundtable
              </button>
            </motion.div>

            <div style={{ marginTop: '3rem', opacity: 0.5 }}>
              <Link href="/dashboard" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                DIAMOND PORTAL
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // ===== Form Steps =====
  const step = steps[currentStep];
  const currentValue = formData[step.key];
  const hasError = errors[step.key];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      <div className="bg-animated">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="grid-overlay" />
      </div>

      <div className="form-container" style={{ paddingBottom: '6rem' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="step-wrapper"
          >
            <div>
              <p className="question-number">Question {step.number} of {String(totalSteps).padStart(2, '0')}</p>
              <h2 className="question-text">{step.question}</h2>
              {step.subtitle && <p className="question-subtitle">{step.subtitle}</p>}
            </div>

            <div>
              {step.type === 'textarea' ? (
                <textarea
                  ref={inputRef as React.Ref<HTMLTextAreaElement>}
                  className="form-textarea"
                  placeholder={step.placeholder}
                  value={currentValue}
                  onChange={(e) => handleInputChange(step.key, e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                />
              ) : step.type === 'select' ? (
                <>
                  <select
                    ref={inputRef as React.Ref<HTMLSelectElement>}
                    className="form-input"
                    style={{
                      cursor: 'pointer',
                      appearance: 'none',
                      marginBottom: (step.key === 'goals' && currentValue) || (step.key === 'connections' && currentValue === 'Other') ? '1rem' : '0'
                    }}
                    value={currentValue}
                    onChange={(e) => handleInputChange(step.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                  >
                    <option value="" disabled style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.4)' }}>
                      {step.placeholder}
                    </option>
                    {step.options?.map((opt) => (
                      <option key={opt} value={opt} style={{ background: '#0a0a0f', color: '#fff' }}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {step.key === 'goals' && currentValue && (
                    <motion.textarea
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="form-textarea"
                      placeholder="Tell us more (optional)..."
                      value={formData.custom_goal}
                      onChange={(e) => handleInputChange('custom_goal', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          goNext();
                        }
                      }}
                      rows={3}
                      autoFocus
                    />
                  )}

                  {step.key === 'connections' && currentValue === 'Other' && (
                    <motion.textarea
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="form-textarea"
                      placeholder="Tell us more (optional)..."
                      value={formData.custom_connection}
                      onChange={(e) => handleInputChange('custom_connection', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          goNext();
                        }
                      }}
                      rows={3}
                      autoFocus
                    />
                  )}
                </>
              ) : (
                <input
                  ref={inputRef as React.Ref<HTMLInputElement>}
                  className="form-input"
                  type={step.type}
                  placeholder={step.placeholder}
                  value={currentValue}
                  onChange={(e) => handleInputChange(step.key, e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete={
                    step.key === 'email' ? 'email' :
                      step.key === 'phone' ? 'tel' :
                        step.key === 'name' ? 'name' : 'off'
                  }
                />
              )}
              {hasError && (
                <motion.p
                  className="error-text"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {hasError}
                </motion.p>
              )}
            </div>

            <div className="btn-group">
              {currentStep > 0 && (
                <button className="btn-secondary" onClick={goBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}

              <button
                className="btn-primary"
                onClick={goNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Submitting...
                  </>
                ) : isLastStep ? (
                  <>
                    Submit
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </>
                ) : (
                  <>
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {errors._submit && (
              <motion.p
                className="error-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center' }}
              >
                {errors._submit}
              </motion.p>
            )}

            <div className="keyboard-hint">
              {step.type === 'textarea' || (step.key === 'goals' && currentValue) || (step.key === 'connections' && currentValue === 'Other') ? (
                <>Press <span className="kbd">Ctrl</span> + <span className="kbd">Enter ↵</span> to continue</>
              ) : step.type === 'select' ? (
                <>Use arrows to select, then <span className="kbd">Enter ↵</span> to continue</>
              ) : (
                <>Press <span className="kbd">Enter ↵</span> to continue</>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-inner">
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <span className="progress-label">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
      </div>
    </>
  );
}
