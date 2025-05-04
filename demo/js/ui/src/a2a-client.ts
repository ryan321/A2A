import type {
    Request,
    Message,
    TextPart,
    TaskSendParams,
    Part,
    // Import nested property types if needed for clarity
    MessageProperties,
    TextPartProperties,
    TaskSendParamsProperties
} from './types';
import {
    CredentialsType,
    AgentAuthenticationType,
    TypeTitle,
    Description,
    MetadataTitle,
    JsonrpcTitle,
    IDTitle, // Import IDTitle
    CancelTaskRequestRequired // Import enum for required fields
} from './types';

// Placeholder for the actual agent URL
const AGENT_ENDPOINT_URL = 'http://localhost:41241'; // Example URL

// --- Helper: Generate a simple unique ID (replace with better method if needed)
let messageCounter = 0;
function generateId(): string {
    return `msg-${Date.now()}-${messageCounter++}`;
}
// ---

/**
 * Sends a message to the A2A agent.
 *
 * @param messageText The text content of the user's message.
 * @param currentSessionId Optional session ID for continuing conversations.
 * @returns Promise resolving to the agent's response or null on error.
 */
export async function sendA2AMessage(
    messageText: string,
    currentSessionId?: string
): Promise<any | null> {

    const taskId = generateId(); // Generate unique ID for this task/request
    const sessionId = currentSessionId; // Use provided session ID or undefined

    // 1. Construct the plain data object for the message part
    const textPartData = {
        type: 'text',
        text: messageText
        // metadata: {} // Optional
    };

    // 2. Construct the plain data object for the message
    const messageData = {
        role: 'user',
        parts: [textPartData],
        // metadata: {} // Optional, removed again
    };

    // 3. Construct the plain data object for the params
    // Define inline type for messageData structure
    const paramsData: { id: string; message: { role: string; parts: { type: string; text: string }[] }; sessionId?: string } = {
        id: taskId,
        message: messageData, 
        ...(sessionId && { sessionId: sessionId })
    };

    // 4. Construct the final plain JSON-RPC request object
    const finalPayload = {
        jsonrpc: '2.0',
        method: 'tasks/send',
        params: paramsData,
        id: taskId // Use taskId also as JSON-RPC request ID
    };

    console.log('Sending A2A Request:', JSON.stringify(finalPayload, null, 2));

    try {
        const response = await fetch(AGENT_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer YOUR_TOKEN' // Add auth if needed
            },
            body: JSON.stringify(finalPayload) // Send the clean payload
        });

        if (!response.ok) {
            // Log more detail on error
            const errorBody = await response.text();
            console.error(`HTTP error! Status: ${response.status} ${response.statusText}`, errorBody);
            return null;
        }

        // Parse JSON without casting to the problematic Response type
        const responseData = await response.json(); 
        console.log('Received A2A Response Data:', responseData);
        return responseData;

    } catch (error) {
        console.error('Error sending A2A message:', error);
        return null;
    }
} 