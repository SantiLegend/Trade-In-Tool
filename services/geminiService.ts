
import type { BoatFormData, Estimate, ChatMessage } from '../types';

async function fileToBase64(file: File): Promise<{mimeType: string, data: string}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve({
                mimeType: file.type,
                data: result.split(',')[1]
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const getTradeInEstimate = async (data: BoatFormData): Promise<Estimate> => {
  try {
    const imageParts = await Promise.all(
        data.photos.map(file => fileToBase64(file))
    );

    const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            formData: data,
            imageParts,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const estimate = await response.json() as Estimate;
    
    if (typeof estimate.low !== 'number' || typeof estimate.high !== 'number') {
        throw new Error("Invalid estimate structure received from the server.");
    }

    return estimate;

  } catch (error) {
    console.error("Error getting trade-in estimate:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

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

export const postChatMessage = async (systemInstruction: string, history: ChatMessage[]): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ systemInstruction, history }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Chat API request failed');
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error in postChatMessage:", error);
        return "Sorry, I encountered a technical issue and can't respond right now.";
    }
};
