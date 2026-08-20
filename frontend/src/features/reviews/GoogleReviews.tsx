import React from 'react'
import { ExternalLink, MessageSquarePlus, Star } from 'lucide-react'
import { useGoogleReviews } from '../../hooks/useGoogleReviews'
import { ReviewCard } from './ReviewCard'
import { Spinner } from '../../components/common/Spinner'
import { Button } from '../../components/common/Button'

export interface GoogleReviewsProps {
  limit?: number
}

const DEFAULT_MAPS_URL =
  'https://www.google.com/maps/place/FITNESS+GARAGE+GYM+GUWAHATI/@26.1519396,91.7414249,17z/data=!3m1!4b1!4m6!3m5!1s0x375a5b2a02da4f27:0x47c15d7aac48af26!8m2!3d26.1519396!4d91.7414249!16s%2Fg%2F11n0g3x3yp'

export const GoogleReviews: React.FC<GoogleReviewsProps> = ({ limit }) => {
  const { reviews, rating, totalReviews, loading } = useGoogleReviews()

  if (loading) {
    return <Spinner size="lg" className="my-12" />
  }

  const displayedReviews = limit ? reviews.slice(0, limit) : reviews
  const avgRating = rating ? rating.toFixed(1) : '4.8'
  const totalCount = totalReviews || 108

  return (
    <div>
      {/* Header Summary Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 p-6 bg-garage-dark border border-garage-mid rounded-xl">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-display font-extrabold text-garage-chrome">{avgRating}</div>
          <div>
            <div className="flex items-center gap-1 text-garage-chrome">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(Number(avgRating))
                      ? 'fill-current text-garage-chrome'
                      : i === Math.floor(Number(avgRating))
                        ? 'fill-current text-garage-chrome/80'
                        : 'text-garage-mid'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-garage-muted font-body mt-1">
              Based on {totalCount} verified Google reviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={DEFAULT_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-garage-chrome text-garage-black hover:bg-garage-chrome-dim transition-all text-xs font-bold uppercase tracking-wider"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Bottom Google Maps Redirect & Write Review Bar */}
      <div className="mt-12 p-8 bg-garage-dark/60 border border-garage-mid/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h4 className="text-xl font-display uppercase tracking-wider text-garage-white mb-1">
            Read More Feedback on Google Maps
          </h4>
          <p className="text-xs text-garage-muted font-body">
            Browse all {totalCount} verified member reviews or share your own experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href={DEFAULT_MAPS_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
              All Google Reviews
            </Button>
          </a>
          <a href={DEFAULT_MAPS_URL} target="_blank" rel="noopener noreferrer">
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<MessageSquarePlus className="w-4 h-4" />}
            >
              Write a Review
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
