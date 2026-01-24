/**
 * TalkJS Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://talkjs.com/dashboard/
 * 2. Create a new app in the TalkJS dashboard
 * 3. Copy your App ID from the dashboard
 * 4. Replace 'YOUR_TALKJS_APP_ID' below with your actual App ID
 * 
 * For development, you can use the test mode App ID
 * For production, use your production App ID
 */

export const TALKJS_APP_ID = 'tOHI158o';

/**
 * TalkJS Configuration Options
 */
export const TALKJS_CONFIG = {
  // Enable file uploads (images, PDFs, ZIPs, etc.)
  enableFileSharing: true,
  
  // Maximum file size in bytes (50MB)
  maxFileSize: 50 * 1024 * 1024,
  
  // Allowed file types
  allowedFileTypes: [
    'image/*',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/*',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx'
  ]
};

/**
 * User role mapping for TalkJS
 */
export const USER_ROLES = {
  COMPANY: 'company',
  DEVELOPER: 'developer',
  ADMIN: 'admin'
};

/**
 * Conversation types
 */
export const CONVERSATION_TYPES = {
  TEAM: 'team',
  ONE_ON_ONE: 'one_on_one',
  PROJECT: 'project'
};
