import React, { useState, useEffect } from 'react';
import './FeedbackNotifications.css';

const FeedbackNotifications = ({ developerEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allFeedback, setAllFeedback] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);

  useEffect(() => {
    if (developerEmail) {
      fetchUnreadFeedback();
      // Poll for new feedback every 30 seconds
      const interval = setInterval(fetchUnreadFeedback, 30000);
      return () => clearInterval(interval);
    }
  }, [developerEmail]);

  const fetchUnreadFeedback = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/feedback/unread/${developerEmail}/`
      );
      const data = await response.json();
      setNotifications(data.feedbacks || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchAllFeedback = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/feedback/developer/${developerEmail}/`
      );
      const data = await response.json();
      setAllFeedback(data.feedbacks || []);
      setShowAllModal(true);
    } catch (error) {
      console.error('Error fetching all feedback:', error);
    }
  };

  const markAsRead = async (feedbackId) => {
    try {
      await fetch(
        `http://127.0.0.1:8000/api/projects/feedback/${feedbackId}/mark-read/`,
        { method: 'POST' }
      );
      fetchUnreadFeedback();
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    }
  };

  const StarDisplay = ({ rating }) => (
    <div className="star-display">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'filled' : ''}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="feedback-notifications">
      <div className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Feedback Notifications</h3>
            <button onClick={() => setShowDropdown(false)} className="close-btn">×</button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No new feedback</p>
            ) : (
              notifications.map((feedback) => (
                <div key={feedback.id} className="notification-item">
                  <div className="notification-content">
                    <h4>{feedback.project_title}</h4>
                    <StarDisplay rating={feedback.rating} />
                    <p className="feedback-preview">{feedback.feedback_text}</p>
                    <span className="notification-time">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => markAsRead(feedback.id)}
                    className="mark-read-btn"
                  >
                    Mark as Read
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="dropdown-footer">
            <button onClick={fetchAllFeedback} className="view-all-btn">
              View All Feedback
            </button>
          </div>
        </div>
      )}

      {showAllModal && (
        <div className="feedback-modal-overlay" onClick={() => setShowAllModal(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Feedback & Ratings</h2>
              <button onClick={() => setShowAllModal(false)} className="close-btn">×</button>
            </div>

            <div className="feedback-list">
              {allFeedback.length === 0 ? (
                <p className="no-feedback">No feedback received yet</p>
              ) : (
                allFeedback.map((feedback) => (
                  <div key={feedback.id} className="feedback-card">
                    <div className="feedback-header">
                      <h3>{feedback.project_title}</h3>
                      <StarDisplay rating={feedback.rating} />
                    </div>

                    <div className="detailed-ratings">
                      <div className="rating-item">
                        <span>Communication:</span>
                        <StarDisplay rating={feedback.communication_rating} />
                      </div>
                      <div className="rating-item">
                        <span>Quality:</span>
                        <StarDisplay rating={feedback.quality_rating} />
                      </div>
                      <div className="rating-item">
                        <span>Timeliness:</span>
                        <StarDisplay rating={feedback.timeliness_rating} />
                      </div>
                      <div className="rating-item">
                        <span>Professionalism:</span>
                        <StarDisplay rating={feedback.professionalism_rating} />
                      </div>
                    </div>

                    <div className="feedback-text">
                      <p>{feedback.feedback_text}</p>
                    </div>

                    <div className="feedback-footer">
                      <span className="company-name">From: {feedback.company_name}</span>
                      <span className="feedback-date">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackNotifications;
