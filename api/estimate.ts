
// This file should be placed in the `api` directory of your project.
// It's a serverless function that acts as a secure proxy to the Google Gemini API.
// It assumes a Vercel-like hosting environment.

import { GoogleGenAI, Part } from "@google/genai";
import type { BoatFormData, Estimate } from '../types';
import path from 'path';
import fs from 'fs/promises';

// --- Server-Side Configuration ---
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set on the server");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- Historical Data Handling (Now on Server) ---
interface HistoricalBoat {
  Year: number; Make: string; Model: string; BoatType: string;
  EngineHP: number; TradeInValueCAD: number;
}
let historicalData: HistoricalBoat[] = [];

const parseCurrency = (value: string): number => {
    if (!value) return NaN;
    const cleaned = value.replace(/[$,]/g, '').trim();
    if (cleaned === 'N/A' || cleaned === '') return NaN;
    return parseFloat(cleaned);
};

const parseCsvToHistoricalBoats = (csvText: string, headerMapping: Record<string, string>, defaultBoatType: string = 'Unknown'): HistoricalBoat[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: HistoricalBoat[] = [];
    const yearIdx = headers.indexOf(headerMapping.Year);
    const makeIdx = headers.indexOf(headerMapping.Make);
    const modelIdx = headers.indexOf(headerMapping.Model);
    const boatTypeIdx = headerMapping.BoatType ? headers.indexOf(headerMapping.BoatType) : -1;
    const hpIdx = headers.indexOf(headerMapping.EngineHP);
    const valueIdx = headers.indexOf(headerMapping.TradeInValueCAD);

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
        if (values.length >= headers.length) {
            try {
                const year = parseInt(values[yearIdx], 10);
                const value = parseCurrency(values[valueIdx]);
                const hp = parseInt(values[hpIdx], 10);
                if (!isNaN(year) && !isNaN(value)) {
                    data.push({
                        Year: year, Make: values[makeIdx] || 'N/A', Model: values[modelIdx] || 'N/A',
                        BoatType: boatTypeIdx !== -1 ? (values[boatTypeIdx] || defaultBoatType) : defaultBoatType,
                        EngineHP: isNaN(hp) ? 0 : hp, TradeInValueCAD: value
                    });
                }
            } catch (e) { /* ignore malformed rows */ }
        }
    }
    return data;
}

async function loadHistoricalData() {
  if (historicalData.length > 0) return;
  try {
    const filesToLoad = [
        { name: 'trade-in-data.csv', mapping: { Year: 'Year', Make: 'Make', Model: 'Model', BoatType: 'BoatType', EngineHP: 'EngineHP', TradeInValueCAD: 'TradeInValueCAD' }, defaultBoatType: 'Fishing' },
        { name: 'more-trade-in-data.csv', mapping: { Year: 'Boat Year', Make: 'Make', Model: 'Model', EngineHP: 'Engine HP', TradeInValueCAD: 'Trade in Value' }, defaultBoatType: 'Unknown' }
    ];
    let combinedData: HistoricalBoat[] = [];
    for (const file of filesToLoad) {
        try {
            // In Vercel, `process.cwd()` points to the project root.
            const filePath = path.join(process.cwd(), 'public', file.name);
            const csvText = await fs.readFile(filePath, 'utf-8');
            const parsed = parseCsvToHistoricalBoats(csvText, file.mapping, file.defaultBoatType);
            combinedData = combinedData.concat(parsed);
        } catch (error) {
            console.error(`Could not load or parse ${file.name}`, error);
        }
    }
    historicalData = combinedData.filter(d => !isNaN(d.Year) && !isNaN(d.TradeInValueCAD) && d.Make && d.Model);
  } catch (error) {
    console.error("Failed to load historical trade-in data:", error);
    historicalData = [];
  }
}

function getSimilarHistoricalBoats(data: BoatFormData, count = 5): HistoricalBoat[] {
    if (!historicalData.length) return [];
    const currentBoatYear = parseInt(data.year, 10);
    const currentBoatHP = parseInt(data.horsepower, 10);
    return historicalData.map(h => {
            let score = 0;
            if (h.BoatType.toLowerCase() === data.boatType.toLowerCase()) score += 4;
            if (h.Make.toLowerCase() === data.make.toLowerCase()) score += 2;
            if (Math.abs(h.Year - currentBoatYear) <= 2) score += 3;
            else if (Math.abs(h.Year - currentBoatYear) <= 5) score += 1;
            if (!isNaN(currentBoatHP) && !isNaN(h.EngineHP) && Math.abs(h.EngineHP - currentBoatHP) <= 25) score += 2;
            return { ...h, score };
        }).sort((a, b) => b.score - a.score).slice(0, count);
}

