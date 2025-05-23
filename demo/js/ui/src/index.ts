import type {
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

console.log("A2A JS UI Initialized!");

const appDiv = document.getElementById('app');
const contentTitle = document.querySelector('.content h1');
let currentSessionId: string | undefined = undefined; // Variable to store session ID

// --- Basic JSON-RPC Interfaces --- 
interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
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

// Define the URL for the A2A Client Service
const CLIENT_AI_SERVICE_URL = 'http://localhost:8080/api/chat';
const AGENT_API_URL = 'http://localhost:8080/api/agents'; // URL for agent management

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

// --- Event Handlers --- 
async function handleCopyArtifact(event: Event) {
    const button = event.target as HTMLButtonElement;
    const textToCopy = button.dataset.clipboardText;
    if (!textToCopy) {
        console.error('No text found to copy for artifact.');
        return;
    }
    try {
        await navigator.clipboard.writeText(textToCopy);
        button.textContent = 'Copied!';
        setTimeout(() => { button.textContent = 'Copy'; }, 1500); // Reset button text
    } catch (err) {
        console.error('Failed to copy artifact text: ', err);
        button.textContent = 'Error';
         setTimeout(() => { button.textContent = 'Copy'; }, 1500); 
    }
}

function handleDownloadArtifact(event: Event) {
    const button = event.target as HTMLButtonElement;
    const filename = button.dataset.filename;
    const artifactBlock = button.closest('.artifact-block');
    const codeElement = artifactBlock?.querySelector('code');
    const textToDownload = codeElement?.textContent;

    if (!filename || !textToDownload) {
        console.error('Could not find filename or text for artifact download.');
        return;
    }

    try {
        const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to download artifact: ', err);
    }
}

/** Closes the agent registration modal */
function closeAgentCardModal() {
    const modal = document.getElementById('agent-register-modal');
    if (modal) {
        modal.remove();
    }
    agentCardToRegister = null; // Clear stored card
}

/** Handles clicking Register in the modal - Calls backend to confirm */
async function confirmAgentRegistration() { // Make async
    if (!agentCardToRegister?.url) {
        console.error("No agent card data available to confirm registration.");
        closeAgentCardModal();
        return;
    }
    const urlToRegister = agentCardToRegister.url; 
    console.log(`DEBUG: [UI] Confirming registration for: ${urlToRegister}`);

    // Disable button? (optional, maybe show loading)
    const confirmBtn = document.getElementById('modal-confirm-register-btn') as HTMLButtonElement;
    if (confirmBtn) confirmBtn.disabled = true;

    try {
        const response = await fetch(AGENT_API_URL, {
            method: 'PUT', // Use PUT to confirm/add
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: urlToRegister })
        });

        if (!response.ok) {
            let errorMsg = `Status ${response.status}`;
             try { 
                 const errorData = await response.json();
                 errorMsg = errorData.error || errorMsg;
             } catch(e) { /* Ignore parsing error */ }
            console.error(`Error confirming registration: ${response.status}`, errorMsg);
            alert(`Failed to confirm registration: ${errorMsg}`);
            // Keep modal open on error?
            if (confirmBtn) confirmBtn.disabled = false; 
        } else {
            console.log("DEBUG: [UI] Registration confirmed via backend.");
            closeAgentCardModal();
            renderContent('#agents'); // Refresh the list on success
        }

    } catch(error) {
        console.error("ERROR: [UI] Failed to fetch during registration confirmation:", error);
        alert('Network error trying to confirm registration.');
        if (confirmBtn) confirmBtn.disabled = false; 
    }
}

