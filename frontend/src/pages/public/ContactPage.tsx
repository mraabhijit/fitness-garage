import React, { useState } from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { FormField } from '../../components/forms/FormField'
import { TextareaField } from '../../components/forms/TextareaField'
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useSiteConfigStore } from '../../store/siteConfigStore'

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })

  const getConfig = useSiteConfigStore((s) => s.getConfig)
  const address = getConfig(
    'address',
    'Maa, Sarda Path, Colony Bazar, Kala Pahar, Gopinath Nagar, Guwahati, Assam 781018'
  )
  const phone = getConfig('phone', '+91 70021 57184')
  const email = getConfig('email', 'contact@fitnessgarage.com')
  const hours = getConfig('opening_hours', 'Mon–Sat: 6:00 AM – 10:30 PM, Sun: 9:00 AM – 2:00 PM')
  const mapsEmbedUrl = getConfig(
    'google_maps_embed_url',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.488349275037!2d91.738850!3d26.1519396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a5b2a02da4f27%3A0x47c15d7aac48af26!2sFITNESS%20GARAGE%20GYM%20GUWAHATI!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
  )
  const mapsPlaceUrl = getConfig(
    'google_maps_place_url',
    'https://www.google.com/maps/place/FITNESS+GARAGE+GYM+GUWAHATI/@26.1519396,91.7414249,17z/data=!3m1!4b1!4m6!3m5!1s0x375a5b2a02da4f27:0x47c15d7aac48af26!8m2!3d26.1519396!4d91.7414249!16s%2Fg%2F11n0g3x3yp'
  )

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
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white">
                Location & Details
              </h3>
              <a
                href={mapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-garage-chrome hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-4 text-sm font-body">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-garage-white uppercase tracking-wider text-xs">
                    Address
                  </h5>
                  <p className="text-garage-muted mt-0.5">{address}</p>
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
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-garage-muted hover:text-garage-chrome transition-colors mt-0.5 block"
                  >
                    {phone}
                  </a>
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
                  <a
                    href={`mailto:${email}`}
                    className="text-garage-muted hover:text-garage-chrome transition-colors mt-0.5 block"
                  >
                    {email}
                  </a>
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
                  <p className="text-garage-muted mt-0.5">{hours}</p>
                </div>
              </div>
            </div>

            {/* Embedded Google Maps */}
            <div className="pt-4 border-t border-garage-mid/40">
              <iframe
                title="Fitness Garage Guwahati Location"
                src={mapsEmbedUrl}
                className="w-full h-64 rounded-xl border border-garage-mid/60"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
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
