'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Instagram, Send, Check } from 'lucide-react';
import { CONTACT_COPY } from '@/data/content';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? 'https://formspree.io/f/mqaeavbl';
const CONTACT_EMAIL = 'neelpatel00235@gmail.com';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailtoFallback, setMailtoFallback] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const contactRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const endpointsRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Header trigger
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Headline parallax / scrub
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 3. Endpoints list trigger
      if (endpointsRef.current) {
        gsap.fromTo(
          endpointsRef.current.children,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: endpointsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 4. Form card trigger
      if (formCardRef.current) {
        gsap.fromTo(
          formCardRef.current,
          { opacity: 0, scale: 0.96, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: formCardRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, contactRef);

    return () => ctx.revert();
  }, []);

  const handleCopyEmail = (e: React.MouseEvent, email: string) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    playSound('click');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    playSound('click');
    setError(null);
    setMailtoFallback(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get('Name') as string) || '';
    const email = (formData.get('Email') as string) || '';
    const message = (formData.get('Message') as string) || '';

    // Provider fields
    const subject = `New enquiry from ${name || 'portfolio visitor'} — neelpatel.com`;
    formData.set('_subject', subject);
    if (email) {
      formData.set('_replyto', email);
    }

    const mailto =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`.slice(0, 1800))}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      let res: Response | null = null;
      let usedSmtp = false;

      // 8c: Try server-side /api/contact first
      try {
        const apiRes = await fetch('/api/contact', {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        // If route does not exist (static host: 404 / 405), fall through to FORM_ENDPOINT
        if (apiRes.status === 404 || apiRes.status === 405) {
          usedSmtp = false;
        } else {
          res = apiRes;
          usedSmtp = true;
        }
      } catch (apiErr: unknown) {
        // If aborted, let outer catch handle it
        if (apiErr instanceof DOMException && apiErr.name === 'AbortError') {
          throw apiErr;
        }
        // On network error or failure reaching /api/contact, fall through to FORM_ENDPOINT
        usedSmtp = false;
      }

      // Fallback: FORM_ENDPOINT (Formspree or custom endpoint)
      if (!usedSmtp || !res) {
        res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      if (res.ok) {
        setSubmitted(true);
        playSound('reveal');
        form.reset();
      } else {
        const errorData = await res.json().catch(() => null);
        const errMsg =
          errorData?.error ||
          errorData?.errors?.[0]?.message ||
          'Form endpoint returned an error. Please email me directly:';
        setError(errMsg);
        setMailtoFallback(mailto);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      setError(
        isAbort
          ? 'Request timed out after 8 seconds. Please email me directly:'
          : 'Unable to deliver message via form endpoint. Please email me directly:'
      );
      setMailtoFallback(mailto);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={contactRef} id="contact" className="relative w-full py-28 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto">
        {/* Section Header */}
        <Reveal variant="fade">
          <div ref={headerRef} className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-6 animate-text-breathe [animation-duration:8.0s] [animation-delay:-0.9s]">
            <span>{CONTACT_COPY.labelNum}</span>
            <span>/</span>
            <span>{CONTACT_COPY.navLabel}</span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Headline & Direct Endpoints */}
          <div className="lg:col-span-6 flex flex-col relative z-20 min-w-0">
            <h2
              ref={headlineRef}
              className="font-taurian text-[clamp(2.2rem,8vw,7.5rem)] text-cream uppercase leading-[0.9] tracking-wide mb-8 [&_.whitespace-nowrap:has(.split-mask)]:block [&_.whitespace-nowrap:not(:has(.split-mask))]:hidden"
            >
              <SplitText text={CONTACT_COPY.headlinePrefix} by="char" className="!block" />
              <span className="block font-script text-terracotta lowercase text-[1.2em] font-normal leading-[0.75] select-none pointer-events-none relative z-10 animate-text-breathe [animation-duration:6.6s] [animation-delay:-2.2s]">
                {CONTACT_COPY.headlineScript}
              </span>
              <SplitText text={CONTACT_COPY.headlineMiddle} by="char" className="!block" />
              <span className="block text-cream relative z-20">
                <SplitText text={CONTACT_COPY.headlineMega} by="char" className="!block" />
              </span>
            </h2>

            {/* Direct Endpoints List */}
            <div ref={endpointsRef} className="flex flex-col gap-4 mt-4 font-mono text-sm text-cream">
              {/* Email */}
              <Reveal variant="up" delay={0.08}>
                <div
                  onClick={(e) => handleCopyEmail(e, 'neelpatel00235@gmail.com')}
                  className="flex items-center justify-between p-4 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  data-cursor={copiedEmail ? 'Copied' : 'Copy'}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-terracotta" />
                    <span className="group-hover:text-terracotta transition-colors">
                      neelpatel00235@gmail.com
                    </span>
                  </div>
                  <span className="text-[0.68rem] text-muted tracking-widest uppercase">
                    {copiedEmail ? 'COPIED!' : 'CLICK TO COPY'}
                  </span>
                </div>
              </Reveal>

              {/* Phone */}
              <Reveal variant="up" delay={0.16}>
                <a
                  href="tel:+919106730866"
                  className="flex items-center justify-between p-4 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                  data-cursor="Call"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-kraft" />
                    <span className="group-hover:text-terracotta transition-colors">
                      +91 91067 30866
                    </span>
                  </div>
                  <span className="text-[0.68rem] text-muted tracking-widest uppercase">
                    CALL
                  </span>
                </a>
              </Reveal>

              {/* Instagram */}
              <Reveal variant="up" delay={0.24}>
                <a
                  href="https://instagram.com/neelvt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                  data-cursor="Open"
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-wine" />
                    <span className="group-hover:text-terracotta transition-colors">
                      @neelvt
                    </span>
                  </div>
                  <span className="text-[0.68rem] text-muted tracking-widest uppercase">
                    FOLLOW
                  </span>
                </a>
              </Reveal>
            </div>
          </div>

          {/* Right Column: 3-Field Contact Card + Honeypot */}
          <Reveal variant="scale" delay={0.15} className="lg:col-span-6 relative z-10">
            <div ref={formCardRef} className="p-8 md:p-10 rounded-2xl bg-ground-2 border border-line shadow-2xl">
              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-cream">Message Delivered</h3>
                  <p className="font-sans text-cream/70 text-sm max-w-sm">
                    Thanks for reaching out. I reply to all inquiries within 24 hours.
                  </p>
                </div>
              ) : (
                <form
                  action={FORM_ENDPOINT}
                  method="POST"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6"
                >
                  {/* Honeypot field for anti-spam */}
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {/* Accessible Error / Fallback Region */}
                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="p-4 rounded-xl bg-wine/20 border border-wine/40 text-cream text-sm flex flex-col gap-2"
                    >
                      <p className="font-sans text-cream/90">{error}</p>
                      {mailtoFallback && (
                        <a
                          href={mailtoFallback}
                          className="font-mono text-xs text-terracotta underline hover:text-kraft transition-colors inline-flex items-center gap-1"
                        >
                          <span>Email me directly instead</span> →
                        </a>
                      )}
                    </div>
                  )}

                  {/* Name */}
                  <Reveal variant="up" delay={0.06}>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="font-mono text-label text-muted tracking-widest uppercase">
                        {CONTACT_COPY.form.nameLabel}
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="Name"
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-lg bg-ground border border-line-2 focus:border-terracotta focus:outline-none font-sans text-cream placeholder:text-muted/40 transition-colors"
                      />
                    </div>
                  </Reveal>

                  {/* Email */}
                  <Reveal variant="up" delay={0.12}>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="font-mono text-label text-muted tracking-widest uppercase">
                        {CONTACT_COPY.form.emailLabel}
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="Email"
                        required
                        placeholder="name@company.com"
                        className="w-full px-4 py-3 rounded-lg bg-ground border border-line-2 focus:border-terracotta focus:outline-none font-sans text-cream placeholder:text-muted/40 transition-colors"
                      />
                    </div>
                  </Reveal>

                  {/* Message */}
                  <Reveal variant="up" delay={0.18}>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="message" className="font-mono text-label text-muted tracking-widest uppercase">
                        {CONTACT_COPY.form.messageLabel}
                      </label>
                      <textarea
                        id="message"
                        name="Message"
                        rows={4}
                        required
                        placeholder="Tell me about your project, timeline and footage format..."
                        className="w-full px-4 py-3 rounded-lg bg-ground border border-line-2 focus:border-terracotta focus:outline-none font-sans text-cream placeholder:text-muted/40 transition-colors resize-none"
                      />
                    </div>
                  </Reveal>

                  {/* Submit button */}
                  <Reveal variant="up" delay={0.24}>
                    <Magnetic strength={0.25} cursor="Enquire">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-terracotta hover:bg-[#ff8838] disabled:opacity-60 disabled:cursor-not-allowed text-ground font-mono text-label font-bold tracking-widest uppercase shadow-xl transition-all duration-200"
                      >
                        <span>{isSubmitting ? 'Sending...' : CONTACT_COPY.form.submitText}</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </Magnetic>
                  </Reveal>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
