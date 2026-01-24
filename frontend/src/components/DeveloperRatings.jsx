import React, { useState, useEffect } from 'react';
import './DeveloperRatings.css';

const DeveloperRatings = ({ developerEmail }) => {
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (developerEmail) {
      fetchRatingSummary();
    }
  }, [developerEmail]);

  const fetchRatingSummary = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/feedback/rating-summary/${developerEmail}/`
      );
      const data = await response.json();
      setRatingSummary(data);
    } catch (error) {
      console.error('Error fetching rating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="ratings-loading">Loading ratings...</div>;
  }

  if (!ratingSummary || ratingSummary.total_reviews === 0) {
    return (
      <div className="no-ratings">
        <p>No ratings yet</p>
      </div>
    );
  }

  const { average_rating, total_reviews, rating_distribution } = ratingSummary;

  const StarDisplay = ({ rating }) => (
    <div className="star-display-large">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'filled' : ''}>
          ★
        </span>
      ))}
    </div>
  );

  const RatingBar = ({ stars, count }) => {
    const percentage = total_reviews > 0 ? (count / total_reviews) * 100 : 0;
    return (
      <div className="rating-bar-container">
        <span className="rating-label">{stars} ★</span>
        <div className="rating-bar">
          <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="rating-count">{count}</span>
      </div>
    );
  };

  return (
    <div className="developer-ratings">
      <h3>Ratings & Reviews</h3>
      
      <div className="rating-overview">
        <div className="average-rating">
          <div className="rating-number">{average_rating.toFixed(1)}</div>
          <StarDisplay rating={average_rating} />
          <div className="review-count">{total_reviews} review{total_reviews !== 1 ? 's' : ''}</div>
        </div>

        <div className="rating-distribution">
          <RatingBar stars={5} count={rating_distribution['5']} />
          <RatingBar stars={4} count={rating_distribution['4']} />
          <RatingBar stars={3} count={rating_distribution['3']} />
          <RatingBar stars={2} count={rating_distribution['2']} />
          <RatingBar stars={1} count={rating_distribution['1']} />
        </div>
      </div>
    </div>
  );
};

export default DeveloperRatings;