/** Renders and shows the agent card confirmation modal */
function showAgentCardModal(agentCard: SimpleAgentCard) { 
    // Close any existing modal first
    closeAgentCardModal();
    agentCardToRegister = agentCard; // Store for potential use (though registration is done)

    const name = agentCard.name;
    const description = agentCard.description ?? '-';
    const version = agentCard.version ?? 'N/A';
    const url = agentCard.url; 

    const modalHtml = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <h2>Agent Details Fetched</h2> 
            <div class="agent-card-details">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Version:</strong> ${version}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>Registered URL:</strong> <code>${url}</code></p>
            </div>
            <div class="modal-buttons">
                <button id="modal-cancel-btn">Cancel</button>
                <button id="modal-confirm-register-btn">Register</button>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.id = 'agent-register-modal';
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Add listeners 
    document.getElementById('modal-cancel-btn')?.addEventListener('click', closeAgentCardModal);
    // Add listener for confirm button
    document.getElementById('modal-confirm-register-btn')?.addEventListener('click', confirmAgentRegistration); 
    modalContainer.querySelector('.modal-overlay')?.addEventListener('click', closeAgentCardModal);
}

/** Handles the initial click on the register button */
async function handleRegisterAgent() {
    const input = document.getElementById('agent-url-input') as HTMLInputElement;
    const registerBtn = document.getElementById('register-agent-btn') as HTMLButtonElement;
    if (!input || !input.value.trim()) return;
    const baseUrl = input.value.trim();

    // Basic validation
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        alert('Invalid URL format. Please include http:// or https://');
        return;
    }

    // Disable button/input
    if(registerBtn) registerBtn.disabled = true;
    input.disabled = true;
    console.log(`DEBUG: [UI] Attempting to register agent via backend: ${baseUrl}`);

    try {
        const response = await fetch(AGENT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: baseUrl })
        });

        const responseData = await response.json(); 

        if (!response.ok) {
            console.error(`Error registering agent: ${response.status}`, responseData);
            alert(`Failed to register agent: ${responseData.error || response.statusText}`);
        } else {
            console.log("DEBUG: [UI] Agent registered successfully via backend. Showing modal.");
            // Show modal with the returned card details
            if (responseData.agentCard) {
                 showAgentCardModal(responseData.agentCard as SimpleAgentCard);
            } else {
                console.error("Backend success response missing agentCard data.");
                // Refresh list even if modal can't show
                renderContent('#agents'); 
            }
        }
    } catch (error) {
        console.error("ERROR: [UI] Failed to fetch during agent registration:", error);
        alert('Network error trying to register agent.');
    }
    
    // Re-enable button/input and clear
    if(registerBtn) registerBtn.disabled = false;
    input.disabled = false;
    input.value = ''; 
}

