import React, { useState, useEffect } from 'react';
import './RejectionNotifications.css';

const RejectionNotifications = ({ developerEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (developerEmail) {
      fetchUnreadRejections();
      // Poll for new rejections every 30 seconds
      const interval = setInterval(fetchUnreadRejections, 30000);
      return () => clearInterval(interval);
    }
  }, [developerEmail]);

  const fetchUnreadRejections = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/rejections/unread/${developerEmail}/`
      );
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching rejection notifications:', error);
    }
  };

  const fetchAllRejections = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/rejections/developer/${developerEmail}/`
      );
      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Error fetching all rejections:', error);
      return [];
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `http://127.0.0.1:8000/api/projects/rejections/${notificationId}/mark-read/`,
        { method: 'POST' }
      );
      fetchUnreadRejections();
    } catch (error) {
      console.error('Error marking rejection as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        `http://127.0.0.1:8000/api/projects/rejections/mark-all-read/${developerEmail}/`,
        { method: 'POST' }
      );
      fetchUnreadRejections();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const openNotification = async (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const viewAllNotifications = async () => {
    const allNotifications = await fetchAllRejections();
    if (allNotifications.length > 0) {
      setNotifications(allNotifications);
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Unread rejection notifications banner */}
      {unreadCount > 0 && (
        <div className="rejection-banner">
          <div className="rejection-banner-content">
            <span className="rejection-icon">📬</span>
            <div className="rejection-banner-text">
              <strong>You have {unreadCount} new message{unreadCount > 1 ? 's' : ''} from DevConnect</strong>
              <p>Updates about your project applications</p>
            </div>
            <div className="rejection-banner-actions">
              <button onClick={viewAllNotifications} className="view-btn">
                View Messages
              </button>
              <button onClick={markAllAsRead} className="dismiss-btn">
                Dismiss All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing notifications */}
      {showModal && (
        <div className="rejection-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="rejection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rejection-modal-header">
              <h2>Messages from DevConnect</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>

            <div className="rejection-modal-body">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <p>No messages at this time</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                      onClick={() => openNotification(notification)}
                    >
                      <div className="notification-header">
                        <h3>{notification.title}</h3>
                        {!notification.is_read && <span className="unread-badge">New</span>}
                      </div>
                      <p className="notification-project">
                        Regarding: <strong>{notification.project_title}</strong>
                      </p>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-footer">
                        <span className="notification-date">
                          {new Date(notification.sent_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rejection-modal-footer">
              <button onClick={() => setShowModal(false)} className="close-modal-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RejectionNotifications;