const generatePrompt = (data: BoatFormData): string => {
  const similarTrades = getSimilarHistoricalBoats(data);
  let historicalContext = "No similar historical trades found in our database.";
  if (similarTrades.length > 0) {
    historicalContext = `Here are some similar, real-world trade-ins this dealership has made recently. Use these as a primary grounding for your estimate:\n${similarTrades.map(t => `- ${t.Year} ${t.Make} ${t.Model} (${t.EngineHP}HP): Valued at $${t.TradeInValueCAD} CAD`).join('\n')}`;
  }

  return `
Analyze the following used boat details to provide a realistic 'ballpark' trade-in value range for a Legend Boats dealership in Canada. The final output must be a single JSON object, enclosed in a markdown code fence (\`\`\`json ... \`\`\`).

**User Provided Boat Details:**
- **Boat Type:** ${data.boatType}
- **Year:** ${data.year}
- **Make:** ${data.make}
- **Model:** ${data.model}
- **Engine Horsepower:** ${data.horsepower} HP
- **Engine Hours:** ${data.engineHours} hours
- **Includes Trailer:** ${data.trailer ? 'Yes' : 'No'}
- **Cosmetic Condition:** ${data.cosmeticCondition}
- **Mechanical Condition:** ${data.mechanicalCondition}
${data.hin ? `- **HIN:** ${data.hin}` : ''}
${data.engineMake ? `- **Engine Make:** ${data.engineMake}` : ''}

**Dealership's Historical Data (Primary Grounding):**
${historicalContext}

**Instructions:**
1.  **Estimate Value:** Provide a 'low' and 'high' integer value in Canadian Dollars (CAD). This range should reflect what a dealer would realistically offer, not the private sale price.
2.  **Reasoning:** Write a brief, customer-facing paragraph explaining the rationale behind your estimate. Mention the key factors you considered (e.g., market demand, age, hours, condition).
3.  **Market Comparables:** Use Google Search to find 2-3 current, publicly listed comparable boats for sale in Canada. Provide the make, model, year, price, and the source URL for each.
4.  **Value Factors:**
    - List 2-4 positive attributes as 'valueAddingFeatures' (e.g., "Low engine hours for its age," "Popular and sought-after model").
    - List 2-4 potential issues as 'potentialDeductions' (e.g., "Cosmetic condition implies some reconditioning costs," "High engine hours may require more thorough inspection").
5.  **Lead Quality:** Assess the sales lead quality as 'High', 'Medium', or 'Low'. A 'High' quality lead would be a popular, late-model boat in good condition.

**JSON Output Format:**
\`\`\`json
{
  "low": 0,
  "high": 0,
  "reasoning": "",
  "comparables": [
    { "make": "", "model": "", "year": 0, "price": 0, "source": "" }
  ],
  "valueAddingFeatures": [""],
  "potentialDeductions": [""],
  "leadQuality": "Medium"
}
\`\`\`
`;
};

const systemInstructionForEstimate = `You are a marine vehicle appraisal expert for Legend Boats, a Canadian boat dealership. Your primary goal is to provide an accurate, data-driven trade-in estimate to a customer. You must be professional, transparent, and manage expectations. Always ground your estimate in the provided historical data and current market comparables found via Google Search. Your final response must strictly be the JSON object as requested. Do not add any conversational text outside of the JSON structure.`;


// --- API Handler ---
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Using a promise to ensure data is loaded once per instance, not per request.
    await loadHistoricalData(); 

    const { formData, imageParts } = req.body as { formData: BoatFormData; imageParts: { mimeType: string; data: string }[] };
    if (!formData) {
        return res.status(400).json({ error: "Missing formData in request body" });
    }

    const promptText = generatePrompt(formData);
    const promptParts: Part[] = [{ text: promptText }];
    if (imageParts && imageParts.length > 0) {
        promptParts.push(...imageParts.map(p => ({ inlineData: p })));
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: promptParts }],
      config: {
        tools: [{googleSearch: {}}],
        systemInstruction: systemInstructionForEstimate,
        temperature: 0.1,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("The AI model returned an empty response.");
    }

    const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    let jsonStr = responseText.trim();
    const match = jsonStr.match(fenceRegex);

    if (match && match[1]) {
        jsonStr = match[1].trim();
    } else {
        const startIndex = jsonStr.indexOf('{');
        const endIndex = jsonStr.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonStr = jsonStr.substring(startIndex, endIndex + 1);
        }
    }
    
    const parsedData = JSON.parse(jsonStr) as Estimate;
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Error in /api/estimate:", error);
    const message = error instanceof Error ? error.message : "An unknown server error occurred.";
    return res.status(500).json({ error: message, details: error });
  }
}
