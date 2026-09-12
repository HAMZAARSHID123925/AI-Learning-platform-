'use client';

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'technical',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', type: 'technical', message: '' });
  };

  return (
    <div className="flex flex-col min-h-screen pt-20 bg-surface">
      
            {/* 1. PREMIUM DARK HERO SECTION */}
<section className="relative w-full pt-16 md:pt-24 pb-40 overflow-hidden bg-gradient-to-b from-[#001F3F] via-[#003366] to-[#027FFF] text-white">
  {/* Abstract Background Elements */}
  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent bg-[length:30px_30px] opacity-20"></div>

  <div className="max-w-[80rem] mx-auto flex flex-col items-center text-center px-4 relative z-10 animate-fade-in-up">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-400 font-label-sm text-[13px] font-bold shadow-sm mb-8">
      <span className="material-symbols-outlined text-[16px]">support_agent</span>
      <span className="tracking-widest uppercase">24/7 Priority Support</span>
    </div>
    
    <h1 className="font-display-lg text-[40px] md:text-[64px] leading-[1.1] font-bold tracking-tight text-white max-w-4xl mb-6">
      How can we help you today?
    </h1>
    
    <p className="font-body-lg text-[18px] md:text-[20px] leading-relaxed text-white/80 max-w-2xl">
      Whether you need technical assistance, academic advising, or want to discuss a partnership, our dedicated team is here to assist you instantly.
    </p>
  </div>
</section>
{/* 2. MAIN CONTACT LAYOUT */}
      <section className="max-w-[80rem] mx-auto px-4 w-full pb-20 relative z-20 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {/* Phone Support */}
            <div className="group bg-surface-container-lowest p-space-xl rounded-3xl shadow-sm border border-outline-variant/30 hover:border-secondary hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-100">
               <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-space-md group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                 <span className="material-symbols-outlined text-[32px]">call</span>
               </div>
               <h3 className="font-headline-sm text-[24px] font-bold text-on-surface mb-2">Phone Support</h3>
               <p className="font-body-md text-on-surface-variant mb-space-md">For immediate technical support, account access, or billing inquiries.</p>
               <a href="tel:+966539192263" className="inline-flex items-center gap-2 font-label-md text-[18px] text-secondary hover:text-secondary-container transition-colors font-bold">
                 +966 539 192 263
                 <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </a>
            </div>

            {/* Email Support */}
            <div className="group bg-surface-container-lowest p-space-xl rounded-3xl shadow-sm border border-outline-variant/30 hover:border-secondary hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-200">
               <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-space-md group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                 <span className="material-symbols-outlined text-[32px]">mail</span>
               </div>
               <h3 className="font-headline-sm text-[24px] font-bold text-on-surface mb-2">Email Support</h3>
               <p className="font-body-md text-on-surface-variant mb-space-md">Questions about AI grading rubrics, curriculum, or general inquiries.</p>
               <a href="mailto:saqibregi43@gmail.com" className="inline-flex items-center gap-2 font-label-md text-[18px] text-secondary hover:text-secondary-container transition-colors font-bold">
                 saqibregi43@gmail.com
                 <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </a>
            </div>

            {/* WhatsApp */}
            <div className="group bg-surface-container-lowest p-space-xl rounded-3xl shadow-sm border border-outline-variant/30 hover:border-secondary hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-300">
               <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-space-md group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                 <span className="material-symbols-outlined text-[32px]">chat</span>
               </div>
               <h3 className="font-headline-sm text-[24px] font-bold text-on-surface mb-2">WhatsApp Chat</h3>
               <p className="font-body-md text-on-surface-variant mb-space-md">Connect directly for institutional partnerships or quick chat support.</p>
               <a href="https://wa.me/966539192263" className="inline-flex items-center gap-2 font-label-md text-[18px] text-secondary hover:text-secondary-container transition-colors font-bold">
                 +966 539 192 263
                 <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </a>
            </div>
          </div>

          {/* Right Column: Premium Form */}
          <div className="lg:col-span-7 animate-fade-in-up delay-200">
            <div className="bg-surface-container-lowest p-space-2xl rounded-3xl shadow-2xl border border-outline-variant/20 relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-bl-full pointer-events-none"></div>
               
               <h2 className="font-headline-md text-[32px] font-bold text-on-surface mb-space-xl">Send us a direct message</h2>
               
               <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                     <div className="flex flex-col gap-2">
                       <label htmlFor="name" className="font-label-sm text-[14px] text-on-surface-variant font-bold uppercase tracking-wider">Full Name</label>
                       <input 
                         id="name"
                         type="text" 
                         required
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-surface border-2 border-outline-variant/30 rounded-xl px-5 py-4 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:bg-white transition-all"
                         placeholder="Jane Doe"
                       />
                     </div>
                     <div className="flex flex-col gap-2">
                       <label htmlFor="email" className="font-label-sm text-[14px] text-on-surface-variant font-bold uppercase tracking-wider">Email Address</label>
                       <input 
                         id="email"
                         type="email" 
                         required
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full bg-surface border-2 border-outline-variant/30 rounded-xl px-5 py-4 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:bg-white transition-all"
                         placeholder="jane@example.com"
                       />
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="type" className="font-label-sm text-[14px] text-on-surface-variant font-bold uppercase tracking-wider">Inquiry Type</label>
                    <div className="relative">
                      <select 
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-surface border-2 border-outline-variant/30 rounded-xl px-5 py-4 pr-12 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Subscriptions</option>
                        <option value="academic">Academic & Grading</option>
                        <option value="partnership">Institutional Partnership</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="font-label-sm text-[14px] text-on-surface-variant font-bold uppercase tracking-wider">Your Message</label>
                    <textarea 
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-surface border-2 border-outline-variant/30 rounded-xl px-5 py-4 text-on-surface font-body-md focus:outline-none focus:border-secondary focus:bg-white transition-all resize-y"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>

                  <button type="submit" className="mt-space-md w-full px-space-2xl py-5 rounded-xl bg-secondary text-white font-label-md text-[18px] font-bold hover:bg-secondary-container transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-space-sm group">
                    <span>Send Message securely</span>
                    <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                  </button>
               </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
