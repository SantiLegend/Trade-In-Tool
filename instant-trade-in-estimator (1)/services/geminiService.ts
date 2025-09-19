
import type { BoatFormData, Estimate, ChatMessage } from '../types';

// Helper to convert a File to a base64 string for JSON transfer
async function fileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
}

// Interface for the data sent to the backend proxy
interface ImagePart {
    mimeType: string;
    data: string;
}

/**
 * Sends boat data to the secure backend proxy to get a trade-in estimate.
 * The API key and all complex logic now reside on the server.
 */
export const getTradeInEstimate = async (data: BoatFormData): Promise<Estimate> => {
  try {
    // Convert photo files to a JSON-friendly format
    const imageParts: ImagePart[] = await Promise.all(data.photos.map(async (photo) => ({
        mimeType: photo.type,
        data: await fileToBase64(photo),
    })));

    const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: data, imageParts }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'The server failed to generate an estimate.');
    }

    const estimate = await response.json();
    
    // Basic validation of the received estimate structure
     if (
      typeof estimate.low !== 'number' || 
      typeof estimate.high !== 'number' 
    ) {
        throw new Error("Invalid estimate structure received from the server.");
    }

    return estimate as Estimate;

  } catch (error) {
    console.error("Error getting trade-in estimate:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    // Return a default/error estimate object
    return {
        low: 0,
        high: 0,
        reasoning: `We encountered a problem generating your estimate. This can happen if market data is scarce for this type of boat or due to a technical issue. Error: ${errorMessage}`,
        comparables: [],
        valueAddingFeatures: [],
        potentialDeductions: [],
        leadQuality: 'Low'
    };
  }
};

/**
 * Sends the current chat history to the secure backend proxy for a response.
 */
export const postChatMessage = async (systemInstruction: string, history: ChatMessage[]): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemInstruction, history }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'The chat service failed to respond.');
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error in postChatMessage:", error);
        return "Sorry, I encountered a technical issue and can't respond right now.";
    }
};
