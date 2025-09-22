
import React, { useState } from 'react';
import type { Estimate, ComparableBoat, ChatMessage } from '../types';
import { ChatInterface } from './ChatInterface';
import { BoatIcon } from './icons/BoatIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface Step4Props {
  estimate: Estimate | null;
  appraisalRequested: boolean;
  handleRequestAppraisal: () => void;
  // Chat props
  chatHistory: ChatMessage[];
  chatInputValue: string;
  handleChatInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendChatMessage: () => void;
  isChatSending: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ComparableBoatCard: React.FC<{ boat: ComparableBoat }> = ({ boat }) => {
  const [imgError, setImgError] = useState(false);

  const getHostname = (source: string): string => {
    try {
      if (source && (source.startsWith('http://') || source.startsWith('https://'))) {
        return new URL(source).hostname.replace('www.', '');
      }
    } catch (e) {
      // invalid URL
    }
    return '';
  };

  const hostname = getHostname(boat.source);
  const faviconUrl = hostname ? `https://www.google.com/s2/favicons?sz=64&domain_url=${hostname}` : '';

  return (
    <a
      href={boat.source}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all hover:shadow-md hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
    >
      <div className="flex items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-white border rounded-md flex items-center justify-center">
          {faviconUrl && !imgError ? (
            <img
              src={faviconUrl}
              alt={`${hostname} favicon`}
              className="w-8 h-8 object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <BoatIcon />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-gray-800">{boat.year} {boat.make} {boat.model}</p>
          <p className="text-sm text-gray-500 truncate">{hostname || 'External Listing'}</p>
        </div>
        <div className="flex-shrink-0 text-right ml-auto">
          <p className="font-bold text-lg text-gray-900 mb-1">{formatCurrency(boat.price)}</p>
          <div className="flex items-center justify-end gap-1 text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View</span>
            <ExternalLinkIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
};

const AnalysisSection: React.FC<{ title: string; items: string[]; color: 'green' | 'red' }> = ({ title, items, color }) => {
  if (!items || items.length === 0) return null;
  const icon = color === 'green' ? '👍' : '⚠️';
  return (
    <div className="text-left mt-6">
      <h4 className="font-bold text-md text-gray-800 mb-2">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-sm">
            <span className="mr-2">{icon}</span>
            <span className="text-gray-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Step4Estimate: React.FC<Step4Props> = ({ 
    estimate, appraisalRequested, handleRequestAppraisal,
    chatHistory, chatInputValue, handleChatInputChange, handleSendChatMessage, isChatSending
 }) => {
  if (!estimate) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-gray-800">Error generating estimate.</h2>
        <p className="text-gray-600">We couldn't generate an estimate at this time. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="text-center animate-fade-in-up p-4 sm:p-8 bg-white rounded-lg">
      <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">Here is your estimated trade-in range!</h2>
      <p className="text-gray-600 mb-6 text-left">{estimate.reasoning}</p>
      
      <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6 sm:p-8 my-6">
        <p className="text-lg text-gray-700 font-medium mb-2">Estimated Value</p>
        <p className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
          {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
          <AnalysisSection title="Value-Adding Features" items={estimate.valueAddingFeatures} color="green" />
          <AnalysisSection title="Potential Deductions" items={estimate.potentialDeductions} color="red" />
      </div>


      {estimate.comparables && estimate.comparables.length > 0 && (
        <div className="text-left my-8">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Based on These Market Comparables</h3>
            <div className="space-y-3">
              {estimate.comparables.map((boat, index) => (
                <ComparableBoatCard key={index} boat={boat} />
              ))}
            </div>
        </div>
      )}

      <div className="text-left bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold text-lg text-gray-800 mb-2">What's Next?</h3>
        <p className="text-gray-600 mb-4">A Legend Boats specialist will review your submission and contact you shortly to confirm the details and schedule a professional appraisal.</p>
        <p className="text-xs text-gray-500 italic">
          <strong>Disclaimer:</strong> This is an online estimate based on market data and the information you provided. A final, guaranteed offer requires a quick, in-person inspection at one of our dealerships.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={handleRequestAppraisal}
          disabled={appraisalRequested}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-green-600 disabled:cursor-not-allowed">
            {appraisalRequested ? '✅ Appraisal Requested' : 'Schedule an Appraisal'}
        </button>
        <a 
          href="https://www.legendboats.com/new-boats/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-all text-center">
          View Our New Boats
        </a>
      </div>
      {appraisalRequested && (
        <p className="text-sm text-green-700 mt-4">
          A specialist will contact you soon to confirm a time.
        </p>
      )}

      <ChatInterface 
         messages={chatHistory}
         inputValue={chatInputValue}
         onInputChange={handleChatInputChange}
         onSendMessage={handleSendChatMessage}
         isSending={isChatSending}
       />
    </div>
  );
};
