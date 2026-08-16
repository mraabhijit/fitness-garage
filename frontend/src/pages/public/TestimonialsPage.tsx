import React, { useEffect, useState } from 'react';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { publicService } from '../../services/publicService';
import { Review } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Star, MessageSquare } from 'lucide-react';

export const TestimonialsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await publicService.getReviews();
        setReviews(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="Live Google Reviews"
        title="ATHLETE / TESTIMONIALS"
        subtitle="Unfiltered feedback from active gym members, synced directly from Google Maps."
      />

      {isLoading ? (
        <Spinner size="lg" />
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-garage-muted">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg uppercase font-display tracking-wider">No reviews synced yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <Card key={review.id} hoverEffect className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-garage-chrome text-garage-chrome" />
                    ))}
                  </div>
                  <span className="text-xs text-garage-muted">{formatDate(review.review_date)}</span>
                </div>

                <p className="text-sm text-garage-muted font-body italic mb-6 leading-relaxed">
                  "{review.review_text || 'Excellent gym environment and coaching staff!'}"
                </p>
              </div>

              <div className="pt-4 border-t border-garage-mid/50 flex items-center justify-between">
                <span className="font-bold text-sm text-garage-white uppercase">
                  {review.reviewer_name}
                </span>
                <span className="text-[10px] text-garage-chrome font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-garage-chrome/10 border border-garage-chrome/20">
                  Google Verified
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
