
import React from 'react';
import type { BoatFormData } from '../types';
import { BOAT_TYPES, YEARS, BOAT_MAKES, ENGINE_MAKES } from '../constants';

interface Step1Props {
  formData: BoatFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBooleanChange: (name: string, value: boolean) => void;
  nextStep: () => void;
  handleSaveProgress: () => void;
}

export const Step1BoatInfo: React.FC<Step1Props> = ({ formData, handleChange, handleBooleanChange, nextStep, handleSaveProgress }) => {
  const isFormValid = formData.boatType && formData.year && formData.make && formData.model && formData.horsepower && formData.engineHours;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Tell us about your boat.</h2>
      <p className="text-gray-500 mb-6">Start with the basics. The more accurate you are, the better your estimate will be.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="boatType" className="block text-sm font-medium text-gray-700 mb-1">Boat Type</label>
          <select id="boatType" name="boatType" value={formData.boatType} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select a type...</option>
            {BOAT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select id="year" name="year" value={formData.year} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select a year...</option>
            {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
          <select id="make" name="make" value={formData.make} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select a make...</option>
            {BOAT_MAKES.map(make => <option key={make} value={make}>{make}</option>)}
          </select>
        </div>
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g., 1650 Angler" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div className="col-span-1 md:col-span-2">
            <label htmlFor="hin" className="block text-sm font-medium text-gray-700 mb-1">Hull ID Number (HIN) <span className="text-gray-400">(Optional)</span></label>
            <input type="text" id="hin" name="hin" value={formData.hin} onChange={handleChange} placeholder="e.g., ABC12345D678" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
            <label htmlFor="engineMake" className="block text-sm font-medium text-gray-700 mb-1">Engine Make <span className="text-gray-400">(Optional)</span></label>
            <select id="engineMake" name="engineMake" value={formData.engineMake} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select an engine make...</option>
              {ENGINE_MAKES.map(make => <option key={make} value={make}>{make}</option>)}
            </select>
        </div>

        <div>
          <label htmlFor="horsepower" className="block text-sm font-medium text-gray-700 mb-1">Engine Horsepower (HP)</label>
          <input type="number" id="horsepower" name="horsepower" value={formData.horsepower} onChange={handleChange} placeholder="e.g., 150" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label htmlFor="engineHours" className="block text-sm font-medium text-gray-700 mb-2">Approximate Engine Hours</label>
          <div className="flex items-center space-x-4">
            <input 
              id="engineHours" 
              name="engineHours" 
              type="range" 
              min="0" 
              max="2000" 
              step="25" 
              value={formData.engineHours} 
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="flex-shrink-0 w-32 text-center bg-gray-100 text-gray-800 font-semibold py-2 px-3 rounded-lg">
              {formData.engineHours} hours
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Move the slider to estimate. For boats over 2000 hours, please contact us directly.</p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Does it include a trailer?</label>
          <div className="flex space-x-4">
            <button onClick={() => handleBooleanChange('trailer', true)} className={`flex-1 p-3 text-center border rounded-lg transition-colors ${formData.trailer ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Yes</button>
            <button onClick={() => handleBooleanChange('trailer', false)} className={`flex-1 p-3 text-center border rounded-lg transition-colors ${!formData.trailer ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>No</button>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center">
        <button onClick={handleSaveProgress} className="text-sm text-blue-600 hover:underline">Save & Continue Later</button>
        <button onClick={nextStep} disabled={!isFormValid} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all">Next Step</button>
      </div>
    </div>
  );
};
