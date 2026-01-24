import React, { useState } from 'react';
import './SubmissionFeedbackForm.css';

const SubmissionFeedbackForm = ({ submission, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    feedback_text: '',
    communication_rating: 5,
    quality_rating: 5,
    timeliness_rating: 5,
    professionalism_rating: 5
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="rating-field">
      <label>{label}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= value ? 'filled' : ''}`}
            onClick={() => onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="feedback-form-overlay">
      <div className="feedback-form-container">
        <h2>Submit Feedback for {submission.developer_name}</h2>
        <p className="project-title">Project: {submission.project_title}</p>

        <form onSubmit={handleSubmit}>
          <StarRating
            label="Overall Rating"
            value={formData.rating}
            onChange={(val) => setFormData({ ...formData, rating: val })}
          />

          <div className="detailed-ratings">
            <h3>Detailed Ratings</h3>
            
            <StarRating
              label="Communication"
              value={formData.communication_rating}
              onChange={(val) => setFormData({ ...formData, communication_rating: val })}
            />

            <StarRating
              label="Quality of Work"
              value={formData.quality_rating}
              onChange={(val) => setFormData({ ...formData, quality_rating: val })}
            />

            <StarRating
              label="Timeliness"
              value={formData.timeliness_rating}
              onChange={(val) => setFormData({ ...formData, timeliness_rating: val })}
            />

            <StarRating
              label="Professionalism"
              value={formData.professionalism_rating}
              onChange={(val) => setFormData({ ...formData, professionalism_rating: val })}
            />
          </div>

          <div className="form-group">
            <label>Feedback Message</label>
            <textarea
              value={formData.feedback_text}
              onChange={(e) => setFormData({ ...formData, feedback_text: e.target.value })}
              placeholder="Share your experience working with this developer..."
              rows="6"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionFeedbackForm;
