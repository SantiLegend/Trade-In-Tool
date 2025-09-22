import React, { useState, useEffect } from 'react';

const messages = [
  "Initializing appraisal engine...",
  "Analyzing your boat's photos...",
  "Cross-referencing historical sales data...",
  "Scanning live Canadian market data...",
  "Identifying value-adding features...",
  "Finalizing your estimate range...",
];

export const LoadingIndicator: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setCurrentMessage(messages[index]);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
      <svg className="animate-spin h-12 w-12 text-blue-600 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Your Estimate...</h2>
      <p className="text-gray-600 transition-opacity duration-500">{currentMessage}</p>
    </div>
  );
};
