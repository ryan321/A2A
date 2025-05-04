// import type { AgentCard } from '../types'; // No longer using mock AgentCards
// import { CredentialsType, AgentAuthenticationType } from '../types'; // No longer needed

// Remove mockAgents array
// const mockAgents: AgentCard[] = [ ... ];

// Remove renderAgentCard function
// function renderAgentCard(agent: AgentCard): string { ... }

/**
 * Renders the Agents page content, including registration form and list.
 * @param currentAgentUrls - Array of currently registered agent URLs.
 */
export function renderAgentsPage(currentAgentUrls: string[]): string {
  const agentListItems = currentAgentUrls.map(url => 
    `<li><code>${url}</code> <button class="remove-agent-btn" data-url="${url}">Remove</button></li>`
  ).join('');

  return `
    <h2>Register A2A Agent Server</h2>
    <div class="register-agent-form">
      <input type="text" id="agent-url-input" placeholder="Enter A2A Agent Server URL" />
      <button id="register-agent-btn">Register</button>
    </div>

    <h2>Registered Agents</h2>
    <div class="agent-list-container">
      ${currentAgentUrls.length > 0 ? 
        `<ul class="registered-agent-list">${agentListItems}</ul>` : 
        '<p>No agents registered yet.</p>'
      }
    </div>
  `;
} 