import React, { useEffect, useState } from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Card } from '../../components/common/Card'
import { Spinner } from '../../components/common/Spinner'
import { publicService } from '../../services/publicService'
import type { Review } from '../../types'
import { formatDate } from '../../utils/formatters'
import { MessageSquare, Star } from 'lucide-react'

export const TestimonialsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    publicService
      .getReviews()
      .then(setReviews)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const reviewsSchema =
    reviews.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'GymOrSportsClub',
          name: 'Fitness Garage',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(
              1,
            ),
            reviewCount: reviews.length.toString(),
            bestRating: '5',
            worstRating: '1',
          },
          review: reviews.map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.reviewer_name },
            reviewBody: r.review_text,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating.toString(),
              bestRating: '5',
            },
            datePublished: r.review_date,
          })),
        }
      : null

  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      {reviewsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
        />
      )}
      <SectionHeading
        badge="COMMUNITY"
        title="ATHLETE / VOICES"
        subtitle="Authentic feedback and verified Google Reviews from our training community."
        align="center"
      />

      {isLoading ? (
        <Spinner size="lg" className="my-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {reviews.map((r) => (
            <Card key={r.id} hoverEffect className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4 text-garage-chrome">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-garage-white text-sm leading-relaxed mb-6 font-body italic">
                  "{r.review_text}"
                </p>
              </div>

              <div className="pt-4 border-t border-garage-mid/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-garage-white text-sm uppercase tracking-wide">
                    {r.reviewer_name}
                  </h4>
                  <span className="text-xs text-garage-muted font-body">
                    {formatDate(r.review_date)}
                  </span>
                </div>
                <span className="text-[10px] text-garage-chrome uppercase tracking-widest px-2 py-0.5 rounded bg-garage-chrome/10 border border-garage-chrome/20">
                  Google Review
                </span>
              </div>
            </Card>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-full text-center py-12 text-garage-muted">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-garage-chrome" />
              <p>No verified reviews currently displayed. Check back soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
