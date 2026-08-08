'use client';

import { useState, FormEvent } from 'react';
import { Phone, Mail, MapPin, ChevronRight, ArrowRight, Instagram } from 'lucide-react';
import Facebook from '@/public/facebook.svg'
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

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
    <section className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-12 md:pt-6 md:pb-16 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-stretch">
        {/* Left Column: Direct Info & Social Links (4 or 5 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Reach Us Directly Card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-accent-foreground">
                Contact Info
              </span>
              <h3 className="text-lg leading-[28px] font-medium text-foreground">Reach us directly</h3>
            </div>

            <div className="flex flex-col gap-5">
              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary border border-[#FDE8D3]">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <span className="font-medium text-foreground">+1 (800) 123-4567</span>
                  <span className="text-xs text-gray-500">Mon-Fri, 9am-6pm EST</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary border border-[#FDE8D3]">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">hello@shiffto.com</span>
                  <span className="text-xs text-gray-500">We reply within 24 hours</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary border border-[#FDE8D3]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="text-xs text-muted-foreground">Address</span>
                  <span className="font-medium text-foreground">12 Globe Street, Suite 4B</span>
                  <span className="text-xs text-gray-500">London, EC2A 4NE, UK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Connected Card */}
          <div className="p-6 sm:p-7 bg-white rounded-3xl border border-gray-100/80 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-normal text-[#F48FA0]">
                Follow Us
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Stay connected</h3>
            </div>

            <div className="flex flex-col gap-3">
              {/* X (Twitter) */}
              <a
                href="#"
                className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3  rounded-xl bg-[#F9FAFB] hover:bg-gray-100/80 border border-[#F3F4F6] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white shadow-xs border border-gray-100/80 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs leading-[16px] font-medium text-[#374151]">X (Twitter)</span>
                    <span className="leading-[16px]text-sm text-gray-400 font-normal">@shiffto</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#D1D5DB] group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* Facebook */}
              <a
                href="#"
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#F9FAFB] hover:bg-gray-100/80 border border-[#F3F4F6] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white shadow-xs border border-gray-100/80 flex items-center justify-center">
                    <Image src={Facebook} alt="Facebook" className="w-4 h-4 fill-primary object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs leading-[16px] font-medium text-[#374151]">Facebook</span>
                    <span className="leading-[16px]text-sm text-gray-400 font-normal">Shiffto</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#D1D5DB] group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* Instagram */}
              <a
                href="#"
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#F9FAFB] hover:bg-gray-100/80 border border-[#F3F4F6] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white shadow-xs border border-gray-100/80 flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs leading-[16px] font-medium text-[#374151]">Instagram</span>
                    <span className="leading-[16px]text-sm text-gray-400 font-normal">@shiffto.app</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#D1D5DB] group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Send us a Message Form (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-12 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 h-full">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-accent-foreground">
              Contact Form
            </span>
            <h3 className="text-xl sm:text-[28px] text-foreground leading-[36px] tracking-[-2px] font-medium">Send us a message</h3>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center flex flex-col items-center gap-2">
              <h4 className="font-bold text-lg">Thank You!</h4>
              <p className="text-sm text-emerald-700">
                Your message has been sent successfully. Our support team will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Fullname */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#374151]">Full Name</label>
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
                  <label className="text-sm text-[#374151]">Email Address</label>
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
                  <label className="text-sm text-[#374151]">Service</label>
                  <Select
                    value={formData.service}
                    onValueChange={(val) => setFormData({ ...formData, service: val })}
                  >
                    <SelectTrigger className="w-full h-[42px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#374151] focus:ring-2 focus:ring-[#F05336]/30 focus:border-[#F05336] shadow-none">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="sender">Package Delivery (Sender)</SelectItem>
                      <SelectItem value="traveler">Travel & Earn (Traveler)</SelectItem>
                      <SelectItem value="support">General Support</SelectItem>
                      <SelectItem value="business">Partnership / Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#374151]">Subject</label>
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
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-sm text-[#374151]">Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F05336]/30 focus:border-[#F05336] resize-none"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="bg-foreground hover:bg-[#0F172A] text-white font-normal px-6 py-2.5 h-auto rounded-xl gap-2 text-sm cursor-pointer"
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
