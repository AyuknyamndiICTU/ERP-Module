import React, { useEffect, useRef } from 'react';
import { Download, FileText } from 'lucide-react';

const MessageList = ({ messages, isTyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    return timestamp;
  };

  const renderMessage = (message) => {
    const isOwn = message.isOwn;
    
    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
          {/* Avatar */}
          {!isOwn && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={message.avatar}
                alt={message.sender}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Message Content */}
          <div className={`${isOwn ? 'mr-2' : 'ml-2'}`}>
            {/* Sender Info */}
            {!isOwn && (
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {message.sender}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {message.senderRole}
                </span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`rounded-2xl px-4 py-3 ${
                isOwn
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.type === 'text' && (
                <p className="text-sm leading-relaxed">{message.message}</p>
              )}

              {message.type === 'file' && (
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isOwn ? 'bg-white bg-opacity-20' : 'bg-gray-200'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{message.fileName}</p>
                    <p className={`text-xs ${isOwn ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                      {message.fileSize}
                    </p>
                  </div>
                  <button className={`p-1 rounded ${isOwn ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'}`}>
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}

              {message.type === 'image' && (
                <div className="space-y-2">
                  <img
                    src={message.imageUrl}
                    alt="Shared content"
                    className="rounded-lg max-w-full h-auto"
                  />
                  {message.message && (
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  )}
                </div>
              )}

              {message.type === 'video' && (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      src={message.videoUrl}
                      className="w-full h-auto"
                      controls
                      poster={message.videoThumbnail}
                    />
                  </div>
                  {message.message && (
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {/* Welcome Message */}
      <div className="text-center mb-6">
        <div className="inline-block bg-white rounded-lg px-4 py-2 shadow-sm">
          <p className="text-sm text-gray-600">
            Welcome to the community chat! 🎉
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-1">
        {messages.map(renderMessage)}
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start mb-4">
          <div className="flex items-end space-x-2 max-w-[70%]">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="ml-2">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Someone is typing...
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
