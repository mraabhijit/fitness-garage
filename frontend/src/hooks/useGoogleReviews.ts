import { useCallback, useEffect, useState } from 'react'
import type { Review } from '../types'
import { publicService } from '../services/publicService'

/**
 * Loads verified Google Reviews from the static data service (updated via scripts/sync_reviews.py).
 */
export function useGoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<number>(4.8)
  const [totalReviews, setTotalReviews] = useState<number>(108)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, summary] = await Promise.all([
        publicService.getFallbackReviews(),
        publicService.getReviewsSummary(),
      ])
      setReviews(data)
      setRating(summary.rating)
      setTotalReviews(summary.total_reviews)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, rating, totalReviews, loading, error, refetch: fetchReviews }
}


