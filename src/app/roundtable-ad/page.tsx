'use client';

import { useEffect, useRef } from 'react';

export default function RoundtableAdPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    containerRef.current.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        :root {
          --rt-blue:       #5C9DD7;
          --rt-blue-light: #87BCE8;
          --rt-blue-dark:  #2E72B0;
          --rt-bg:         #090910;
          --rt-bg-card:    rgba(255,255,255,0.04);
          --rt-rule:       rgba(255,255,255,0.08);
          --rt-text:       #f0f0f0;
          --rt-text-2:     rgba(240,240,240,0.6);
          --rt-text-3:     rgba(240,240,240,0.35);
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          background: 'var(--rt-bg)',
          color: 'var(--rt-text)',
          overflowX: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          minHeight: '100vh',
        }}
      >
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Grain overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            pointerEvents: 'none',
            opacity: 0.045,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
          }}
        />

        {/* Ambient background */}
        <div
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}
        >
          <div className="rt-orb rt-orb-1" />
          <div className="rt-orb rt-orb-2" />
          <div className="rt-orb rt-orb-3" />
          <div className="rt-grid-lines" />
        </div>

        <div className="rt-container">
          {/* Logo */}
          <div className="rt-logo-wrap">
            <img src="/images/aod-logo.svg" alt="Acres of Diamonds" />
          </div>

          {/* Hero split */}
          <section className="rt-hero-split">
            <div className="rt-hero-text">
              <div className="rt-hero-eyebrow">The AOD Roundtable</div>
              <h1 className="rt-h1">
                Stop Filling<br />Your Calendar.<br />
                <span className="rt-h1-accent">
                  Start Controlling<br />The Room.
                </span>
              </h1>
              <p className="rt-hero-tagline">
                One talk. Ten coffee meetings. Two qualified. One sale. There's a smarter way to
                filter leads — and it starts here.
              </p>
              <a
                href="https://aodform.vercel.app"
                className="rt-btn-primary rt-btn-hero"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply Now
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            <div className="rt-video-card" style={{ animation: 'rtFadeIn 0.9s ease-out 0.4s both' }}>
              <video playsInline controls preload="metadata" poster="/video-poster.jpg">
                <source src="/FiveToSevenRoomExplainer.mp4" type="video/mp4" />
              </video>
            </div>
          </section>

          {/* Divider */}
          <hr className="rt-rule reveal" />

          {/* Final CTA */}
          <section className="rt-final-cta reveal">
            <div className="rt-cta-label">Private Roundtable</div>
            <h2 className="rt-cta-heading">
              Seven Seats.<br />
              <span>Apply If You're Serious.</span>
            </h2>
            <a
              href="https://aodform.vercel.app"
              className="rt-btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply Now
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </section>

          {/* Footer logo */}
          <div className="rt-footer-logo reveal">
            <img src="/images/aod-logo.svg" alt="Acres of Diamonds" />
          </div>
        </div>

        <style>{`
          /* ─── SCOPED ROUNDTABLE STYLES ─── */

          .rt-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
          }
          .rt-orb-1 {
            width: 900px; height: 900px;
            background: radial-gradient(circle, rgba(92,157,215,0.28) 0%, transparent 65%);
            top: -420px; right: -300px;
            animation: rtDrift1 30s ease-in-out infinite;
          }
          .rt-orb-2 {
            width: 600px; height: 600px;
            background: radial-gradient(circle, rgba(46,114,176,0.2) 0%, transparent 65%);
            bottom: -200px; left: -200px;
            animation: rtDrift2 36s ease-in-out infinite;
          }
          .rt-orb-3 {
            width: 350px; height: 350px;
            background: radial-gradient(circle, rgba(92,157,215,0.12) 0%, transparent 65%);
            top: 50%; left: 40%;
            animation: rtDrift3 24s ease-in-out infinite;
          }
          @keyframes rtDrift1 {
            0%,100% { transform: translate(0,0); }
            40%  { transform: translate(-60px, 80px); }
            70%  { transform: translate(40px,-40px); }
          }
          @keyframes rtDrift2 {
            0%,100% { transform: translate(0,0); }
            35%  { transform: translate(80px,-60px); }
            70%  { transform: translate(-30px, 50px); }
          }
          @keyframes rtDrift3 {
            0%,100% { transform: translate(0,0); }
            50%  { transform: translate(-100px, 60px); }
          }

          .rt-grid-lines {
            position: absolute; inset: 0;
            background-image:
              linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
            background-size: 72px 72px;
            mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%);
          }

          /* ─── LAYOUT ─── */
          .rt-container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 3rem 2.5rem 6rem;
            position: relative;
            z-index: 1;
          }

          /* ─── SCROLL REVEALS ─── */
          .reveal {
            opacity: 0;
            transform: translateY(32px);
            transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
          }
          .reveal.visible {
            opacity: 1;
            transform: translateY(0);
          }

          /* ─── LOAD ANIMATIONS ─── */
          @keyframes rtFadeUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes rtFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          /* ─── LOGO ─── */
          .rt-logo-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 2.5rem;
            animation: rtFadeIn 0.8s ease-out 0.1s both;
          }
          .rt-logo-wrap img {
            height: 44px;
            width: auto;
            opacity: 0.88;
          }

          /* ─── HERO SPLIT ─── */
          .rt-hero-split {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            margin-bottom: 5rem;
          }
          .rt-hero-text {
            text-align: left;
          }
          .rt-hero-eyebrow {
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: var(--rt-blue);
            margin-bottom: 1.25rem;
            animation: rtFadeUp 0.6s ease-out 0.2s both;
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }
          .rt-hero-eyebrow::before {
            content: '';
            display: block;
            width: 24px;
            height: 1px;
            background: var(--rt-blue);
            flex-shrink: 0;
          }
          .rt-h1 {
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(3rem, 5.5vw, 5.5rem);
            line-height: 0.92;
            letter-spacing: 0.02em;
            color: var(--rt-text);
            margin-bottom: 0.2em;
            animation: rtFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both;
          }
          .rt-h1-accent {
            color: var(--rt-blue);
          }
          .rt-hero-tagline {
            font-size: 1rem;
            color: var(--rt-text-2);
            line-height: 1.75;
            margin: 1.25rem 0 2.25rem;
            animation: rtFadeUp 0.6s ease-out 0.45s both;
          }

          /* ─── BUTTON ─── */
          .rt-btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--rt-blue);
            color: #fff;
            padding: 1.05rem 2.5rem;
            border-radius: 10px;
            font-size: 0.95rem;
            font-weight: 700;
            text-decoration: none;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            box-shadow: 0 0 0 0 rgba(92,157,215,0.5);
            transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
            position: relative;
          }
          .rt-btn-primary::after {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 11px;
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
            pointer-events: none;
          }
          .rt-btn-primary:hover {
            background: var(--rt-blue-light);
            transform: translateY(-2px);
            box-shadow: 0 12px 36px rgba(92,157,215,0.4);
          }
          .rt-btn-primary svg {
            transition: transform 0.25s ease;
          }
          .rt-btn-primary:hover svg {
            transform: translateX(4px);
          }
          .rt-btn-hero {
            animation: rtFadeUp 0.6s ease-out 0.55s both;
          }

          /* ─── VIDEO ─── */
          .rt-video-card {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            background: rgba(92,157,215,0.04);
            border: 1px solid rgba(92,157,215,0.18);
            box-shadow:
              0 0 0 1px rgba(92,157,215,0.08),
              0 40px 100px rgba(0,0,0,0.6),
              0 0 80px rgba(92,157,215,0.08);
          }
          .rt-video-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(92,157,215,0.06) 0%, transparent 50%);
            pointer-events: none;
            z-index: 1;
          }
          .rt-video-card video {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 20px;
            position: relative;
            z-index: 0;
          }

          /* ─── DIVIDER ─── */
          hr.rt-rule {
            border: none;
            border-top: 1px solid var(--rt-rule);
            margin: 0 0 4rem;
          }

          /* ─── FINAL CTA ─── */
          .rt-final-cta {
            text-align: center;
          }
          .rt-cta-label {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: var(--rt-blue);
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }
          .rt-cta-label::before,
          .rt-cta-label::after {
            content: '';
            display: block;
            width: 24px;
            height: 1px;
            background: var(--rt-blue);
          }
          .rt-cta-heading {
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(3rem, 7vw, 5.5rem);
            letter-spacing: 0.03em;
            line-height: 1;
            color: var(--rt-text);
            margin-bottom: 2.5rem;
          }
          .rt-cta-heading span {
            color: var(--rt-blue);
          }

          /* ─── FOOTER LOGO ─── */
          .rt-footer-logo {
            margin-top: 4rem;
            padding-top: 3rem;
            border-top: 1px solid var(--rt-rule);
            display: flex;
            justify-content: center;
            opacity: 0.45;
          }
          .rt-footer-logo img {
            height: 36px;
            width: auto;
          }

          /* ─── RESPONSIVE ─── */
          @media (max-width: 768px) {
            .rt-hero-split {
              grid-template-columns: 1fr;
              gap: 2.5rem;
            }
            .rt-hero-text {
              text-align: center;
            }
            .rt-hero-eyebrow {
              justify-content: center;
            }
            .rt-btn-hero {
              width: 100%;
              justify-content: center;
            }
          }
          @media (max-width: 640px) {
            .rt-container {
              padding: 2.5rem 1.5rem 4rem;
            }
            .rt-h1 {
              font-size: 3rem;
            }
            .rt-cta-heading {
              font-size: 2.8rem;
            }
            .rt-hero-tagline {
              font-size: 0.95rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
