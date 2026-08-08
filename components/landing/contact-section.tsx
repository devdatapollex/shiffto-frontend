'use client';

import { useState, FormEvent } from 'react';
import { Phone, Mail, MapPin, ChevronRight, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ContactSection() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    service: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset notification after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullname: '',
        email: '',
        service: '',
        subject: '',
        message: '',
      });
    }, 4000);
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-12 md:py-16 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Info & Social Links (4 or 5 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Reach Us Directly Card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[#F05336] uppercase tracking-wider">
                Contact Info
              </span>
              <h3 className="text-xl font-bold text-foreground">Reach us directly</h3>
            </div>

            <div className="flex flex-col gap-5">
              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF2EE] text-[#F05336]">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="text-xs text-gray-500 font-medium">Phone</span>
                  <span className="font-semibold text-foreground">+1 (800) 123-4567</span>
                  <span className="text-xs text-gray-500">Mon-Fri, 9am-6pm EST</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF2EE] text-[#F05336]">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="text-xs text-gray-500 font-medium">Email</span>
                  <span className="font-semibold text-foreground">support@shiffto.com</span>
                  <span className="text-xs text-gray-500">We reply within 24 hours</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF2EE] text-[#F05336]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="text-xs text-gray-500 font-medium">Address</span>
                  <span className="font-semibold text-foreground">712 Fifth Ave, Suite 40</span>
                  <span className="text-xs text-gray-500">New York, NY 10019, US</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Connected Card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[#F05336] uppercase tracking-wider">
                Follow Us
              </span>
              <h3 className="text-xl font-bold text-foreground">Stay connected</h3>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href="#"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-foreground group"
              >
                <div className="flex items-center gap-3">
                  <Twitter className="w-4 h-4 text-gray-600 group-hover:text-[#F05336] transition-colors" />
                  <span>X (Twitter)</span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-foreground flex items-center">
                  @shiffto <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </a>

              <a
                href="#"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-foreground group"
              >
                <div className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4 text-gray-600 group-hover:text-[#F05336] transition-colors" />
                  <span>LinkedIn</span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-foreground flex items-center">
                  Shiffto <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </a>

              <a
                href="#"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-foreground group"
              >
                <div className="flex items-center gap-3">
                  <Instagram className="w-4 h-4 text-gray-600 group-hover:text-[#F05336] transition-colors" />
                  <span>Instagram</span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-foreground flex items-center">
                  @shiffto_app <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Send us a Message Form (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#F05336] uppercase tracking-wider">
              Contact Form
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Send us a message</h3>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center flex flex-col items-center gap-2">
              <h4 className="font-bold text-lg">Thank You!</h4>
              <p className="text-sm text-emerald-700">
                Your message has been sent successfully. Our support team will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Fullname */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Fullname</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. James Doctor"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F05336]/30 focus:border-[#F05336]"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. james@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F05336]/30 focus:border-[#F05336]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Service */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Service</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F05336]/30 focus:border-[#F05336]"
                  >
                    <option value="">Select service</option>
                    <option value="sender">Package Delivery (Sender)</option>
                    <option value="traveler">Travel & Earn (Traveler)</option>
                    <option value="support">General Support</option>
                    <option value="business">Partnership / Business</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delivery Inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F05336]/30 focus:border-[#F05336]"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F05336]/30 focus:border-[#F05336] resize-none"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold px-6 py-2.5 h-auto rounded-xl gap-2 text-sm cursor-pointer"
                >
                  Send message <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
