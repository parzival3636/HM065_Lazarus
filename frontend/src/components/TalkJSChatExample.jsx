/**
 * TalkJS Chat Example Component
 * 
 * This demonstrates how to use the TalkJSChat component
 * with both team and one-on-one conversations
 * 
 * REPLACE THE DUMMY DATA WITH YOUR REAL USER DATA
 */

import { useState } from 'react';
import TalkJSChat from './TalkJSChat';
import { getTeamConversationId } from '../utils/talkjsHelpers';

const TalkJSChatExample = () => {
  const [chatType, setChatType] = useState('team'); // 'team' or 'one_on_one'

  // ============================================
  // DUMMY DATA - REPLACE WITH REAL USER DATA
  // ============================================
  
  // Current logged-in user
  // TODO: Replace with actual user from your authentication system
  const currentUser = {
    id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com',
    user_type: 'company', // or 'developer'
    company_name: 'Tech Corp',
    photo_url: null // Optional: user profile photo URL
  };

  // Team chat participants (for team conversations)
  // TODO: Fetch from your team assignment API
  const teamParticipants = [
    {
      id: 'dev_456',
      name: 'Alice Developer',
      email: 'alice@example.com',
      user_type: 'developer',
      skills: ['React', 'Node.js']
    },
    {
      id: 'dev_789',
      name: 'Bob Developer',
      email: 'bob@example.com',
      user_type: 'developer',
      skills: ['Python', 'Django']
    },
    {
      id: 'user_123', // Include current user in team
      name: 'John Doe',
      email: 'john@example.com',
      user_type: 'company',
      company_name: 'Tech Corp'
    }
  ];

  // Other user (for one-on-one conversations)
  // TODO: Get from your user selection or assignment
  const otherUser = {
    id: 'dev_456',
    name: 'Alice Developer',
    email: 'alice@example.com',
    user_type: 'developer',
    skills: ['React', 'Node.js']
  };

  // Team assignment data
  // TODO: Fetch from your team assignment API
  const teamAssignment = {
    id: 'team_assignment_001',
    team_name: 'Project Alpha Team',
    project_title: 'E-commerce Website',
    project_id: 'project_123'
  };

  // ============================================
  // CONVERSATION SETUP
  // ============================================

  // Team conversation ID (based on team assignment)
  const teamConversationId = getTeamConversationId(teamAssignment.id);

  // Team conversation metadata
  const teamConversationData = {
    subject: `${teamAssignment.team_name} - ${teamAssignment.project_title}`,
    welcomeMessage: `Welcome to ${teamAssignment.team_name}! Let's collaborate on ${teamAssignment.project_title}.`,
    projectId: teamAssignment.project_id,
    teamName: teamAssignment.team_name,
    photoUrl: 'https://ui-avatars.com/api/?name=Team&background=667eea&color=fff'
  };

  // One-on-one conversation ID
  const oneOnOneConversationId = `chat_${currentUser.id}_${otherUser.id}`;

  // One-on-one conversation metadata
  const oneOnOneConversationData = {
    subject: `Chat with ${otherUser.name}`,
    projectId: teamAssignment.project_id
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>TalkJS Chat Integration</h1>
      
      {/* Chat Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setChatType('team')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            background: chatType === 'team' ? '#667eea' : '#e5e7eb',
            color: chatType === 'team' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Team Chat
        </button>
        <button
          onClick={() => setChatType('one_on_one')}
          style={{
            padding: '10px 20px',
            background: chatType === 'one_on_one' ? '#667eea' : '#e5e7eb',
            color: chatType === 'one_on_one' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          One-on-One Chat
        </button>
      </div>

      {/* Chat Info */}
      <div style={{
        background: '#f0f9ff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          {chatType === 'team' ? '👥 Team Chat' : '💬 One-on-One Chat'}
        </h3>
        <p style={{ margin: 0, color: '#374151' }}>
          {chatType === 'team' 
            ? `Chatting with ${teamParticipants.length} team members about ${teamAssignment.project_title}`
            : `Private conversation with ${otherUser.name}`
          }
        </p>
      </div>

      {/* TalkJS Chat Component */}
      {chatType === 'team' ? (
        <TalkJSChat
          currentUser={currentUser}
          conversationId={teamConversationId}
          conversationType="team"
          participants={teamParticipants}
          conversationData={teamConversationData}
          height="600px"
        />
      ) : (
        <TalkJSChat
          currentUser={currentUser}
          conversationId={oneOnOneConversationId}
          conversationType="one_on_one"
          otherUser={otherUser}
          conversationData={oneOnOneConversationData}
          height="600px"
        />
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fef3c7',
        borderRadius: '8px',
        border: '2px solid #fbbf24'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>
          🔧 Integration Instructions
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#78350f' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Get TalkJS App ID:</strong> Sign up at{' '}
            <a href="https://talkjs.com/dashboard/" target="_blank" rel="noopener noreferrer">
              TalkJS Dashboard
            </a>{' '}
            and add your App ID to <code>src/config/talkjs.config.js</code>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Replace Dummy Data:</strong> Update the user data in this component with your real authentication data
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Integrate with Team Assignments:</strong> Use this component in your CompanyTeamAssignments and DeveloperTeamAssignments pages
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Test File Uploads:</strong> Try sending images, PDFs, and ZIP files in the chat
          </li>
          <li>
            <strong>Customize UI:</strong> Modify styles in <code>TalkJSChat.css</code> to match your brand
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TalkJSChatExample;
