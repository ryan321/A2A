export function renderConversationPage(): string {
  return `
    <div class="chat-container">
      <div class="message-list">
        <!-- Messages will be loaded here -->
        <div class="message agent-message">
          <p>Hello! How can I help you today?</p>
        </div>
        <div class="message user-message">
          <p>Placeholder for user message.</p>
        </div>
      </div>
      <div class="chat-input-area">
        <textarea id="chat-input" placeholder="Type your message..."></textarea>
        <button id="send-button">Send</button>
      </div>
    </div>
  `;
} 