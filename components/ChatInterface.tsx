import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  isSending: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, inputValue, onInputChange, onSendMessage, isSending }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSending) {
      onSendMessage();
    }
  };

  return (
    <div className="mt-8 text-left border-t border-gray-200 pt-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Refine Your Estimate</h3>
      <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto flex flex-col space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                <SparklesIcon />
              </div>
            )}
            <div className={`p-3 rounded-lg max-w-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              {msg.text}
            </div>
             {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center flex-shrink-0">
                <UserIcon />
              </div>
            )}
          </div>
        ))}
        {isSending && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
               <SparklesIcon />
             </div>
             <div className="p-3 rounded-lg bg-white border">
                <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
             </div>
           </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          placeholder="e.g., How does saltwater affect this value?"
          className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isSending}
        />
        <button
          onClick={onSendMessage}
          disabled={isSending || !inputValue.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
};
