/**
 * TalkJS Chat Component
 * 
 * A professional real-time chat interface powered by TalkJS
 * Supports:
 * - Real-time messaging
 * - File uploads (images, PDFs, ZIPs, documents)
 * - Persistent message history
 * - Team and one-on-one conversations
 * - Message alignment (sender right, others left)
 * - Automatic message storage
 */

import { useEffect, useRef, useState } from 'react';
import Talk from 'talkjs';
import {
  createTalkJSSession,
  createTeamConversation,
  createOneOnOneConversation,
  getTeamConversationId,
  formatUserForTalkJS,
  isTalkJSConfigured
} from '../utils/talkjsHelpers';
import { TALKJS_APP_ID } from '../config/talkjs.config';
import './TalkJSChat.css';

/**
 * TalkJS Chat Component
 * 
 * @param {Object} props
 * @param {Object} props.currentUser - Currently logged-in user
 * @param {string} props.conversationId - Unique conversation ID
 * @param {string} props.conversationType - 'team' or 'one_on_one'
 * @param {Array} props.participants - Array of participant user objects (for team chats)
 * @param {Object} props.otherUser - Other user object (for one-on-one chats)
 * @param {Object} props.conversationData - Additional conversation metadata
 * @param {string} props.height - Chat container height (default: '600px')
 */
const TalkJSChat = ({
  currentUser,
  conversationId,
  conversationType = 'team',
  participants = [],
  otherUser = null,
  conversationData = {},
  height = '600px'
}) => {
  const chatContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatbox, setChatbox] = useState(null);

  useEffect(() => {
    // Check if TalkJS is configured
    if (!isTalkJSConfigured()) {
      setError('TalkJS is not configured. Please add your App ID in src/config/talkjs.config.js');
      setIsLoading(false);
      return;
    }

    // Validate required props
    if (!currentUser) {
      setError('Current user is required');
      setIsLoading(false);
      return;
    }

    if (!conversationId) {
      setError('Conversation ID is required');
      setIsLoading(false);
      return;
    }

    if (conversationType === 'team' && participants.length === 0) {
      setError('Participants are required for team conversations');
      setIsLoading(false);
      return;
    }

    if (conversationType === 'one_on_one' && !otherUser) {
      setError('Other user is required for one-on-one conversations');
      setIsLoading(false);
      return;
    }

    let session;
    let chatboxInstance;

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if container ref is available
        if (!chatContainerRef.current) {
          throw new Error('Chat container not ready');
        }

        // Format current user for TalkJS
        const formattedCurrentUser = formatUserForTalkJS(currentUser);

        // Create TalkJS session
        session = await createTalkJSSession(formattedCurrentUser);

        // Create conversation based on type
        let conversation;
        if (conversationType === 'team') {
          // Format all participants
          const formattedParticipants = participants.map(formatUserForTalkJS);
          
          conversation = createTeamConversation(
            session,
            conversationId,
            {
              subject: conversationData.subject || 'Team Chat',
              photoUrl: conversationData.photoUrl,
              welcomeMessage: conversationData.welcomeMessage,
              projectId: conversationData.projectId,
              teamName: conversationData.teamName
            },
            formattedParticipants
          );
        } else {
          // Format other user
          const formattedOtherUser = formatUserForTalkJS(otherUser);
          
          conversation = createOneOnOneConversation(
            session,
            conversationId,
            formattedOtherUser,
            conversationData
          );
        }

        // Create chatbox UI
        chatboxInstance = session.createChatbox();
        chatboxInstance.select(conversation);
        
        // Mount chatbox to DOM
        chatboxInstance.mount(chatContainerRef.current);
        
        setChatbox(chatboxInstance);
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to initialize TalkJS chat:', err);
        setError(`Failed to load chat: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (chatboxInstance) {
        chatboxInstance.destroy();
      }
      if (session) {
        session.destroy();
      }
    };
  }, [currentUser, conversationId, conversationType, participants, otherUser, conversationData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="talkjs-chat-container" style={{ height }} ref={chatContainerRef}>
        <div className="talkjs-loading">
          <div className="talkjs-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="talkjs-chat-container" style={{ height }} ref={chatContainerRef}>
        <div className="talkjs-error">
          <div className="talkjs-error-icon">⚠️</div>
          <h3>Chat Error</h3>
          <p>{error}</p>
          {!isTalkJSConfigured() && (
            <div className="talkjs-setup-instructions">
              <h4>Setup Instructions:</h4>
              <ol>
                <li>Sign up at <a href="https://talkjs.com/dashboard/" target="_blank" rel="noopener noreferrer">TalkJS Dashboard</a></li>
                <li>Create a new app</li>
                <li>Copy your App ID</li>
                <li>Add it to <code>src/config/talkjs.config.js</code></li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render chat container
  return (
    <div 
      className="talkjs-chat-container" 
      style={{ height }}
      ref={chatContainerRef}
    >
      {/* TalkJS chatbox will be mounted here */}
    </div>
  );
};

export default TalkJSChat;
