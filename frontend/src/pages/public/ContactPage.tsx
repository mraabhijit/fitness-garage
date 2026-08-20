import React, { useState } from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { FormField } from '../../components/forms/FormField'
import { TextareaField } from '../../components/forms/TextareaField'
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react'

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate submission / lead capture
    setSubmitted(true)
  }

  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="Get In Touch"
        title="VISIT / THE GARAGE"
        subtitle="Book a free walkthrough, ask a question about memberships, or drop by for a tour."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info & Hours */}
        <div className="space-y-8">
          <Card className="p-8 space-y-6">
            <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white">
              Location & Details
            </h3>

            <div className="space-y-4 text-sm font-body">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-garage-white uppercase tracking-wider text-xs">
                    Address
                  </h5>
                  <p className="text-garage-muted mt-0.5">
                    123 Iron Works Way, Fitness District, Bangalore, 560001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-garage-white uppercase tracking-wider text-xs">
                    Phone
                  </h5>
                  <p className="text-garage-muted mt-0.5">+91 98765 43210 / +91 98765 43211</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-garage-white uppercase tracking-wider text-xs">
                    Email
                  </h5>
                  <p className="text-garage-muted mt-0.5">contact@fitnessgarage.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-garage-white uppercase tracking-wider text-xs">
                    Operating Hours
                  </h5>
                  <p className="text-garage-muted mt-0.5">Mon – Sat: 05:30 AM – 10:30 PM</p>
                  <p className="text-garage-muted">Sunday: 06:00 AM – 01:00 PM</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lead / Contact Form */}
        <div>
          <Card className="p-8">
            <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white mb-6">
              Send Us A Message
            </h3>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-status-active mx-auto" />
                <h4 className="text-2xl font-display uppercase text-garage-white">
                  Message Transmitted!
                </h4>
                <p className="text-sm text-garage-muted max-w-sm mx-auto font-body">
                  Thank you for reaching out. One of our head coaches will contact you within 24
                  hours.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false)
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Full Name"
                  placeholder="e.g. John Smith"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Phone Number"
                    placeholder="e.g. +91 98765 43210"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                    }}
                  />
                  <FormField
                    label="Email Address"
                    placeholder="e.g. john@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                    }}
                  />
                </div>
                <TextareaField
                  label="Message / Goals"
                  placeholder="Tell us about your fitness goals or questions..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value })
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
