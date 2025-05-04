export function renderConversationPage(agentUrl?: string): string {
  console.log(`Rendering conversation page for: ${agentUrl || 'Unknown Agent'}`);
  // TODO: Use agentUrl to load/save specific conversation state
  return `
    <div class="chat-container">
      <div class="message-list">
        <!-- Messages will be loaded here dynamically -->
      </div>
      <div class="chat-input-area">
        <textarea id="chat-input" placeholder="Type your message..."></textarea>
        <button id="send-button">Send</button>
      </div>
    </div>
  `;
} 