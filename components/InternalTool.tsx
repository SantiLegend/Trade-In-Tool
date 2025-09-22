
import React, { useState, useCallback } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { ChatInterface } from './ChatInterface';
import { HeaderIcon } from './icons/HeaderIcon';
import type { BoatFormData, Estimate, ChatMessage } from '../types';
import { BOAT_TYPES, YEARS, BOAT_MAKES, COSMETIC_CONDITIONS, MECHANICAL_CONDITIONS } from '../constants';
import { getTradeInEstimate, postChatMessage } from '../services/geminiService';
import { logEstimateToCSV, downloadCSV } from '../services/loggingService';

const initialFormData: BoatFormData = {
  boatType: '', year: '', make: '', model: '', hin: '',
  engineMake: '', horsepower: '', engineHours: '', trailer: true,
  cosmeticCondition: '', mechanicalCondition: '', photos: [],
  fullName: '', email: '', phone: '', postalCode: '',
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const LeadQualityBadge: React.FC<{ quality: 'High' | 'Medium' | 'Low' }> = ({ quality }) => {
  const baseClasses = "px-3 py-1 text-sm font-bold rounded-full";
  const colorClasses = {
    High: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-red-100 text-red-800",
  };
  return <span className={`${baseClasses} ${colorClasses[quality]}`}>{quality} Lead</span>;
};


export const InternalTool: React.FC = () => {
  const [formData, setFormData] = useState<BoatFormData>(initialFormData);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimateLog, setEstimateLog] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  // Chat state
  const [systemInstruction, setSystemInstruction] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInputValue, setChatInputValue] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBooleanChange = useCallback((name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
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

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setEstimate(null);
    setChatHistory([]);
    setSystemInstruction('');

    const result = await getTradeInEstimate(formData);
    
    if (result) {
      setEstimate(result);

      if (result.low > 0) {
        setEstimateLog(prevLog => logEstimateToCSV(formData, result, prevLog));
        
        const instruction = `You are a helpful chat assistant for Legend Boats staff. The user is generating trade-in estimates.
        Initial Boat Context:
        - ${formData.year} ${formData.make} ${formData.model}
        - Estimate: $${result.low} - $${result.high} CAD
        - Lead Quality: ${result.leadQuality}`;
        setSystemInstruction(instruction);
        setChatHistory([{ role: 'model', text: `Chat initialized for the ${formData.year} ${formData.make} ${formData.model}.`}]);
      }
    }
    
    setIsLoading(false);
  }, [formData]);
  
  const handleDownloadLog = useCallback(() => {
    if (estimateLog) {
      downloadCSV(estimateLog, 'internal-estimate-log.csv');
    } else {
      alert("No estimates have been generated yet.");
    }
  }, [estimateLog]);

  const handleChatInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInputValue(e.target.value);
  }, []);

  const handleSendChatMessage = useCallback(async () => {
    if (!systemInstruction || !chatInputValue.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: chatInputValue };
    const currentHistory = [...chatHistory, userMessage];
    setChatHistory(currentHistory);
    setChatInputValue('');
    setIsChatSending(true);

    try {
        const responseText = await postChatMessage(systemInstruction, currentHistory);
        const modelMessage: ChatMessage = { role: 'model', text: responseText };
        setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatSending(false);
    }
  }, [systemInstruction, chatHistory, chatInputValue]);

  const isFormValid = formData.boatType && formData.year && formData.make && formData.model && formData.horsepower && formData.engineHours && formData.cosmeticCondition && formData.mechanicalCondition;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center p-4">
       <header className="text-center mb-8 w-full max-w-4xl">
        <HeaderIcon className="h-14 w-14 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Internal Trade-In Tool</h1>
      </header>
      
      <main className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Boat Info Section */}
          <fieldset className="mb-8">
            <legend className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 w-full">Boat Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label htmlFor="boatType" className="block text-sm font-medium text-gray-700 mb-1">Boat Type</label>
                <select id="boatType" name="boatType" value={formData.boatType} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a type...</option>
                  {BOAT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select id="year" name="year" value={formData.year} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a year...</option>
                  {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <select id="make" name="make" value={formData.make} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a make...</option>
                  {BOAT_MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g., 1650 Angler" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
               <div className="md:col-span-1">
                 <label htmlFor="horsepower" className="block text-sm font-medium text-gray-700 mb-1">Horsepower (HP)</label>
                 <input type="number" id="horsepower" name="horsepower" value={formData.horsepower} onChange={handleChange} placeholder="e.g., 150" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
               </div>
               <div className="md:col-span-1">
                 <label htmlFor="engineHours" className="block text-sm font-medium text-gray-700 mb-1">Engine Hours</label>
                 <input type="number" id="engineHours" name="engineHours" value={formData.engineHours} onChange={handleChange} placeholder="e.g., 250" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
               </div>
               <div className="md:col-span-1 flex items-end">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trailer Included?</label>
                  <div className="flex space-x-4">
                    <button type="button" onClick={() => handleBooleanChange('trailer', true)} className={`flex-1 p-3 text-center border rounded-lg transition-colors ${formData.trailer ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Yes</button>
                    <button type="button" onClick={() => handleBooleanChange('trailer', false)} className={`flex-1 p-3 text-center border rounded-lg transition-colors ${!formData.trailer ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>No</button>
                  </div>
                </div>
               </div>
            </div>
          </fieldset>

          {/* Condition & Photos Section */}
           <fieldset className="mb-8">
            <legend className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 w-full">Condition & Photos</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Cosmetic Condition</h3>
                  <div className="space-y-2">
                    {COSMETIC_CONDITIONS.map(cond => (
                      <div key={cond.value} onClick={() => handleRadioChange('cosmeticCondition', cond.value)} className={`p-3 border rounded-lg cursor-pointer transition-all ${formData.cosmeticCondition === cond.value ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                          {cond.label}
                      </div>
                    ))}
                  </div>
                </div>
                 <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Mechanical Condition</h3>
                  <div className="space-y-2">
                    {MECHANICAL_CONDITIONS.map(cond => (
                      <div key={cond.value} onClick={() => handleRadioChange('mechanicalCondition', cond.value)} className={`p-3 border rounded-lg cursor-pointer transition-all ${formData.mechanicalCondition === cond.value ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                         {cond.label}
                      </div>
                    ))}
                  </div>
                </div>
                 <div className="md:col-span-2">
                   <h3 className="text-lg font-medium text-gray-800 mb-3">Photos</h3>
                    <input id="dropzone-file" type="file" multiple accept="image/png, image/jpeg" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {photoPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {photoPreviews.map((src, index) => (
                                <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
           </fieldset>
           
          {/* Customer Info Section (Optional) */}
          <fieldset>
            <legend className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 w-full">Customer Information <span className="text-base font-normal text-gray-500">(Optional)</span></legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </fieldset>
          
          <div className="mt-8 text-center">
             <button type="submit" disabled={!isFormValid || isLoading} className="w-full max-w-sm px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all">
              {isLoading ? 'Generating...' : 'Get Trade-In Estimate'}
            </button>
          </div>
        </form>

        {isLoading && <div className="mt-8"><LoadingIndicator /></div>}

        {estimate && !isLoading && (
            <div className="mt-10 pt-8 border-t-2 border-gray-200 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Estimate Result</h2>
                    <LeadQualityBadge quality={estimate.leadQuality} />
                </div>
                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6 my-6 text-center">
                    <p className="text-lg text-gray-700 font-medium mb-2">Estimated Value</p>
                    <p className="text-4xl font-extrabold text-gray-800 tracking-tight">
                    {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
                    </p>
                </div>
                <p className="text-gray-600 mb-6 text-left italic">{estimate.reasoning}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div>
                        <h4 className="font-bold text-md text-gray-800 mb-2">Value-Adding Features</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {estimate.valueAddingFeatures?.length > 0 ? estimate.valueAddingFeatures.map((item, i) => <li key={i}>{item}</li>) : <li>None identified.</li>}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold text-md text-gray-800 mb-2">Potential Deductions</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {estimate.potentialDeductions?.length > 0 ? estimate.potentialDeductions.map((item, i) => <li key={i}>{item}</li>) : <li>None identified.</li>}
                        </ul>
                    </div>
                </div>
                 {estimate.comparables && estimate.comparables.length > 0 && (
                    <div className="text-left my-8">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Market Comparables</h3>
                        <div className="space-y-2">
                        {estimate.comparables.map((boat, index) => (
                            <div key={index} className="p-3 bg-gray-50 border rounded-md flex justify-between items-center text-sm">
                                <p>{boat.year} {boat.make} {boat.model}</p>
                                <p className="font-bold">{formatCurrency(boat.price)}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                 <ChatInterface 
                    messages={chatHistory}
                    inputValue={chatInputValue}
                    onInputChange={handleChatInputChange}
                    onSendMessage={handleSendChatMessage}
                    isSending={isChatSending}
                />
            </div>
        )}
      </main>
      <footer className="text-center mt-8 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Legend Boats. All Rights Reserved.</p>
        {estimateLog && (
          <p className="mt-2">
            <button onClick={handleDownloadLog} className="text-blue-600 hover:underline">
                Download Session Log
            </button>
          </p>
        )}
      </footer>
    </div>
  );
};
