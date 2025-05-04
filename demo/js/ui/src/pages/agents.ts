// import type { AgentCard } from '../types'; // No longer using mock AgentCards
// import { CredentialsType, AgentAuthenticationType } from '../types'; // No longer needed

// Remove mockAgents array
// const mockAgents: AgentCard[] = [ ... ];

// Remove renderAgentCard function
// function renderAgentCard(agent: AgentCard): string { ... }

// Define SimpleAgentCard here or import from shared location
interface SimpleAgentCard {
    name: string;
    description?: string;
    url: string; 
    provider?: { organization?: string; url?: string };
    version?: string;
}

/**
 * Renders the Agents page content, including registration form and agent cards.
 * @param currentAgents - Array of currently registered agent card objects.
 */
export function renderAgentsPage(currentAgents: SimpleAgentCard[]): string {
  // Render full card details directly
  const agentListHtml = currentAgents.map(agent => {
    const name = agent.name;
    const url = agent.url; // This is the base URL
    const description = agent.description ?? '-';
    const version = agent.version ?? 'N/A';
    
    return `
      <li class="registered-agent-item"> 
        <div class="agent-item-details">
          <p><strong>${name}</strong> (v${version})</p>
          <p><small>${description}</small></p>
          <p><code>${url}</code></p>
        </div>
        <button class="remove-agent-btn" data-url="${url}">Remove</button>
      </li>
    `;
  }).join('');

  return `
    <h2>Register A2A Agent Server</h2>
    <div class="register-agent-form">
      <input type="text" id="agent-url-input" placeholder="Enter A2A Agent Server URL" />
      <button id="register-agent-btn">Register</button>
    </div>

    <h2>Registered Agents</h2>
    <div class="agent-list-container">
      ${currentAgents.length > 0 ? 
        `<ul class="registered-agent-list">${agentListHtml}</ul>` : 
        '<p>No agents registered yet.</p>'
      }
    </div>
  `;
} 