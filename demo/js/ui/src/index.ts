import type {
    AgentCard,
    // Task, // Remove unused complex types
    // JSONRPCError,
    // Message,
    // TextPart,
    // TaskStatus,
    // Part,
    // Role,
    // Artifact
} from './types';
import { renderAgentsPage } from './pages/agents'; // Import the new page renderer
import { renderConversationPage } from './pages/conversation'; // Import conversation page
import { sendA2AMessage } from './a2a-client'; // Import the client function

console.log("A2A JS UI Initialized!");

const appDiv = document.getElementById('app');
const contentTitle = document.querySelector('.content h1');
let currentSessionId: string | undefined = undefined; // Variable to store session ID

// --- Basic JSON-RPC Interfaces --- 
interface JsonRpcError {
    code: number;
    message: string;
    data?: any;
}

// Define a basic structure for the expected Result (Task-like)
interface BasicTaskResult {
    id: string;
    sessionId?: string;
    status?: { 
        state?: string;
        message?: { role: string; parts: { type: string; text: string }[] };
    };
    history?: { role: string; parts: { type: string; text: string }[] }[];
    artifacts?: { name?: string; parts: { type: string; text: string }[] }[];
}

interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: BasicTaskResult;
    error?: JsonRpcError;
}
// ---

// Function to add a message to the UI
function appendMessage(text: string, sender: 'user' | 'agent') {
    const messageList = document.querySelector('.message-list');
    if (!messageList) return;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'agent-message');
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageElement.appendChild(paragraph);
    messageList.appendChild(messageElement);

    // Scroll to bottom
    messageList.scrollTop = messageList.scrollHeight;
}

// Function to handle sending a message
async function handleSendMessage() { // Make async
    const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;

    if (chatInput && chatInput.value.trim() !== '') {
        const messageText = chatInput.value.trim();
        appendMessage(messageText, 'user'); // Display user message immediately
        chatInput.value = ''; // Clear the input

        console.log(`Sending message with sessionId: ${currentSessionId}`);

        // Disable input while waiting for response
        chatInput.disabled = true;
        const sendButton = document.getElementById('send-button') as HTMLButtonElement;
        if (sendButton) sendButton.disabled = true;

        // Call the A2A client
        const response = await sendA2AMessage(messageText, currentSessionId);

        // Re-enable input
        chatInput.disabled = false;
        if (sendButton) sendButton.disabled = false;
        chatInput.focus();

        // Now type the response using our simple interface
        if (response && typeof response === 'object') { 
            const typedResponse = response as JsonRpcResponse;
            console.log("DEBUG: Typed Response Data:", JSON.stringify(typedResponse, null, 2));

            // Access result/error using the interface
            const result = typedResponse.result; 
            const error = typedResponse.error;
            // console.log("DEBUG: Extracted Result:", JSON.stringify(result, null, 2));
            // console.log("DEBUG: Extracted Error:", JSON.stringify(error, null, 2));

            if (result) { // Check if result exists
                console.log("DEBUG: Result object exists.");
                
                const agentMessageText = (() => {
                    let text = 'Agent response format not recognized.'; // Default

                    // --- Priority 1: Check status.message.parts --- 
                    try {
                        const messageText = result.status?.message?.parts?.[0]?.text;
                        if (messageText && typeof messageText === 'string') {
                            console.log("DEBUG: Found text in status.message.parts:", messageText);
                            return messageText; // Found it!
                        }
                    } catch (e) { console.error("Error accessing status message parts:", e); }

                    // --- Priority 2: Check history (Fallback) --- 
                    try {
                        const history = result.history; // Access directly
                         if (Array.isArray(history) && history.length > 0) {
                            console.log("DEBUG: Checking history...");
                            const lastAgentMessage = [...history].reverse().find(msg => msg?.role === 'agent');
                             if (lastAgentMessage?.parts?.[0]?.text && typeof lastAgentMessage.parts[0].text === 'string') {
                                console.log("DEBUG: Found text in history:", lastAgentMessage.parts[0].text);
                                return lastAgentMessage.parts[0].text; // Found it!
                             }
                        }
                    } catch (e) { console.error("Error accessing history parts:", e); }

                    // --- Priority 3: Check artifacts (Simple Check) ---
                    try {
                        const artifacts = result.artifacts;
                        if (Array.isArray(artifacts) && artifacts.length > 0) {
                            console.log("DEBUG: Checking artifacts...");
                            const firstArtifactText = artifacts[0]?.parts?.[0]?.text;
                            if (firstArtifactText && typeof firstArtifactText === 'string') {
                                const artifactName = artifacts[0]?.name ?? 'unknown';
                                text = `(From Artifact: ${artifactName}) ${firstArtifactText}`;
                                console.log("DEBUG: Found text in first artifact:", text);
                                return text; // Found in artifact
                            }
                        }
                    } catch (e) { console.error("Error accessing artifact parts:", e); }

                    return text; // Return default or text found in fallbacks
                })(); 

                // Store sessionId (accessed via BasicTaskResult type)
                const sessionId = result.sessionId;
                if (sessionId && !currentSessionId) { // Already checked sessionId is string above
                    currentSessionId = sessionId;
                    console.log(`Stored new sessionId: ${currentSessionId}`);
                }
                
                appendMessage(agentMessageText, 'agent');

            } else if (error) { // Check if error exists
                 const errorMessage = error.message ?? 'Unknown error';
                 const errorCode = error.code ?? 'N/A'; 
                 appendMessage(`Error: ${errorMessage} (Code: ${errorCode})`, 'agent');
            } else {
                 appendMessage('Agent response format not recognized (no result or error).', 'agent');
            }
        } else {
            appendMessage('Failed to get response from agent.', 'agent');
        }
    }
}

