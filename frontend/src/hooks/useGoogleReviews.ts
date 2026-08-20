import { useEffect, useState } from 'react'
import type { Review } from '../types'
import { publicService } from '../services/publicService'

const CACHE_KEY = 'fg_reviews_cache'

interface GooglePlacesReview {
  author_name: string
  text?: string
  rating: number
  time: number
  relative_time_description?: string
}

/**
 * Fetches Google Reviews directly in browser with sessionStorage caching and static fallback.
 */
export function useGoogleReviews(placeId?: string, apiKey?: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [fromCache, setFromCache] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchReviews() {
      // 1. Check sessionStorage cache
      try {
        const cached = sessionStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (isMounted) {
              setReviews(parsed)
              setFromCache(true)
              setLoading(false)
            }
            return
          }
        }
      } catch {
        // Ignore cache read errors
      }

      // 2. Fetch from Google Places API if credentials exist
      const effectivePlaceId = placeId || import.meta.env.VITE_GOOGLE_PLACE_ID
      const effectiveApiKey = apiKey || import.meta.env.VITE_GOOGLE_PLACES_API_KEY

      if (effectivePlaceId && effectiveApiKey) {
        try {
          const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
            effectivePlaceId
          )}&fields=reviews&key=${encodeURIComponent(effectiveApiKey)}`
          const res = await fetch(url)
          const data = await res.json()

          if (data?.result?.reviews && Array.isArray(data.result.reviews)) {
            const mapped: Review[] = data.result.reviews.map(
              (r: GooglePlacesReview, idx: number) => ({
                id: `google-${idx}`,
                google_review_id: `google-${idx}`,
                reviewer_name: r.author_name,
                review_text: r.text || null,
                rating: r.rating,
                review_date: new Date(r.time * 1000).toISOString().split('T')[0],
                is_visible: true,
              })
            )

            if (isMounted) {
              setReviews(mapped)
              setFromCache(false)
              try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(mapped))
              } catch {
                // Ignore cache write errors
              }
              setLoading(false)
            }
            return
          }
        } catch (err) {
          console.warn('Google Places API fetch failed, falling back to static reviews:', err)
        }
      }

      // 3. Fallback to static reviews
      try {
        const fallback = await publicService.getFallbackReviews()
        if (isMounted) {
          setReviews(fallback)
          setFromCache(false)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load reviews')
          setLoading(false)
        }
      }
    }

    fetchReviews()

    return () => {
      isMounted = false
    }
  }, [placeId, apiKey])

  return { reviews, loading, fromCache, error }
}
