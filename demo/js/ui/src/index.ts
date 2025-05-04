import type { AgentCard } from './types'; // Use type import

console.log("A2A JS UI Initialized!");

const appDiv = document.getElementById('app');
const contentTitle = document.querySelector('.content h1');

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
            content = "<p>Agent list will go here.</p>";
            // Example usage removed as generated type structure was complex
            break;
        }
        case '#conversation': {
            title = "Conversation";
            content = "<p>Conversation view will go here.</p>";
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
}

// Initial render based on current hash or default to #home
renderContent(window.location.hash || '#home');

// Re-render when the hash changes
window.addEventListener('hashchange', () => {
    renderContent(window.location.hash);
}); 