
import React, { useState, useCallback } from 'react';
import type { BoatFormData, CosmeticCondition, MechanicalCondition } from '../types';
import { COSMETIC_CONDITIONS, MECHANICAL_CONDITIONS } from '../constants';

interface Step2Props {
  formData: BoatFormData;
  setFormData: React.Dispatch<React.SetStateAction<BoatFormData>>;
  nextStep: () => void;
  prevStep: () => void;
  handleSaveProgress: () => void;
}

export const Step2Condition: React.FC<Step2Props> = ({ formData, setFormData, nextStep, prevStep, handleSaveProgress }) => {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  const handleRadioChange = <T,>(name: string, value: T) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setFormData(prev => ({ ...prev, photos: files }));
      
      const previews = files.map(file => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    }
  };
  
  const isFormValid = formData.cosmeticCondition && formData.mechanicalCondition;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">How's it looking?</h2>
      <p className="text-gray-500 mb-6">Be honest about the condition. This helps us provide a more accurate estimate.</p>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Cosmetic Condition</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COSMETIC_CONDITIONS.map(cond => (
              <div key={cond.value} onClick={() => handleRadioChange('cosmeticCondition', cond.value)} className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.cosmeticCondition === cond.value ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                <p className="font-semibold text-gray-800">{cond.label}</p>
                <p className="text-sm text-gray-500">{cond.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Mechanical Condition</h3>
          <div className="space-y-3">
            {MECHANICAL_CONDITIONS.map(cond => (
              <div key={cond.value} onClick={() => handleRadioChange('mechanicalCondition', cond.value)} className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.mechanicalCondition === cond.value ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                <p className="font-semibold text-gray-800">{cond.label}</p>
                <p className="text-sm text-gray-500">{cond.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Upload Photos (Optional)</h3>
          <p className="text-gray-500 mb-3 text-sm">Photos help us give you our best offer! Upload up to 3 images.</p>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 3 files)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/png, image/jpeg" onChange={handleFileChange} />
            </label>
        </div>
        {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
                {photoPreviews.map((src, index) => (
                    <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                ))}
            </div>
        )}
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center">
        <button onClick={prevStep} className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-all">Back</button>
        <button onClick={handleSaveProgress} className="text-sm text-blue-600 hover:underline">Save Progress</button>
        <button onClick={nextStep} disabled={!isFormValid} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all">Next Step</button>
      </div>
    </div>
  );
};