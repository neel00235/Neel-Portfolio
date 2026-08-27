'use client';

import React, { useState } from 'react';
import { Mail, Phone, Instagram, Send, Check } from 'lucide-react';
import { CONTACT_COPY } from '@/data/content';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

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
    <section id="contact" className="relative w-full py-28 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-6">
          <span>{CONTACT_COPY.labelNum}</span>
          <span>/</span>
          <span>{CONTACT_COPY.navLabel}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Headline & Direct Endpoints */}
          <div className="lg:col-span-6 flex flex-col">
            <h2 className="font-display font-black text-huge sm:text-mega text-cream uppercase leading-[0.9] tracking-tight mb-8">
              <span>{CONTACT_COPY.headlinePrefix}</span>
              <span className="font-script text-terracotta lowercase text-[1.1em] font-normal leading-none mx-2">
                {CONTACT_COPY.headlineScript}
              </span>
              <span>{CONTACT_COPY.headlineMiddle}</span>
              <span className="block text-cream">{CONTACT_COPY.headlineMega}</span>
            </h2>

            {/* Direct Endpoints List */}
            <div className="flex flex-col gap-4 mt-4 font-mono text-sm text-cream">
              {/* Email */}
              <div
                onClick={(e) => handleCopyEmail(e, 'neelpatel00235@gmail.com')}
                className="flex items-center justify-between p-4 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta transition-colors cursor-pointer group"
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

              {/* Phone */}
              <a
                href="tel:+919106730866"
                className="flex items-center justify-between p-4 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta transition-colors group"
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

              {/* Instagram */}
              <a
                href="https://instagram.com/neelvt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta transition-colors group"
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
            </div>
          </div>

          {/* Right Column: 3-Field Contact Card + Honeypot */}
          <div className="lg:col-span-6 p-8 md:p-10 rounded-2xl bg-ground-2 border border-line shadow-2xl">
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

                {/* Email */}
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

                {/* Message */}
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

                {/* Submit button */}
                <Magnetic strength={0.25} cursor="Enquire">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-bold tracking-widest uppercase shadow-xl transition-all duration-200"
                  >
                    <span>{CONTACT_COPY.form.submitText}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </Magnetic>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
