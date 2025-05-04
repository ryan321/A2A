import express, { type Request, type Response } from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Needed for fetching agent card
import { processUserMessage } from './client-ai.js'; // Add .js extension
// Import types needed for Agent Card (assuming types.ts exists here)
// Use a simple interface matching actual JSON structure for validation
interface SimpleAgentCard {
    name: string;
    description?: string;
    url: string; 
    provider?: { organization?: string; url?: string };
    version?: string;
}

const app = express();
const port = process.env.A2A_CLIENT_SERVICE_PORT || 8080; // Use env variable or default

// --- In-Memory State --- 
const registeredAgentUrls: string[] = []; // Store URLs here
// ---

// --- Middleware ---
// Enable CORS for requests from the UI origin (adjust origin if needed)
// TODO: Configure allowed origins more strictly for production
app.use(cors(/* { origin: 'http://localhost:xxxx' } */)); 
// Parse JSON request bodies
app.use(express.json());
// ---

// --- Agent Management Routes --- 

// GET /api/agents - List registered agents
app.get('/api/agents', (req: Request, res: Response) => {
    console.log("DEBUG: [/api/agents] GET request");
    res.status(200).json({ agents: registeredAgentUrls });
});

// POST /api/agents - Register a new agent URL
app.post('/api/agents', async (req: Request, res: Response) => {
    console.log("DEBUG: [/api/agents] POST request");
    const { url: baseUrl } = req.body;

    if (!baseUrl || typeof baseUrl !== 'string' || (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://'))) {
        return res.status(400).json({ error: 'Invalid or missing agent base URL' });
    }
    if (registeredAgentUrls.includes(baseUrl)) {
        return res.status(409).json({ error: 'Agent base URL already registered' }); // 409 Conflict
    }

    // Fetch and validate Agent Card from /.well-known/agent.json
    const trimmedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const fetchUrl = `${trimmedBaseUrl}/.well-known/agent.json`;
    console.log(`DEBUG: [/api/agents] Fetching card from ${fetchUrl}`);
    
    try {
        const cardResponse = await fetch(fetchUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
        if (!cardResponse.ok) {
             console.error(`Error fetching agent card from ${fetchUrl}: ${cardResponse.status} ${cardResponse.statusText}`);
             return res.status(404).json({ error: `Failed to fetch agent card from ${fetchUrl}. Status: ${cardResponse.status}. Ensure it's served at /.well-known/agent.json` });
        }
        const agentCardData = await cardResponse.json() as SimpleAgentCard;
        console.log("DEBUG: [/api/agents] Fetched Card Data:", agentCardData);

        // Basic Validation
         if (typeof agentCardData?.name !== 'string' || typeof agentCardData?.url !== 'string') {
             console.error("Fetched data doesn't look like a valid AgentCard");
             return res.status(400).json({ error: 'Invalid AgentCard format received (missing name or url)' });
         }
         const validatedCard: SimpleAgentCard = agentCardData;
         // Store the *base* URL, not the one potentially inside the card
         validatedCard.url = baseUrl; 

        // Return the fetched/validated card for UI confirmation (use 200 OK)
        res.status(200).json({ agentCard: validatedCard }); 

    } catch (error) {
        console.error(`ERROR: [/api/agents] Fetch/Validation failed for ${fetchUrl}:`, error);
        res.status(500).json({ error: 'Failed to fetch or validate agent card' });
    }
});

// PUT /api/agents - Confirms registration of an agent URL
app.put('/api/agents', (req: Request, res: Response) => {
    console.log("DEBUG: [/api/agents] PUT request (confirm registration)");
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing agent URL' });
    }
    if (registeredAgentUrls.includes(url)) {
         console.log(`DEBUG: [/api/agents PUT] URL already registered: ${url}`);
         // Still return success even if already registered, idempotent
         return res.status(200).json({ message: 'Agent already registered' }); 
    }

    // Add to list
    registeredAgentUrls.push(url);
    console.log(`DEBUG: [/api/agents PUT] Confirmed registration: ${url}`);
    res.status(201).json({ message: 'Agent registered successfully' }); // 201 Created
});

// DELETE /api/agents/:url - Remove an agent
app.delete('/api/agents/:agentUrl', (req: Request, res: Response) => {
    // ... existing DELETE logic ...
});

// --- Chat Route --- 
// Restore the async handler function
app.post('/api/chat', async (req: Request, res: Response) => {
    console.log("DEBUG: [/api/chat] Received request");
    try {
        const { messageText, sessionId } = req.body;

        if (!messageText || typeof messageText !== 'string') {
            console.log("DEBUG: [/api/chat] Bad Request - Missing messageText");
            return res.status(400).json({ error: 'Missing or invalid messageText field' });
        }
        if (sessionId !== undefined && typeof sessionId !== 'string') {
             console.log("DEBUG: [/api/chat] Bad Request - Invalid sessionId");
            return res.status(400).json({ error: 'Invalid sessionId field' });
        }

        console.log(`DEBUG: [/api/chat] Processing message: "${messageText}", Session: ${sessionId}`);
        const result = await processUserMessage(messageText, sessionId);

        if (result === null) {
             console.log("DEBUG: [/api/chat] Error processing message in Client AI");
            return res.status(500).json({ error: 'Error processing message' });
        }

        console.log("DEBUG: [/api/chat] Sending response back to UI");
        return res.status(200).json(result);

    } catch (error) {
        console.error("ERROR: [/api/chat] Unhandled exception:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Server Start --- 
app.listen(port, () => {
    console.log(`A2A Client Service listening on port ${port}`);
});
// ---