/** Handles removing an agent */
async function handleRemoveAgent(event: Event) {
    const button = event.target as HTMLButtonElement;
    const urlToRemove = button.dataset.url;
    if (!urlToRemove) return;

    console.log(`DEBUG: [UI] Attempting to remove agent via backend: ${urlToRemove}`);
    // Disable button temporarily
    button.disabled = true;

    try {
        // Encode the URL for the path parameter
        const response = await fetch(`${AGENT_API_URL}/${encodeURIComponent(urlToRemove)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            // Try to parse error even if status is not ok
            let errorMsg = `Status ${response.status}`; 
            try { 
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch(e) { /* Ignore parsing error */ }
            console.error(`Error removing agent: ${response.status}`, errorMsg);
            alert(`Failed to remove agent: ${errorMsg}`);
             button.disabled = false; // Re-enable on error
        } else {
            console.log("DEBUG: [UI] Agent removed successfully via backend.");
            // Refresh the agent list
            renderContent('#agents');
        }
    } catch (error) {
        console.error("ERROR: [UI] Failed to fetch during agent removal:", error);
        alert('Network error trying to remove agent.');
         button.disabled = false; // Re-enable on error
    }
}

// Function to handle sending a message
async function handleSendMessage() {
    const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;
    const messageList = document.querySelector('.message-list'); // Get message list

    if (chatInput && chatInput.value.trim() !== '' && messageList) {
        const messageText = chatInput.value.trim();
        appendMessage(messageText, 'user'); 
        chatInput.value = ''; 

        // --- Add Minimal Loading Indicator --- 
        const loadingElement = document.createElement('div');
        // Remove message/agent-message classes, add specific loader class
        loadingElement.classList.add('loading-indicator'); 
        loadingElement.id = 'loading-indicator'; // Keep ID for removal
        // Add the paragraph with dots inside
        const loadingParagraph = document.createElement('p');
        loadingParagraph.innerHTML = '&nbsp;'; // Keep content for pseudo-element
        loadingElement.appendChild(loadingParagraph);
        messageList.appendChild(loadingElement);
        messageList.scrollTop = messageList.scrollHeight; 
        // ---

        console.log(`DEBUG: [UI] Sending message to Client AI Service. Session: ${currentSessionId}`);

        // Disable input ...
        chatInput.disabled = true;
        const sendButton = document.getElementById('send-button') as HTMLButtonElement;
        if (sendButton) sendButton.disabled = true;

        let responseData: JsonRpcResponse | null = null;
        let errorOccurred = false;
        let errorMessage = 'Failed to get response from Client AI service.'; // Default error

        try {
            const serviceResponse = await fetch(CLIENT_AI_SERVICE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messageText, sessionId: currentSessionId })
            });

            if (!serviceResponse.ok) {
                console.error(`Error from Client AI Service: ${serviceResponse.status} ${serviceResponse.statusText}`);
                const errorBody = await serviceResponse.text();
                console.error("Service Error Body:", errorBody);
                appendMessage(`Error: Service returned status ${serviceResponse.status}`, 'agent');
                errorMessage = `Error: Service returned status ${serviceResponse.status}`;
                errorOccurred = true;
            } else {
                 responseData = await serviceResponse.json() as JsonRpcResponse;
                 console.log("DEBUG: [UI] Received response from Client AI Service:", responseData);
            }
        } catch (error) {
             console.error("ERROR: [UI] Failed to fetch from Client AI Service:", error);
             errorMessage = "Error: Could not connect to Client AI service.";
             errorOccurred = true;
        } finally {
            // Remove Loading Indicator by ID
            const loader = document.getElementById('loading-indicator');
            if(loader) loader.remove();

            // Re-enable input 
            chatInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
            chatInput.focus();
        }

        // Process response or show error message AFTER loader is removed
        if (!errorOccurred && responseData) { 
            const result = responseData.result; 
            const error = responseData.error;
            if (result) {
                console.log("DEBUG: Result object exists.");
                
                // Revert back to using let here
                let agentMessageText = 'Agent response format not recognized.'; 

                // --- Priority 1: Check status.message.parts --- 
                try {
                    const messageText = result.status?.message?.parts?.[0]?.text;
                    if (messageText && typeof messageText === 'string') {
                        console.log("DEBUG: Found text in status.message.parts:", messageText);
                        agentMessageText = messageText; // Assign if found
                    }
                } catch (e) { console.error("Error accessing status message parts:", e); }

                // Only check history if not found in status
                if (agentMessageText === 'Agent response format not recognized.') {
                    // --- Priority 2: Check history (Fallback) --- 
                    try {
                        const history = result.history;
                         if (Array.isArray(history) && history.length > 0) {
                            console.log("DEBUG: Checking history...");
                            const lastAgentMessage = [...history].reverse().find(msg => msg?.role === 'agent');
                             if (lastAgentMessage?.parts?.[0]?.text && typeof lastAgentMessage.parts[0].text === 'string') {
                                console.log("DEBUG: Found text in history:", lastAgentMessage.parts[0].text);
                                agentMessageText = lastAgentMessage.parts[0].text; // Assign if found
                             }
                        }
                    } catch (e) { console.error("Error accessing history parts:", e); }
                }
                
                // Only check artifacts if not found previously
                 if (agentMessageText === 'Agent response format not recognized.') {
                     // --- Priority 3: Check artifacts (Simple Check) ---
                     try {
                         const artifacts = result.artifacts;
                         if (Array.isArray(artifacts) && artifacts.length > 0) {
                            console.log("DEBUG: Checking artifacts...");
                            const firstArtifactText = artifacts[0]?.parts?.[0]?.text;
                            if (firstArtifactText && typeof firstArtifactText === 'string') {
                                const artifactName = artifacts[0]?.name ?? 'unknown';
                                agentMessageText = `(From Artifact: ${artifactName}) ${firstArtifactText}`; // Assign if found
                            }
                        }
                    } catch (e) { console.error("Error accessing artifact parts:", e); }
                }
                
                // Store sessionId (accessed via BasicTaskResult type)
                const sessionId = result.sessionId;
                if (sessionId && !currentSessionId) { // Already checked sessionId is string above
                    currentSessionId = sessionId;
                    console.log(`Stored new sessionId: ${currentSessionId}`);
                }
                
                appendMessage(agentMessageText, 'agent'); // Append the final determined text

                // --- Process and Display Artifacts --- 
                try {
                    const artifacts = result.artifacts;
                    if (Array.isArray(artifacts)) {
                        console.log(`DEBUG: Found ${artifacts.length} artifact(s).`);
                        for (const artifact of artifacts) {
                            const artifactName = artifact?.name ?? 'Unnamed Artifact';
                            const firstPart = artifact?.parts?.[0];
                            // Check if the first part is a text part and has content
                            if (firstPart?.type === 'text' && firstPart?.text) {
                                console.log(`DEBUG: Displaying artifact: ${artifactName}`);
                                const artifactText = firstPart.text;

                                const artifactElement = document.createElement('div');
                                artifactElement.classList.add('message', 'agent-message', 'artifact-block');
                                
                                const headerElement = document.createElement('div');
                                headerElement.classList.add('artifact-header');

                                const nameElement = document.createElement('strong');
                                nameElement.textContent = `Artifact: ${artifactName}`;

                                const buttonGroup = document.createElement('div');
                                buttonGroup.classList.add('artifact-buttons');

                                const copyButton = document.createElement('button');
                                copyButton.textContent = 'Copy';
                                copyButton.classList.add('artifact-copy-btn');
                                copyButton.dataset.clipboardText = artifactText; // Store text for clipboard

                                const downloadButton = document.createElement('button');
                                downloadButton.textContent = 'Download';
                                downloadButton.classList.add('artifact-download-btn');
                                downloadButton.dataset.filename = artifactName; // Store filename for download
                                // We will need the text again for download, could store it here too, or retrieve from pre/code

                                buttonGroup.appendChild(copyButton);
                                buttonGroup.appendChild(downloadButton);
                                headerElement.appendChild(nameElement);
                                headerElement.appendChild(buttonGroup);
                                
                                const preElement = document.createElement('pre');
                                const codeElement = document.createElement('code');
                                const lang = artifactName.split('.').pop();
                                if (lang) codeElement.classList.add(`language-${lang}`);
                                codeElement.textContent = artifactText;
                                
                                preElement.appendChild(codeElement);
                                artifactElement.appendChild(headerElement); // Add header
                                artifactElement.appendChild(preElement);
                                
                                const messageList = document.querySelector('.message-list');
                                if (messageList) {
                                    messageList.appendChild(artifactElement);
                                    messageList.scrollTop = messageList.scrollHeight;
                                }
                            } else {
                                console.log(`DEBUG: Skipping artifact ${artifactName} - no text part found.`);
                            }
                        }
                    }
                } catch (e) { console.error("Error processing artifacts:", e); }
                // ---

            } else if (error) { // Check if error exists
                 const errorMessage = error.message ?? 'Unknown error';
                 const errorCode = error.code ?? 'N/A'; 
                 appendMessage(`Error: ${errorMessage} (Code: ${errorCode})`, 'agent');
            } else {
                 appendMessage('Received unexpected response format from service.', 'agent');
            }
        } else if (errorOccurred) {
            appendMessage(errorMessage, 'agent');
        }
    }
}

// Function to set up event listeners for the current page
function setupEventListeners(hash: string) {
    console.log(`DEBUG: Setting up listeners for hash: ${hash}`);
    const messageList = document.querySelector('.message-list');

    // Check for the exact #conversation route OR routes starting with #conversation/
    // (We might eventually want separate logic, but for now combine them)
    if (hash === '#conversation' || hash.startsWith('#conversation/')) {
        console.log("DEBUG: CONVERSATION listener setup block entered (for #conversation or #conversation/...)." );
        const sendButton = document.getElementById('send-button');
        const chatInput = document.getElementById('chat-input');
        console.log(`DEBUG: Found send button? ${!!sendButton}`); 
        console.log(`DEBUG: Found chat input? ${!!chatInput}`); 

        if (sendButton) {
            console.log("DEBUG: Adding click listener to send button.");
            sendButton.addEventListener('click', (event) => {
                console.log("DEBUG: Send button clicked! Event:", event);
                handleSendMessage();
            });
        }
        if (chatInput) {
            console.log("DEBUG: Adding keypress listener to chat input.");
            chatInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    console.log("DEBUG: Enter key pressed in chat input!");
                    event.preventDefault(); 
                    handleSendMessage();
                }
            });
        }
        if (messageList) {
             console.log("DEBUG: Adding delegated click listener to message list for artifacts.");
            messageList.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                if (target.classList.contains('artifact-copy-btn')) {
                    handleCopyArtifact(event);
                }
                if (target.classList.contains('artifact-download-btn')) {
                    handleDownloadArtifact(event);
                }
            });
        }
    } else if (hash === '#agents') {
        console.log("DEBUG: Setting up AGENTS listeners");
        const registerBtn = document.getElementById('register-agent-btn');
        const agentListContainer = document.querySelector('.agent-list-container');

        if (registerBtn) {
            registerBtn.addEventListener('click', handleRegisterAgent);
        }
        if (agentListContainer) {
            // Listener for remove buttons (delegated)
            agentListContainer.addEventListener('click', (event) => {
                if ((event.target as HTMLElement).classList.contains('remove-agent-btn')) {
                    handleRemoveAgent(event);
                }
            });
        }
    } else {
        console.log(`DEBUG: No specific listeners for route: ${hash}`);
        // Listeners for other pages
    }
}

async function renderContent(hash: string) { // Make async for fetching agents
    console.log(`DEBUG: Rendering content for hash: ${hash}`);
    if (!appDiv || !contentTitle) return;

    let title = "Welcome";
    let content = "<p>Loading...</p>"; // Show loading state initially
    appDiv.innerHTML = content; // Render loading state immediately

    // --- Routing Logic --- 
    switch (hash) {
        case '#home':
        case '': 
            title = "Home";
            content = "<p>Welcome to the A2A JS Demo!</p>";
            break;
        case '#agents': { 
            title = "Agents";
            try {
                console.log("DEBUG: [UI] Fetching agent URL list from backend...");
                const listResponse = await fetch(AGENT_API_URL);
                if (!listResponse.ok) {
                     throw new Error(`Failed to fetch agent URLs: ${listResponse.status}`);
                }
                const listData = await listResponse.json();
                const agentUrls: string[] = listData.agents || [];
                console.log("DEBUG: [UI] Received agent URL list:", agentUrls);

                // Fetch all agent cards concurrently
                console.log("DEBUG: [UI] Fetching all agent card details...");
                const agentCardPromises = agentUrls.map(url => fetchAgentCard(url));
                const agentCardsResults = await Promise.all(agentCardPromises);
                
                // Filter out failed fetches (null results) and type the parameter
                const validAgentCards = agentCardsResults.filter(
                    (card: SimpleAgentCard | null): card is SimpleAgentCard => card !== null
                );
                console.log(`DEBUG: [UI] Successfully fetched ${validAgentCards.length} agent cards.`);

                // Render page with the array of fetched card objects
                content = renderAgentsPage(validAgentCards); 
            } catch (error) {
                console.error("ERROR: [UI] Failed to fetch or process agent list/cards:", error);
                content = "<p>Error loading agent list or details. Is the A2A Client Service running?</p>";
            }
            break;
        } 
        case '#conversation': {
            title = "Conversation"; // Simple title
            content = renderConversationPage(); // No URL needed
            // TODO: Load conversation history for the main thread
            break;
        }
        case '#tasks':
            title = "Tasks";
            content = "<p>Task list will go here.</p>";
            break;
        case '#events':
            title = "Events";
            content = "<p>Event list will go here.</p>";
            break;
        case '#settings':
            title = "Settings";
            content = "<p>Settings page will go here.</p>";
            break;
        default:
            // Handle hashes that might still contain agent URLs from old links (redirect)
            if (hash.startsWith('#conversation/')) {
                console.warn(`Old conversation link detected (${hash}), redirecting to #conversation.`);
                window.location.hash = '#conversation';
                return; // Prevent rendering Not Found
            }
            title = "Not Found";
            content = `<p>Page not found for hash: ${hash}</p>`;
    }
    // ---

    console.log(`DEBUG: Setting title to: ${title}`);
    contentTitle.textContent = title;
    // Update content only after potential fetch
    console.log("DEBUG: Setting final innerHTML...");
    appDiv.innerHTML = content;
    console.log("DEBUG: innerHTML set. Calling setupEventListeners...");

    setupEventListeners(hash);
}

