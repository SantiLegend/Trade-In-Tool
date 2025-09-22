
import React, { useState, useCallback, useEffect } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { Step1BoatInfo } from './components/Step1BoatInfo';
import { Step2Condition } from './components/Step2Condition';
import { Step3Contact } from './components/Step3Contact';
import { Step4Estimate } from './components/Step4Estimate';
import type { BoatFormData, Estimate, ChatMessage } from './types';
import { getTradeInEstimate, postChatMessage } from './services/geminiService';
import { HeaderIcon } from './components/icons/HeaderIcon';
import { logEstimateToCSV, downloadCSV } from './services/loggingService';
import { InternalTool } from './components/InternalTool';

const initialFormData: BoatFormData = {
  boatType: '',
  year: '',
  make: '',
  model: '',
  hin: '',
  engineMake: '',
  horsepower: '',
  engineHours: '0',
  trailer: true,
  cosmeticCondition: '',
  mechanicalCondition: '',
  photos: [],
  fullName: '',
  email: '',
  phone: '',
  postalCode: '',
};

function App() {
  const [isInternal, setIsInternal] = useState<boolean | null>(null);

  useEffect(() => {
    // Forcing customer-facing tool as requested by the user.
    setIsInternal(false);
  }, []);


  // --- STATE AND LOGIC FOR PUBLIC APP ---
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BoatFormData>(initialFormData);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appraisalRequested, setAppraisalRequested] = useState(false);
  const [estimateLog, setEstimateLog] = useState('');

  // Chat state
  const [systemInstruction, setSystemInstruction] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInputValue, setChatInputValue] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);


  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBooleanChange = useCallback((name: string, value: boolean) => {
    setFormData(prev => ({...prev, [name]: value}));
  }, []);

  const handleSaveProgress = useCallback(() => {
    alert("Progress Saved!\n\nIn a real app, you'd get an email with a link to continue right where you left off.");
    console.log("Saving progress for:", formData);
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    const result = await getTradeInEstimate(formData);
    
    if (result) {
        setEstimate(result);
        
        // Only log if the estimate was successful (low > 0)
        if (result.low > 0) {
            setEstimateLog(prevLog => logEstimateToCSV(formData, result, prevLog));

            // Set up the context for the chat proxy
            const instruction = `You are a helpful chat assistant for Legend Boats. The user has just received a trade-in estimate for their boat. Your role is to answer follow-up questions about the estimate. Be concise and helpful.
                    
            Initial Boat Context:
            - Type: ${formData.boatType}, Year: ${formData.year}, Make: ${formData.make}, Model: ${formData.model}
            - Engine: ${formData.horsepower}HP, ${formData.engineHours} hours
            - Condition: ${formData.cosmeticCondition} (Cosmetic), ${formData.mechanicalCondition} (Mechanical)
            - Initial Estimate: $${result.low} - $${result.high} CAD
            
            The user may ask how changes (like engine hours, repairs, or market conditions) would affect this value. Use your general knowledge to provide reasonable adjustments or explanations. Do not provide a new formal estimate range unless explicitly asked.`;
            setSystemInstruction(instruction);
            
            const welcomeMessage: ChatMessage = {
                role: 'model',
                text: `Hello! I can help answer questions about your estimate for the ${formData.year} ${formData.make} ${formData.model}. How can I help?`
            };
            setChatHistory([welcomeMessage]);
        }
    }
    
    setIsLoading(false);
    nextStep();
  }, [formData, nextStep]);

  const handleRequestAppraisal = useCallback(() => {
    setAppraisalRequested(true);
    console.log("Appraisal requested for:", formData.email);
  }, [formData.email]);

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

  const handleDownloadLog = useCallback(() => {
    if (estimateLog) {
      downloadCSV(estimateLog, 'estimate-log.csv');
    } else {
      alert("No estimates have been generated yet in this session.");
    }
  }, [estimateLog]);


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BoatInfo formData={formData} handleChange={handleFormChange} handleBooleanChange={handleBooleanChange} nextStep={nextStep} handleSaveProgress={handleSaveProgress} />;
      case 2:
        return <Step2Condition formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} handleSaveProgress={handleSaveProgress} />;
      case 3:
        return <Step3Contact formData={formData} handleChange={handleFormChange} handleSubmit={handleSubmit} prevStep={prevStep} isLoading={isLoading} />;
      case 4:
        return <Step4Estimate 
          estimate={estimate} 
          appraisalRequested={appraisalRequested} 
          handleRequestAppraisal={handleRequestAppraisal} 
          chatHistory={chatHistory}
          chatInputValue={chatInputValue}
          handleChatInputChange={handleChatInputChange}
          handleSendChatMessage={handleSendChatMessage}
          isChatSending={isChatSending}
          />;
      default:
        return <Step1BoatInfo formData={formData} handleChange={handleFormChange} handleBooleanChange={handleBooleanChange} nextStep={nextStep} handleSaveProgress={handleSaveProgress} />;
    }
  };

  // --- RENDER LOGIC ---

  if (isInternal === null) {
    // Render a blank screen or a loading spinner while we check the URL param
    return <div className="bg-gray-50 min-h-screen"></div>;
  }

  if (isInternal) {
    return <InternalTool />;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-2 sm:p-4">
      <header className="text-center mb-6 sm:mb-8">
        <HeaderIcon className="h-14 w-14 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 px-2">Instant Trade-In Estimator</h1>
      </header>
      
      <main className="w-full max-w-3xl bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-gray-200">
        <div className="mb-8">
          <ProgressBar currentStep={currentStep} />
        </div>
        {renderStep()}
      </main>

      <footer className="text-center mt-8 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Legend Boats. All Rights Reserved.</p>
        <img src="https://www.legendboats.com/wp-content/uploads/2021/02/legend-boats-logo.svg" alt="Legend Boats Logo" className="h-6 sm:h-8 mx-auto mt-4 opacity-70"/>
      </footer>
    </div>
  );
}

export default App;
