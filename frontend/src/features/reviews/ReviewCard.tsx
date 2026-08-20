import React from 'react'
import { Star } from 'lucide-react'
import type { Review } from '../../types'
import { Card } from '../../components/common/Card'

export interface ReviewCardProps {
  review: Review
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card hoverEffect className="p-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1 mb-4 text-garage-chrome">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? 'fill-current text-garage-chrome' : 'text-garage-mid'
              }`}
            />
          ))}
        </div>
        <p className="text-garage-muted font-body text-sm leading-relaxed mb-6 line-clamp-4">
          "{review.review_text}"
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-garage-mid/40 text-xs">
        <span className="font-bold text-garage-white uppercase tracking-wider">
          {review.reviewer_name}
        </span>
        <span className="text-garage-muted">{review.review_date}</span>
      </div>
    </Card>
  )
}
