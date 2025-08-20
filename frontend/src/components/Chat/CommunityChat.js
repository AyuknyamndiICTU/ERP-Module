import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  MoreVertical
} from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const CommunityChat = ({ onClose }) => {
  const [activeChat, setActiveChat] = useState('general');
  const [messages, setMessages] = useState([]);
  const [isTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const [chats] = useState([
    {
      id: 'general',
      name: 'General Discussion',
      type: 'group',
      participants: 45,
      lastMessage: 'Hey everyone! How are the new courses going?',
      lastMessageTime: '2 min ago',
      unreadCount: 3,
      avatar: '🌟'
    },
    {
      id: 'academic',
      name: 'Academic Support',
      type: 'group',
      participants: 28,
      lastMessage: 'Can someone help with the assignment?',
      lastMessageTime: '5 min ago',
      unreadCount: 1,
      avatar: '📚'
    },
    {
      id: 'announcements',
      name: 'Announcements',
      type: 'group',
      participants: 156,
      lastMessage: 'New semester schedule is now available',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      avatar: '📢'
    },
    {
      id: 'social',
      name: 'Social Hub',
      type: 'group',
      participants: 89,
      lastMessage: 'Anyone up for a study group this weekend?',
      lastMessageTime: '3 hours ago',
      unreadCount: 7,
      avatar: '🎉'
    }
  ]);

  const [sampleMessages] = useState([
    {
      id: 1,
      sender: 'John Smith',
      senderRole: 'Student',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      message: 'Hey everyone! How are the new courses going?',
      timestamp: '10:30 AM',
      type: 'text',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Sarah Johnson',
      senderRole: 'Faculty',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      message: 'The new curriculum is really engaging! Students seem to love the interactive elements.',
      timestamp: '10:32 AM',
      type: 'text',
      isOwn: false
    },
    {
      id: 3,
      sender: 'You',
      senderRole: 'Student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      message: 'I agree! The practical assignments are really helpful.',
      timestamp: '10:35 AM',
      type: 'text',
      isOwn: true
    },
    {
      id: 4,
      sender: 'Mike Wilson',
      senderRole: 'Student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      message: 'Check out this resource I found for our project',
      timestamp: '10:38 AM',
      type: 'file',
      fileName: 'project-guidelines.pdf',
      fileSize: '2.4 MB',
      isOwn: false
    }
  ]);

  useEffect(() => {
    setMessages(sampleMessages);
    setOnlineUsers([
      { id: 1, name: 'John Smith', role: 'Student', status: 'online' },
      { id: 2, name: 'Sarah Johnson', role: 'Faculty', status: 'online' },
      { id: 3, name: 'Mike Wilson', role: 'Student', status: 'away' },
      { id: 4, name: 'Emma Davis', role: 'Admin', status: 'online' }
    ]);
  }, [sampleMessages]);

  const handleSendMessage = (messageData) => {
    const newMsg = {
      id: messages.length + 1,
      sender: 'You',
      senderRole: 'Student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      ...messageData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    setMessages([...messages, newMsg]);
  };

  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className="w-[900px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
      {/* Sidebar */}
      <ChatSidebar 
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onlineUsers={onlineUsers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg">
              {currentChat?.avatar}
            </div>
            <div>
              <h3 className="font-semibold">{currentChat?.name}</h3>
              <p className="text-sm opacity-90">{currentChat?.participants} participants</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <MessageList messages={messages} isTyping={isTyping} />

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default CommunityChat;
