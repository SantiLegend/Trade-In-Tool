import React from 'react';
import type { BoatFormData } from '../types';
import { LoadingIndicator } from './LoadingIndicator';

interface Step3Props {
  formData: BoatFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  prevStep: () => void;
  isLoading: boolean;
}

export const Step3Contact: React.FC<Step3Props> = ({ formData, handleChange, handleSubmit, prevStep, isLoading }) => {
  const isFormValid = formData.fullName && formData.email && formData.email.includes('@') && formData.phone && formData.postalCode;

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Almost there!</h2>
      <p className="text-gray-500 mb-6">Where should we send your estimate?</p>
      <div className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
          <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="A1B 2C3" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">We'll use this to send your estimate and follow up. We respect your privacy.</p>
      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
        <button onClick={prevStep} className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-all">Back</button>
        <button onClick={handleSubmit} disabled={!isFormValid || isLoading} className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center">
          Get My Trade-In Estimate!
        </button>
      </div>
    </div>
  );
};