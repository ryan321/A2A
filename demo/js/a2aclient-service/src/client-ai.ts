// import { sendA2AMessage } from './a2a-client.js'; // No longer needed
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Basic JSON-RPC Interfaces (Similar to UI's) --- 
interface JsonRpcErrorData {
    code: number;
    message: string;
    data?: unknown;
}

interface BasicTaskResultData {
    id: string;
    sessionId?: string;
    status?: { 
        state?: string;
        message?: { role: string; parts: { type: string; text: string }[] };
    };
    history?: { role: string; parts: { type: string; text: string }[] }[];
    artifacts?: { name?: string; parts: { type: string; text: string }[] }[];
}

interface JsonRpcResponseData {
    jsonrpc: '2.0';
    id: string | number;
    result?: BasicTaskResultData;
    error?: JsonRpcErrorData;
}
// ---

// Helper to generate unique IDs
let responseCounter = 0;
function generateLocalResponseId(): string {
    return `local-${Date.now()}-${responseCounter++}`;
}

// --- Initialize Gemini --- 
// Read API key directly from environment variable
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("ERROR: GEMINI_API_KEY environment variable not set.");
    // Optionally exit or handle appropriately if key is absolutely required to start
    // process.exit(1);
}
// Initialize only if the key exists
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }) : null;
// ---

/**
 * Processes the user's message, handles simple cases locally,
 * or calls the Gemini API for others.
 */
export async function processUserMessage(messageText: string, currentSessionId?: string): Promise<JsonRpcResponseData | null> {
    console.log("DEBUG: [Client AI] Processing message:", messageText);
    const lowerCaseMessage = messageText.toLowerCase().trim();

    // --- Basic Local Handling --- 
    if (lowerCaseMessage === 'hello' || lowerCaseMessage === 'hi') {
        console.log("DEBUG: [Client AI] Handling greeting locally.");
        // Construct a response that mimics the expected structure for the UI
        const localResponse = {
            jsonrpc: '2.0' as const,
            id: generateLocalResponseId(),
            result: {
                id: generateLocalResponseId(), // Mimic task ID
                status: {
                    state: 'completed',
                    message: {
                        role: 'agent',
                        parts: [{ type: 'text', text: 'Hello there! I am your Client Assistant using Gemini.' }]
                    }
                },
                // history: [], // Optionally add history if UI uses it
                // artifacts: [] // No artifacts for local response
            }
        };
        return localResponse;
    }
    
    if (lowerCaseMessage === 'thank you' || lowerCaseMessage === 'thanks') {
        console.log("DEBUG: [Client AI] Handling thanks locally.");
         const localResponse = {
            jsonrpc: '2.0' as const,
            id: generateLocalResponseId(),
            result: {
                id: generateLocalResponseId(),
                status: {
                    state: 'completed',
                    message: {
                        role: 'agent',
                        parts: [{ type: 'text', text: "You're welcome!" }]
                    }
                },
            }
        };
        return localResponse;
    }
    // --- End Basic Local Handling ---

    // --- Call Gemini API --- 
    console.log("DEBUG: [Client AI] Handling request with Gemini API.");
    if (!model) {
        console.error("ERROR: Gemini model not initialized (missing API key?).");
         return {
            jsonrpc: '2.0' as const,
            id: generateLocalResponseId(),
            error: { code: -32000, message: 'Gemini model not initialized (missing API key?)' }
        };
    }

    try {
        const result = await model.generateContent(messageText);
        const response = await result.response;
        const geminiText = response.text();

        console.log("DEBUG: [Client AI] Received response from Gemini:", geminiText);

        // Format Gemini response into the structure UI expects
        const geminiResponse = {
            jsonrpc: '2.0' as const,
            id: generateLocalResponseId(), // Use local ID for the overall response
            result: {
                id: generateLocalResponseId(), // Mimic task ID
                sessionId: currentSessionId, // Pass session ID through if needed later
                status: {
                    state: 'completed',
                    message: {
                        role: 'agent',
                        parts: [{ type: 'text', text: geminiText }]
                    }
                },
                // No history/artifacts from direct Gemini call in this simple format
                history: [], 
                artifacts: [] 
            }
        };
        return geminiResponse;

    } catch (error) {
        console.error("ERROR: [Client AI] Gemini API call failed:", error);
        return { 
            jsonrpc: '2.0' as const,
            id: generateLocalResponseId(),
            error: { code: -32001, message: 'Gemini API call failed', data: error } 
        };
    }
} 