import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import CommunityChat from './CommunityChat';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Button - Fixed position at bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className={`
            relative group
            w-16 h-16 rounded-full
            bg-gradient-to-r from-purple-600 to-blue-600
            hover:from-purple-700 hover:to-blue-700
            shadow-lg hover:shadow-xl
            transform hover:scale-110 transition-all duration-300
            flex items-center justify-center
            ${isOpen ? 'rotate-180' : ''}
          `}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
          
          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">3</span>
          </div>
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-purple-600 opacity-75 animate-ping"></div>
        </button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
            onClick={toggleChat}
          ></div>
          
          {/* Chat Container */}
          <div className="relative z-50 mr-20 mb-20">
            <CommunityChat onClose={toggleChat} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;
