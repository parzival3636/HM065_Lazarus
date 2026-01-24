/**
 * TalkJS Helper Utilities
 * 
 * This file contains helper functions for working with TalkJS
 * including user creation, conversation setup, and session management
 */

import Talk from 'talkjs';
import { TALKJS_APP_ID, USER_ROLES } from '../config/talkjs.config';

/**
 * Initialize TalkJS and wait for it to be ready
 * @returns {Promise<Talk>} TalkJS instance
 */
export const initializeTalkJS = async () => {
  await Talk.ready;
  return Talk;
};

/**
 * Create a TalkJS user object from your app's user data
 * 
 * @param {Object} userData - User data from your application
 * @param {string} userData.id - Unique user ID
 * @param {string} userData.name - User's display name
 * @param {string} userData.email - User's email
 * @param {string} userData.role - User's role (company/developer)
 * @param {string} [userData.photoUrl] - Optional profile photo URL
 * @returns {Talk.User} TalkJS User object
 */
export const createTalkJSUser = (userData) => {
  return new Talk.User({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    photoUrl: userData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=667eea&color=fff`,
    role: userData.role || USER_ROLES.DEVELOPER,
    // Custom properties for filtering and display
    // Note: All custom properties must be strings or numbers
    custom: {
      userType: userData.role || 'developer',
      companyName: userData.companyName || '',
      skills: Array.isArray(userData.skills) ? userData.skills.join(', ') : (userData.skills || '')
    }
  });
};

/**
 * Create or get a TalkJS session for the current user
 * 
 * @param {Object} currentUser - Current logged-in user data
 * @returns {Promise<Talk.Session>} TalkJS Session
 */
export const createTalkJSSession = async (currentUser) => {
  await Talk.ready;
  
  const talkUser = createTalkJSUser(currentUser);
  const session = new Talk.Session({
    appId: TALKJS_APP_ID,
    me: talkUser
  });
  
  return session;
};

/**
 * Create a team conversation with multiple participants
 * 
 * @param {Talk.Session} session - TalkJS session
 * @param {string} conversationId - Unique conversation ID (e.g., team_assignment_id)
 * @param {Object} conversationData - Conversation metadata
 * @param {string} conversationData.subject - Conversation title
 * @param {string} conversationData.photoUrl - Conversation photo
 * @param {Array} participants - Array of user objects to add to conversation
 * @returns {Talk.ConversationBuilder} Conversation builder
 */
export const createTeamConversation = (session, conversationId, conversationData, participants) => {
  const conversation = session.getOrCreateConversation(conversationId);
  
  // Set conversation properties
  conversation.setAttributes({
    subject: conversationData.subject,
    photoUrl: conversationData.photoUrl || 'https://ui-avatars.com/api/?name=Team&background=667eea&color=fff',
    welcomeMessages: [conversationData.welcomeMessage || 'Welcome to the team chat!'],
    custom: {
      conversationType: 'team',
      projectId: conversationData.projectId,
      teamName: conversationData.teamName
    }
  });
  
  // Add all participants to the conversation
  participants.forEach(participant => {
    const talkUser = createTalkJSUser(participant);
    conversation.setParticipant(talkUser);
  });
  
  return conversation;
};

/**
 * Create a one-on-one conversation between two users
 * 
 * @param {Talk.Session} session - TalkJS session
 * @param {string} conversationId - Unique conversation ID
 * @param {Object} otherUser - The other user in the conversation
 * @param {Object} conversationData - Optional conversation metadata
 * @returns {Talk.ConversationBuilder} Conversation builder
 */
export const createOneOnOneConversation = (session, conversationId, otherUser, conversationData = {}) => {
  const conversation = session.getOrCreateConversation(conversationId);
  
  const talkUser = createTalkJSUser(otherUser);
  conversation.setParticipant(talkUser);
  
  // Set conversation properties
  conversation.setAttributes({
    subject: conversationData.subject || `Chat with ${otherUser.name}`,
    custom: {
      conversationType: 'one_on_one',
      projectId: conversationData.projectId || null
    }
  });
  
  return conversation;
};

/**
 * Send a system message to a conversation
 * 
 * @param {Talk.ConversationBuilder} conversation - TalkJS conversation
 * @param {string} message - System message text
 */
export const sendSystemMessage = (conversation, message) => {
  conversation.sendMessage(message, {
    custom: {
      isSystemMessage: true
    }
  });
};

/**
 * Get conversation ID for a team assignment
 * 
 * @param {string} teamAssignmentId - Team assignment ID
 * @returns {string} Conversation ID
 */
export const getTeamConversationId = (teamAssignmentId) => {
  return `team_${teamAssignmentId}`;
};

/**
 * Get conversation ID for a one-on-one chat
 * 
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} Conversation ID (sorted to ensure consistency)
 */
export const getOneOnOneConversationId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
};

/**
 * Format user data from your app's user object
 * This is where you'll connect your real authentication data
 * 
 * @param {Object} user - User object from your app
 * @returns {Object} Formatted user data for TalkJS
 */
export const formatUserForTalkJS = (user) => {
  // TODO: Replace with your actual user data structure
  return {
    id: user.id || user.user_id || user.uid,
    name: user.name || `${user.first_name} ${user.last_name}`.trim() || user.email,
    email: user.email,
    role: user.user_type || user.role || USER_ROLES.DEVELOPER,
    photoUrl: user.photo_url || user.avatar || null,
    companyName: user.company_name || null,
    skills: user.skills || []
  };
};

/**
 * Check if TalkJS is properly configured
 * @returns {boolean} True if configured, false otherwise
 */
export const isTalkJSConfigured = () => {
  // Check if App ID is configured (not the placeholder)
  const isConfigured = Boolean(
    TALKJS_APP_ID && 
    typeof TALKJS_APP_ID === 'string' &&
    TALKJS_APP_ID !== 'YOUR_TALKJS_APP_ID' &&
    TALKJS_APP_ID.length >= 5
  );
  
  return isConfigured;
};
