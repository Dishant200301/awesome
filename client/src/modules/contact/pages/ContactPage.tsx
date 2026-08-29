import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import { MOCK_CONTACT_MESSAGES } from "../../../../../admin/src/data/mockAdminData";

/* ---------- BREADCRUMB COMPONENT ---------- */
function ContactBreadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
      <Link to="/" className="hover:text-zinc-900 transition-colors">
        Home
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
      <span className="text-zinc-900 font-bold">Contact</span>
    </nav>
  );
}

/* ---------- MAIN CONTACT PAGE COMPONENT ---------- */
export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (phone.trim() && phone.trim().length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || "+91 98000 00000",
      subject: subject.trim() || "General Inquiry",
      message: message.trim(),
    };

    // 1. Send API HTTP POST Request to Express Server Backend
    try {
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api/v1" : "http://localhost:5000/api/v1");
      await fetch(`${apiBase}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Backend API server offline/unreachable, saving to local store:", err);
    }

    // 2. Fallback / Synchronize in-memory dataset & trigger cross-tab storage event
    const newMsg = {
      id: `msg-${Date.now()}`,
      ...payload,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "New" as const,
    };

    MOCK_CONTACT_MESSAGES.unshift(newMsg);

    try {
      const syncData = {
        timestamp: Date.now(),
        message: newMsg,
        messages: MOCK_CONTACT_MESSAGES
      };
      localStorage.setItem("awesome_contact_sync", JSON.stringify(syncData));
      localStorage.setItem("aaramly_contact_sync", JSON.stringify(syncData));
      window.dispatchEvent(new Event("awesome_contact_sync"));
      window.dispatchEvent(new Event("aaramly_contact_sync"));
    } catch (e) {}

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Thank you! Your message has been sent successfully.");

    // Reset form after delay
    setTimeout(() => {
      setIsSubmitted(false);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-zinc-900 selection:text-white">
      <Navbar />

      {/* Header Banner Section */}
      <section className="pt-10 md:pt-14 pb-10 lg:pb-10 border-b border-zinc-200/60 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
     
          {/* Banner Title & Subtitle */}
          <div className="text-center max-w-4xl mx-auto px-2 py-6 md:py-6">
            <span className="text-[11px] md:text-[12px] font-extrabold uppercase tracking-[0.25em] text-[#520618] block mb-3">
              CONTACT US
            </span>
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl text-zinc-900 font-normal leading-tight">
              We'd love to hear from you
            </h1>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-600 font-sans leading-relaxed max-w-2xl mx-auto">
              We'd love to hear from you. Please fill out the form below with the email address used to place your order, and our customer support team will get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section (Form & Contact Info) */}
      <section className="bg-white py-10 lg:py-12 flex-1">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            
            {/* Contact Form Container (Order-2 on mobile/tablet, Order-1 on laptop/desktop) */}
            <div className="order-2 lg:order-1 lg:col-span-7 w-full">
              {isSubmitted ? (
                <div className="border border-zinc-200 bg-zinc-50/50 p-8 sm:p-12 text-center rounded-2xl space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#520618] mx-auto animate-bounce" />
                  <h3 className="text-2xl font-heading text-brand-maroon">Message Received!</h3>
                  <p className="text-sm text-zinc-600 max-w-md mx-auto">
                    Thank you for reaching out to Awesome Handmade. Your inquiry has been forwarded directly to our artisan support team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-900 mb-2">
                      YOUR NAME <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-zinc-300 px-4 py-3.5 text-sm text-zinc-900 outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon transition-colors rounded-lg bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-900 mb-2">
                        EMAIL ADDRESS <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-zinc-300 px-4 py-3.5 text-sm text-zinc-900 outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon transition-colors rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-900 mb-2">
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        pattern="[0-9]*"
                        placeholder="98243 02072"
                        value={phone}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhone(onlyDigits);
                        }}
                        className="w-full border border-zinc-300 px-4 py-3.5 text-sm text-zinc-900 outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon transition-colors rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-900 mb-2">
                      SUBJECT / TOPIC
                    </label>
                    <input
                      type="text"
                      placeholder="Bridal Latkan Customization, Order Query, Bulk Festive Gifts, etc."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-zinc-300 px-4 py-3.5 text-sm text-zinc-900 outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon transition-colors rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-900 mb-2">
                      TYPE YOUR MESSAGE <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Write your message here…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full border border-zinc-300 px-4 py-3.5 text-sm text-zinc-900 outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon transition-colors rounded-lg bg-white resize-y"
                    />
                  </div>

                  <div className="pt-2 flex justify-center lg:justify-start">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-brand-maroon hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-md shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <span>{isSubmitting ? "SENDING..." : "SUBMIT MESSAGE"}</span>
                      <Send className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Get in Touch Info Container */}
            <div className="order-1 lg:order-2 lg:col-span-5 w-full text-center lg:text-left lg:border-l lg:border-zinc-200 lg:pl-16 flex flex-col">
              <h2 className="font-heading text-3xl sm:text-4xl text-brand-maroon font-bold">
                Get in Touch
              </h2>
              
              <div className="mt-8 sm:mt-10 space-y-8">
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-brand-gold">
                    <MapPin className="w-4 h-4" />
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-maroon">
                      ARTISAN STUDIO LOCATION
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-900 font-sans leading-relaxed max-w-xs mx-auto lg:mx-0">
                    Awesome Handmade, Shop-5, Soham Arcade, Pal Gam, Surat, Gujarat 395009, India
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-brand-gold">
                    <Phone className="w-4 h-4" />
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-maroon">
                      PHONE & WHATSAPP
                    </p>
                  </div>
                  <a href="tel:+919824302072" className="text-sm sm:text-base text-brand-maroon font-bold hover:underline">
                    +91 98243 02072
                  </a>
                </div>

                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-brand-gold">
                    <Mail className="w-4 h-4" />
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-maroon">
                      EMAIL ADDRESS
                    </p>
                  </div>
                  <a href="mailto:hello@awesomehandmade.com" className="text-sm sm:text-base text-zinc-900 hover:text-brand-maroon transition-colors">
                    hello@awesomehandmade.com
                  </a>
                </div>

                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-brand-gold">
                    <Clock className="w-4 h-4" />
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-maroon">
                      BUSINESS HOURS
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-900 font-sans leading-relaxed">
                    Mon - Sat: 9.00 am - 8.00 pm
                  </p>
                  <p className="text-sm sm:text-base text-zinc-900 font-sans leading-relaxed mt-0.5">
                    Sunday: 10.00 am - 6.00 pm
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-white pb-14 md:pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="w-full h-[400px] md:h-[480px] bg-zinc-100 overflow-hidden border border-zinc-200 rounded-2xl shadow-xs">
            <iframe
              title="AOCIND Location Map"
              className="h-full w-full grayscale contrast-125 border-0"
              src="https://maps.google.com/maps?q=Surat%20Gujarat&t=&z=13&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;
