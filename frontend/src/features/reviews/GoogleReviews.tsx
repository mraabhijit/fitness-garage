import React from 'react'
import { Star } from 'lucide-react'
import { useGoogleReviews } from '../../hooks/useGoogleReviews'
import { ReviewCard } from './ReviewCard'
import { Spinner } from '../../components/common/Spinner'

export interface GoogleReviewsProps {
  limit?: number
}

export const GoogleReviews: React.FC<GoogleReviewsProps> = ({ limit }) => {
  const { reviews, loading, fromCache } = useGoogleReviews()

  if (loading) {
    return <Spinner size="lg" className="my-12" />
  }

  const displayedReviews = limit ? reviews.slice(0, limit) : reviews
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0'

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 p-6 bg-garage-dark border border-garage-mid rounded-xl">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-display font-extrabold text-garage-chrome">
            {avgRating}
          </div>
          <div>
            <div className="flex items-center gap-1 text-garage-chrome">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-garage-muted font-body mt-1">
              Based on {reviews.length}+ verified member reviews
            </p>
          </div>
        </div>

        {!fromCache && (
          <div className="text-xs text-garage-muted font-body">
            Powered by <span className="font-semibold text-garage-white">Google Reviews</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
