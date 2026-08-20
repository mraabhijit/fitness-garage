import React from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { GoogleReviews } from '../../features/reviews/GoogleReviews'

export const TestimonialsPage: React.FC = () => {
  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="COMMUNITY"
        title="ATHLETE / VOICES"
        subtitle="Authentic feedback and verified Google Reviews from our training community."
        align="center"
      />

      <div className="mt-12">
        <GoogleReviews />
      </div>
    </div>
  )
}
