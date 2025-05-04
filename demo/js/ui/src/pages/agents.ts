import type { AgentCard } from '../types';
import { CredentialsType, AgentAuthenticationType } from '../types'; // Import enums

// Mock data for agents (adjusted for quicktype structure and enums)
const mockAgents: AgentCard[] = [
  {
    properties: {
      name: { type: CredentialsType.String, title: 'Echo Agent' },
      description: { type: CredentialsType.String, title: 'A simple agent that echoes input.' },
      url: { type: CredentialsType.String, title: 'http://example.com/echo' },
      provider: { $ref: '#/defs/AgentProvider' },
      version: { type: CredentialsType.String, title: '1.0' },
      documentationUrl: { type: CredentialsType.String, title: 'http://example.com/echo/docs' },
      // TODO: Fill placeholders with actual mock data matching the schema
      capabilities: { $ref: '#/defs/AgentCapabilities' },
      authentication: { $ref: '#/defs/AgentAuthentication' },
      defaultInputModes: { items: { type: CredentialsType.String }, title: 'DefaultInputModes', type: 'array', default: ['text'] },
      defaultOutputModes: { items: { type: CredentialsType.String }, title: 'DefaultOutputModes', type: 'array', default: ['text'] },
      skills: { items: { $ref: '#/defs/AgentSkill' }, title: 'Skills', type: 'array' }
    },
    required: ['name', 'url', 'version', 'capabilities', 'skills'],
    title: 'AgentCard',
    type: AgentAuthenticationType.Object // Use enum value
  },
  {
    properties: {
      name: { type: CredentialsType.String, title: 'Weather Agent' },
      description: { type: CredentialsType.String, title: 'Provides weather forecasts.' },
      url: { type: CredentialsType.String, title: 'http://example.com/weather' },
      provider: { $ref: '#/defs/AgentProvider' },
      version: { type: CredentialsType.String, title: '1.1' },
      documentationUrl: { type: CredentialsType.String, title: 'http://example.com/weather/docs' },
      // TODO: Fill placeholders with actual mock data matching the schema
      capabilities: { $ref: '#/defs/AgentCapabilities' },
      authentication: { $ref: '#/defs/AgentAuthentication' },
      defaultInputModes: { items: { type: CredentialsType.String }, title: 'DefaultInputModes', type: 'array', default: ['text'] },
      defaultOutputModes: { items: { type: CredentialsType.String }, title: 'DefaultOutputModes', type: 'array', default: ['text'] },
      skills: { items: { $ref: '#/defs/AgentSkill' }, title: 'Skills', type: 'array' }
    },
    required: ['name', 'url', 'version', 'capabilities', 'skills'],
    title: 'AgentCard',
    type: AgentAuthenticationType.Object // Use enum value
  }
];

function renderAgentCard(agent: AgentCard): string {
  // Access properties correctly via agent.properties
  const name = agent.properties.name?.title ?? 'Unnamed Agent';
  const description = agent.properties.description?.title ?? 'No description.';
  const version = agent.properties.version?.title ?? 'N/A';
  const url = agent.properties.url?.title ?? '#';

  return `
    <div class="agent-card">
      <h3>${name} (v${version})</h3>
      <p>${description}</p>
      <p><small>URL: ${url}</small></p>
      <button data-url="${url}">Chat</button> <!-- Basic button -->
    </div>
  `;
}

export function renderAgentsPage(): string {
  const agentListHtml = mockAgents.map(renderAgentCard).join('');
  return `
    <h2>Available Agents</h2>
    <div class="agent-list">
      ${agentListHtml || '<p>No agents available.</p>'}
    </div>
  `;
} 