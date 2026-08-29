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

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
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
    playSound('click');
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/mqaeavbl', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setSubmitted(true);
        playSound('reveal');
        form.reset();
      } else {
        // Fallback to mailto
        window.location.href = `mailto:neelpatel00235@gmail.com?subject=Project%20Inquiry&body=${encodeURIComponent(
          formData.get('Message') as string
        )}`;
      }
    } catch {
      window.location.href = 'mailto:neelpatel00235@gmail.com';
    }
  };

  return (
    <section ref={contactRef} id="contact" className="relative w-full py-28 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto">
        {/* Section Header */}
        <Reveal variant="fade">
          <div ref={headerRef} className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-6">
            <span>{CONTACT_COPY.labelNum}</span>
            <span>/</span>
            <span>{CONTACT_COPY.navLabel}</span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Headline & Direct Endpoints */}
          <div className="lg:col-span-6 flex flex-col relative z-20">
            <h2 ref={headlineRef} className="font-display font-black text-huge sm:text-mega text-cream uppercase leading-[0.9] tracking-tight mb-8 font-variation-wonk">
              <SplitText text={CONTACT_COPY.headlinePrefix} by="char" />
              <span className="inline-block font-script text-terracotta lowercase text-[0.92em] sm:text-[1.08em] lg:text-[1.85em] font-normal leading-[0.68] -my-[0.22em] lg:-my-[0.34em] mx-1 sm:mx-2 select-none pointer-events-none relative z-10">
                {CONTACT_COPY.headlineScript}
              </span>
              <SplitText text={CONTACT_COPY.headlineMiddle} by="char" />
              <span className="block text-cream relative z-20">
                <SplitText text={CONTACT_COPY.headlineMega} by="char" />
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
                  action="https://formspree.io/f/mqaeavbl"
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
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-bold tracking-widest uppercase shadow-xl transition-all duration-200"
                      >
                        <span>{CONTACT_COPY.form.submitText}</span>
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
