"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', type: 'technical', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would call the FastApi backend
    alert("Message sent successfully!");
    setFormData({ name: '', email: '', type: 'technical', message: '' });
  };

  return (
    <div className="w-full pt-16 bg-surface flex flex-col min-h-screen">
      {/* Hero Header */}
      <section className="relative w-full overflow-hidden pt-space-2xl pb-space-2xl px-4">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="max-w-[80rem] mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-xxs rounded-full bg-surface-container-low text-secondary font-label-md text-label-md shadow-sm mb-space-md">
            <span className="material-symbols-outlined text-[16px]">headset_mic</span>
            <span>We&apos;re Here to Help</span>
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight max-w-4xl font-semibold">
            Dedicated Support for Your IELTS Journey.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-md leading-relaxed">
            Our academic advisors and technical support team aim to respond to all inquiries within 6 hours. Let us know how we can assist you.
          </p>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <section className="max-w-[80rem] mx-auto px-4 w-full pb-space-3xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          
          {/* Left Column: Contact Methods */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {/* Technical Support */}
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex items-start gap-space-md hover:border-secondary/30 transition-colors">
               <div className="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center shrink-0">
                 <span className="material-symbols-outlined text-[24px]">bug_report</span>
               </div>
               <div>
                 <h3 className="font-headline-sm text-headline-sm text-on-surface">Technical Support</h3>
                 <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-2">For bugs, account access, or payment issues.</p>
                 <a href="mailto:support@ielts.ai" className="font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors font-semibold">support@ielts.ai</a>
               </div>
            </div>

            {/* Academic Advising */}
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex items-start gap-space-md hover:border-secondary/30 transition-colors">
               <div className="w-12 h-12 rounded-xl bg-surface-container text-tertiary-container flex items-center justify-center shrink-0">
                 <span className="material-symbols-outlined text-[24px]">school</span>
               </div>
               <div>
                 <h3 className="font-headline-sm text-headline-sm text-on-surface">Academic Advising</h3>
                 <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-2">Questions about AI grading rubrics or module selection.</p>
                 <a href="mailto:academic@ielts.ai" className="font-label-md text-label-md text-tertiary-container hover:opacity-80 transition-opacity font-semibold">academic@ielts.ai</a>
               </div>
            </div>

            {/* Institutional Partnerships */}
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex items-start gap-space-md hover:border-secondary/30 transition-colors">
               <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                 <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
               </div>
               <div>
                 <h3 className="font-headline-sm text-headline-sm text-on-surface">Institutional Partnerships</h3>
                 <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-2">For universities, schools, and B2B bulk licensing.</p>
                 <a href="mailto:partners@ielts.ai" className="font-label-md text-label-md text-primary hover:opacity-80 transition-opacity font-semibold">partners@ielts.ai</a>
               </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl rounded-3xl shadow-lg border border-outline-variant/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed-dim/20 rounded-bl-full pointer-events-none -z-10"></div>
             
             <h2 className="font-headline-md text-headline-md text-on-surface mb-space-lg">Send us a Message</h2>
             
             <form onSubmit={handleSubmit} className="flex flex-col gap-space-md relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                   <div className="flex flex-col gap-1">
                     <label htmlFor="name" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Full Name</label>
                     <input 
                       id="name"
                       type="text" 
                       required
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                       placeholder="Jane Doe"
                     />
                   </div>
                   <div className="flex flex-col gap-1">
                     <label htmlFor="email" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Email Address</label>
                     <input 
                       id="email"
                       type="email" 
                       required
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                       placeholder="jane@example.com"
                     />
                   </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="type" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Inquiry Type</label>
                  <select 
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all appearance-none"
                  >
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing &amp; Subscriptions</option>
                    <option value="academic">Academic &amp; Grading</option>
                    <option value="partnership">Institutional Partnership</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="message" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Message</label>
                  <textarea 
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-y"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <button type="submit" className="mt-space-sm w-full md:w-auto self-end px-space-xl py-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-space-xs group">
                  <span>Send Message</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">send</span>
                </button>
             </form>
          </div>
        </div>
      </section>

      {/* Global Office Banner */}
      <section className="w-full bg-primary text-on-primary py-space-xl mt-auto relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
         <div className="max-w-[80rem] mx-auto px-4 text-center relative z-10 flex flex-col items-center">
            <span className="material-symbols-outlined text-[32px] text-tertiary-fixed mb-space-sm">public</span>
            <h3 className="font-headline-md text-headline-md font-semibold mb-2">Headquartered in London, UK</h3>
            <p className="font-body-md text-body-md text-on-primary-container max-w-lg">
              Serving highly-driven candidates and academic institutions globally. Operating 24/7 with zero downtime since inception.
            </p>
         </div>
      </section>
    </div>
  );
}