// Initial render and listener setup
const initialHash = window.location.hash || '#home';
renderContent(initialHash);

// Re-render and setup listeners on hash change
window.addEventListener('hashchange', () => {
    // Ensure hash always starts with # for consistency
    const newHash = window.location.hash.startsWith('#') ? window.location.hash : `#${window.location.hash}`; // Use template literal
    renderContent(newHash || '#home'); 
}); 

// --- Simple Agent Card Interface (Matches actual JSON) --- 
interface SimpleAgentCard {
    name: string;
    description?: string;
    url: string; 
    provider?: { organization?: string; url?: string };
    version?: string;
}
// ---

// Restore state for modal
let agentCardToRegister: SimpleAgentCard | null = null; 

// --- Constants --- 

// Restore fetchAgentCard function
/** Fetches the AgentCard from a given base URL */
async function fetchAgentCard(baseUrl: string): Promise<SimpleAgentCard | null> {
    console.log(`DEBUG: [UI] Fetching AgentCard for base URL: ${baseUrl}`);
    const trimmedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const fetchUrl = `${trimmedBaseUrl}/.well-known/agent.json`;
    console.log(`DEBUG: [UI] Attempting fetch from well-known URL: ${fetchUrl}`);
    try {
        const response = await fetch(fetchUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
            console.error(`Error fetching agent card from ${fetchUrl}: ${response.status} ${response.statusText}`);
            return null; // Return null on fetch error
        }
        const agentCardData = await response.json() as any;
        if (typeof agentCardData?.name !== 'string' || typeof agentCardData?.url !== 'string') {
             console.error(`Fetched data from ${fetchUrl} is not a valid SimpleAgentCard`);
             return null; // Return null on validation error
        }
        const simpleAgentCard: SimpleAgentCard = agentCardData;
        simpleAgentCard.url = baseUrl; // Ensure URL is the base URL
        return simpleAgentCard; 
    } catch (error) {
        console.error(`Error during agent card fetch from ${fetchUrl}:`, error);
        return null;
    }
}

// --- Constants --- 