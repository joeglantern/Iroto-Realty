'use client';

import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { CheckCircle, XCircle, Envelope, Phone, MapPin, Clock, CircleNotch, FacebookLogo, InstagramLogo, XLogo } from '@phosphor-icons/react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          message: data.message || 'Thank you for your inquiry! We will get back to you soon.'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitMessage({
          type: 'error',
          message: data.error || 'There was an error sending your message. Please try again.'
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'There was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Contact <span className="text-brown">Us</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90">
              Connect with our coastal living experts
            </p>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="pb-20 pt-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-black mb-8">Get In Touch</h2>
                
                {/* Success/Error Message */}
                {submitMessage && (
                  <div className={`p-4 rounded-md mb-6 ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {submitMessage.type === 'success' ? (
                          <CheckCircle size={20} weight="fill" className="text-green-400" />
                        ) : (
                          <XCircle size={20} weight="fill" className="text-red-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{submitMessage.message}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-brown focus:border-brown transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-brown focus:border-brown transition-colors"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-brown focus:border-brown transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-brown focus:border-brown transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="rental-inquiry">Rental Inquiry</option>
                      <option value="purchase-inquiry">Purchase Inquiry</option>
                      <option value="investment-consultation">Investment Consultation</option>
                      <option value="general-inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-brown focus:border-brown transition-colors"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brown hover:bg-brown/90 disabled:bg-brown/50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md font-semibold transition-colors duration-200 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <CircleNotch size={20} className="animate-spin -ml-1 mr-3 text-white" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-black mb-8">Contact Information</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Envelope size={24} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Email</h3>
                      <p className="text-gray-600">eunice@irotorealty.com</p>
                      <p className="text-gray-600">info@irotorealty.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone size={24} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Phone</h3>
                      <p className="text-gray-600">07123456789</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin size={24} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Office</h3>
                      <p className="text-gray-600">
                        Nairobi, Kenya<br />
                        (By appointment only)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock size={24} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: By appointment
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="font-semibold text-black mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://facebook.com/irotorealty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-brown hover:bg-brown/90 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <FacebookLogo size={20} weight="fill" className="text-white" />
                    </a>
                    <a
                      href="https://instagram.com/irotorealty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-brown hover:bg-brown/90 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <InstagramLogo size={20} weight="fill" className="text-white" />
                    </a>
                    <a
                      href="https://twitter.com/irotorealty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-brown hover:bg-brown/90 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <XLogo size={20} weight="fill" className="text-white" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  );
}