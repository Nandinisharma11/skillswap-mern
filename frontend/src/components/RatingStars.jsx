import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, onRatingChange = null, interactive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getStarColor = (starValue) => {
    const activeValue = hoverRating || rating;
    if (starValue <= activeValue) {
      return '#f59e0b'; // Gold
    }
    return '#64748b'; // Gray/Muted
  };

  const getStarFill = (starValue) => {
    const activeValue = hoverRating || rating;
    if (starValue <= activeValue) {
      return '#f59e0b';
    }
    return 'none';
  };

  return (
    <div className="rating-widget" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        if (interactive && onRatingChange) {
          return (
            <button
              key={starValue}
              type="button"
              className="rating-star-btn"
              onClick={() => onRatingChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: getStarColor(starValue),
                transition: 'transform 0.1s ease'
              }}
            >
              <Star size={20} fill={getStarFill(starValue)} color={getStarColor(starValue)} />
            </button>
          );
        }

        // Read-only star
        return (
          <span key={starValue} style={{ color: getStarColor(starValue), display: 'inline-flex' }}>
            <Star size={16} fill={getStarFill(starValue)} color={getStarColor(starValue)} />
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars;
