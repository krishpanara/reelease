export const SOCKET = {
  Events: {
    Channel_Updates: 'channel-updates',
  },
  Type: {
    Removal: 'removal',
  },
  Listeners: {
    Message_Delivered: 'message-delivered',
    Message_Seen: 'message-seen',
    Receive_Message: 'receive-message',
    User_Status_Update: 'user-status-update',
    Conversation_Resolved: 'conversation-resolved',
    Conversation_Updated: 'conversation-updated',
    New_Agent_Request: 'new-agent-request',
    Conversation_Transferred: 'conversation-transferred',
    New_Notification: 'new-notification',
  },
  Emitters: {
    Message_Delivered: 'message-delivered',
    Message_Seen: 'message-seen',
    Join_Room: 'join-room',
  },
}