// Function to set up event listeners for the current page
function setupEventListeners(hash: string) {
    if (hash === '#conversation') {
        const sendButton = document.getElementById('send-button');
        const chatInput = document.getElementById('chat-input');

        if (sendButton) {
            sendButton.addEventListener('click', handleSendMessage);
        }
        // Optional: Add listener for Enter key in textarea
        if (chatInput) {
            chatInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault(); // Prevent newline
                    handleSendMessage();
                }
            });
        }
    }
    // Add listeners for other pages here if needed (e.g., agent card buttons)
}

function renderContent(hash: string) {
    if (!appDiv || !contentTitle) return;

    let title = "Welcome";
    let content = "<p>Select an option from the sidebar.</p>";

    switch (hash) {
        case '#home':
            title = "Home";
            content = "<p>Welcome to the A2A JS Demo!</p>";
            break;
        case '#agents': {
            title = "Agents";
            content = renderAgentsPage(); // Use the imported function
            break;
        }
        case '#conversation': {
            title = "Conversation";
            content = renderConversationPage(); // Use conversation renderer
            break;
        }
        case '#tasks': {
            title = "Tasks";
            content = "<p>Task list will go here.</p>";
            break;
        }
        case '#events': {
            title = "Events";
            content = "<p>Event list will go here.</p>";
            break;
        }
        case '#settings': {
            title = "Settings";
            content = "<p>Settings page will go here.</p>";
            break;
        }
    }

    contentTitle.textContent = title;
    appDiv.innerHTML = content;

    // Set up event listeners AFTER rendering the content
    setupEventListeners(hash);

    // Reset session ID when navigating away from conversation page?
    // Or maybe reset when navigating TO conversation? Or keep it global?
    // For now, let's reset it if we render a page *other* than conversation
    if (hash !== '#conversation') {
        // console.log("Clearing session ID as navigating away from conversation.");
        // currentSessionId = undefined; // Decide on session management strategy later
    }
}

// Initial render and listener setup
const initialHash = window.location.hash || '#home';
renderContent(initialHash);

// Re-render and setup listeners on hash change
window.addEventListener('hashchange', () => {
    const newHash = window.location.hash;
    renderContent(newHash);
}); 