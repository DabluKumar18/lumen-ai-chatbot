/*
 * Lumen AI frontend seam:
 * Set endpoint to a Flask/Ollama POST route when a backend is available.
 * The UI intentionally falls back to a local demo response when it is empty.
 */
const API_CONFIG = {
  endpoint: '/api/chat',
  model: 'llama3.2',
};

const icons = {
  menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  collapse: '<svg class="collapse-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M15 5 8 12l7 7"/><path d="M19 5v14"/></svg>',
  moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.5 14.8A8.5 8.5 0 0 1 9.2 3.5 8.5 8.5 0 1 0 20.5 14.8Z"/></svg>',
  sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1-1.7 2.9-.2-.1a2 2 0 0 0-2 .1l-.2.1a2 2 0 0 0-1 1.7v.2h-3.4v-.2a2 2 0 0 0-1-1.7l-.2-.1a2 2 0 0 0-2-.1l-.2.1L6 15.1l.1-.1a2 2 0 0 0 .1-2v-.2a2 2 0 0 0-1.7-1H4.3V8.4h.2a2 2 0 0 0 1.7-1v-.2a2 2 0 0 0-.1-2L6 5.1l1.7-2.9.2.1a2 2 0 0 0 2-.1l.2-.1A2 2 0 0 0 11.1.5V.3h3.4v.2a2 2 0 0 0 1 1.7l.2.1a2 2 0 0 0 2 .1l.2-.1 1.7 2.9-.1.1a2 2 0 0 0-.1 2v.2a2 2 0 0 0 1.7 1h.2v3.4h-.2a2 2 0 0 0-1.7 1v.2a2 2 0 0 0 0 2Z"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>',
  close: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 4 16 8-16 8 3-8-3-8Z"/><path d="M7 12h13"/></svg>',
  copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  refresh: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 11a8 8 0 0 0-14.7-4L4 9"/><path d="M4 4v5h5M4 13a8 8 0 0 0 14.7 4L20 15"/><path d="M20 20v-5h-5"/></svg>',
  like: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10v10H4V10h3ZM7 20h9.2a2 2 0 0 0 1.9-1.4l2-6A2 2 0 0 0 18.2 10H14l.6-3.2A2.4 2.4 0 0 0 12.3 4L7 10"/></svg>',
  dislike: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 14V4H4v10h3ZM7 4h9.2a2 2 0 0 1 1.9 1.4l2 6a2 2 0 0 1-1.9 2.6H14l.6 3.2a2.4 2.4 0 0 1-2.3 2.8L7 14"/></svg>',
};

const conversations = [];

const seededMessages = {};

const state = {
  activeId: null,
  query: '',
  collapsed: false,
  mobileOpen: false,
  profileOpen: false,
  settingsOpen: false,
  dark: localStorage.getItem('lumen-theme') === 'dark',
  messages: [],
};

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar" id="sidebar" aria-label="Conversation sidebar">
      <div class="brand-row">
        <a class="brand" href="#" aria-label="Lumen AI home" data-testid="link-lumen-home">
          <span class="brand-mark" aria-hidden="true"><span></span></span>
          <span class="brand-name">Lumen <em>AI</em></span>
        </a>
        <button class="icon-btn desktop-collapse" aria-label="Collapse sidebar" data-testid="button-collapse-sidebar">${icons.collapse}</button>
        <button class="icon-btn mobile-close" aria-label="Close conversation menu" data-testid="button-close-drawer">${icons.close}</button>
      </div>
      <button class="new-chat" data-testid="button-new-chat" aria-label="Start a new chat">${icons.plus}<span class="button-label">New conversation</span></button>
      <label class="search-wrap" aria-label="Search conversations">
        <span class="search-icon">${icons.search}</span>
        <input class="search-input" id="search-input" type="search" placeholder="Search conversations" autocomplete="off" data-testid="input-search-conversations" />
      </label>
      <section class="sidebar-section">
        <div class="section-heading"><span>Recent thinking</span><span id="chat-count">05</span></div>
        <div class="chat-list" id="chat-list"></div>
      </section>
      <div class="sidebar-footer">
        <button class="profile-button" id="profile-button" aria-expanded="false" data-testid="button-profile">
          <span class="avatar">AK</span><span class="profile-copy"><span class="profile-name">Alex Kim</span><span class="profile-status">Local workspace</span></span><span class="profile-menu-chevron">⋯</span>
        </button>
      </div>
      <div class="profile-menu" id="profile-menu" aria-label="Profile menu">
        <button data-action="profile-settings">${icons.settings} Workspace settings</button>
        <button data-action="profile-theme">${icons.moon} Switch appearance</button>
      </div>
    </aside>
    <div class="mobile-scrim" id="mobile-scrim"></div>
    <main class="workspace">
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn mobile-menu" id="mobile-menu" aria-label="Open conversation menu" data-testid="button-open-drawer">${icons.menu}</button>
          <span class="crumb">Workspace</span><span class="crumb-separator">/</span><span class="crumb-current" id="crumb-current">New conversation</span>
        </div>
        <div class="topbar-right">
          <div class="local-badge" title="This demo is running without a backend"><span class="status-dot"></span><span class="status-label">Local model ready</span><span>·</span><span>Ollama</span></div>
          <button class="icon-btn" id="theme-button" aria-label="Toggle light and dark theme" data-testid="button-theme">${icons.moon}</button>
          <button class="icon-btn" id="settings-button" aria-label="Open settings" data-testid="button-settings">${icons.settings}</button>
        </div>
      </header>
      <section class="conversation" aria-label="Chat conversation">
        <div class="message-scroll" id="message-scroll"><div class="message-column" id="message-column"></div></div>
        <div class="composer-area">
          <form class="composer-shell" id="composer-form">
            <textarea class="composer-input" id="composer-input" rows="1" placeholder="Ask Lumen anything..." aria-label="Message Lumen" data-testid="input-message"></textarea>
            <div class="composer-tools">
              <button type="button" class="composer-tool" aria-label="Attach a file (demo)" data-action="attach" data-testid="button-attach">${icons.plus}</button>
              <button type="submit" class="send-button" aria-label="Send message" id="send-button" data-testid="button-send">${icons.send}</button>
            </div>
          </form>
          <p class="composer-note">Runs privately on your machine · Lumen can make mistakes</p>
        </div>
      </section>
    </main>
    <aside class="settings-panel" id="settings-panel" aria-label="Settings panel">
      <div class="settings-head"><h2>Workspace</h2><button class="icon-btn" id="settings-close" aria-label="Close settings">${icons.close}</button></div>
      <div class="settings-row"><div>Appearance<small>Choose how Lumen looks</small></div><button class="toggle" id="theme-toggle" aria-label="Toggle appearance"><span></span></button></div>
      <div class="settings-row"><div>Model<small>Ollama · llama3.1:8b</small></div><span class="local-badge">ready</span></div>
      <div class="settings-row"><div>Privacy<small>Messages stay on this device</small></div><span class="status-dot"></span></div>
    </aside>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  </div>
`;

const sidebar = document.querySelector('#sidebar');
const chatList = document.querySelector('#chat-list');
const messageColumn = document.querySelector('#message-column');
const messageScroll = document.querySelector('#message-scroll');
const composer = document.querySelector('#composer-input');
const sendButton = document.querySelector('#send-button');
const searchInput = document.querySelector('#search-input');
const crumb = document.querySelector('#crumb-current');
const toast = document.querySelector('#toast');

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function visibleChats() {
  const query = state.query.trim().toLowerCase();
  return conversations.filter((chat) => !query || `${chat.title} ${chat.kind}`.toLowerCase().includes(query));
}

function renderChats() {
  const chats = visibleChats();
  document.querySelector('#chat-count').textContent = String(chats.length).padStart(2, '0');
  chatList.innerHTML = chats.length ? chats.map((chat) => `
    <div class="chat-item ${chat.id === state.activeId ? 'active' : ''}" data-chat-id="${chat.id}" tabindex="0" role="button" aria-label="Open ${escapeHTML(chat.title)}" data-testid="chat-item-${chat.id}">
      <div class="chat-item-copy"><span class="chat-title">${escapeHTML(chat.title)}</span><span class="chat-meta">${chat.date} · ${chat.time}</span></div>
      <button class="icon-btn chat-delete" aria-label="Delete ${escapeHTML(chat.title)}" data-delete-id="${chat.id}" data-testid="button-delete-chat-${chat.id}">${icons.trash}</button>
    </div>
  `).join('') : '<p class="empty-search">No conversations match that search.</p>';
}

async function loadConversations() {
  try {
    const response = await fetch('/api/conversations');

    if (!response.ok) {
      throw new Error('Could not load conversations.');
    }

    const data = await response.json();

    data.forEach((chat) => {
      const chatId = String(chat.id);

      const alreadyExists = conversations.some(
        (item) => item.id === chatId
      );

      if (!alreadyExists) {
        const createdAt = new Date(chat.created_at);

        conversations.unshift({
          id: chatId,
          title: chat.title,
          date: createdAt.toLocaleDateString(),
          time: createdAt.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          kind: 'Database'
        });
      }
    });

    renderChats();

  } catch (error) {
    console.error('Conversation loading failed:', error);
  }
}

function codeBlock() {
  const raw = `from pathlib import Path
import ollama

def embed_notes(folder: str):
    for path in Path(folder).glob("**/*.md"):
        chunks = split_into_chunks(path.read_text())
        vectors = [ollama.embed(model="nomic-embed-text", input=c)
                   for c in chunks]
        save_vectors(path, chunks, vectors)`;
  const highlighted = escapeHTML(raw)
    .replace(/(from|import|def|for|in|return)/g, '<span class="token-keyword">$1</span>')
    .replace(/(&quot;.*?&quot;)/g, '<span class="token-string">$1</span>');
  return `<div class="code-block"><div class="code-top"><span>python</span><button class="code-copy" data-code="${encodeURIComponent(raw)}" aria-label="Copy code">${icons.copy}<span>Copy</span></button></div><pre><code>${highlighted}</code></pre></div>`;
}

function formatAIResponse(text) {
  let html = escapeHTML(text);

  // Code blocks
  html = html.replace(
    /```(\w+)?\n?([\s\S]*?)```/g,
    '<pre class="ai-code"><code>$2</code></pre>'
  );

  // Headings
  html = html.replace(
    /^### (.+)$/gm,
    '<h4>$1</h4>'
  );

  html = html.replace(
    /^## (.+)$/gm,
    '<h3>$1</h3>'
  );

  html = html.replace(
    /^# (.+)$/gm,
    '<h2>$1</h2>'
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );

  // Italic
  html = html.replace(
    /\*(.*?)\*/g,
    '<em>$1</em>'
  );

  // Numbered list
  html = html.replace(
    /(?:^|\n)((?:\d+\.\s+.+(?:\n|$))+)/g,
    function(match, list) {
      const items = list
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(item => item.replace(/^\d+\.\s+/, '').trim());

      return '<ol>' +
        items.map(item => `<li>${item}</li>`).join('') +
        '</ol>';
    }
  );

  // Bullet list
  html = html.replace(
    /(?:^|\n)((?:[-•]\s+.+(?:\n|$))+)/g,
    function(match, list) {
      const items = list
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(item => item.replace(/^[-•]\s+/, '').trim());

      return '<ul>' +
        items.map(item => `<li>${item}</li>`).join('') +
        '</ul>';
    }
  );

  // Paragraphs
  html = html
    .split(/\n\s*\n/)
    .map(block => {
      const trimmed = block.trim();

      if (!trimmed) return '';

      if (
        trimmed.startsWith('<h2>') ||
        trimmed.startsWith('<h3>') ||
        trimmed.startsWith('<h4>') ||
        trimmed.startsWith('<ul>') ||
        trimmed.startsWith('<ol>') ||
        trimmed.startsWith('<pre>')
      ) {
        return trimmed;
      }

      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return html;
}


function messageMarkup(message, index) {
  const isUser = message.role === 'user';

  const text = isUser
    ? `<p>${escapeHTML(message.text)}</p>`
    : `${formatAIResponse(message.text)}${message.code ? codeBlock() : ''}`;

  return `<article class="message ${message.role}" data-message-index="${index}">
    <div class="message-avatar">${isUser ? 'AK' : 'L'}</div>

    <div class="message-body">
      <div class="message-name">${isUser ? 'You' : 'Lumen · local'}</div>

      <div class="message-text">${text}</div>

      ${!isUser ? `<div class="message-actions" aria-label="Message actions">
        <button data-action="copy-message" aria-label="Copy response">
          ${icons.copy}<span>Copy</span>
        </button>

        <button data-action="regenerate" aria-label="Regenerate response">
          ${icons.refresh}<span>Retry</span>
        </button>

        <button data-action="like" aria-label="Like response">
          ${icons.like}
        </button>

        <button data-action="dislike" aria-label="Dislike response">
          ${icons.dislike}
        </button>
      </div>` : ''}
    </div>
  </article>`;
}

function welcomeMarkup() {
  return `<div class="welcome">
    <div class="lumen-orb" aria-hidden="true"><span class="orb-cross"></span></div>
    <h1>A clear surface for<br>unclear problems.</h1>
    <p>Lumen is a quiet, local thinking partner for building, learning, and following a question all the way through.</p>
    <div class="suggestions">
      <button class="suggestion" data-suggestion="Explain a difficult concept with a useful analogy." data-testid="button-suggestion-analogy"><span class="suggestion-label">Learn something</span><strong>Explain a difficult concept simply</strong></button>
      <button class="suggestion" data-suggestion="Help me sketch a small project I can finish this weekend." data-testid="button-suggestion-project"><span class="suggestion-label">Make a plan</span><strong>Sketch a project worth finishing</strong></button>
      <button class="suggestion" data-suggestion="Review this approach and point out the trade-offs I might be missing." data-testid="button-suggestion-review"><span class="suggestion-label">Think together</span><strong>Review an approach and its trade-offs</strong></button>
      <button class="suggestion" data-suggestion="Write a small, readable example with comments and tests." data-testid="button-suggestion-code"><span class="suggestion-label">Work with code</span><strong>Write a small example I can understand</strong></button>
    </div>
  </div>`;
}

function renderMessages(scroll = false) {
  messageColumn.innerHTML = state.messages.length
    ? `<div class="messages">${state.messages.map(messageMarkup).join('')}</div>`
    : welcomeMarkup();
  if (scroll) window.requestAnimationFrame(() => { messageScroll.scrollTop = messageScroll.scrollHeight; });
}

async function setActiveChat(id) {
  state.activeId = id;
  state.messages = [];

  const chat = conversations.find((item) => item.id === id);
  crumb.textContent = chat ? chat.title : 'New conversation';

  renderChats();

  try {
    const response = await fetch(`/api/conversations/${id}`);

    if (!response.ok) {
      throw new Error('Could not load conversation.');
    }

    const data = await response.json();

    state.messages = data.map((message) => ({
      role: message.role,
      text: message.message
    }));

    renderMessages(true);
    closeMobileDrawer();

  } catch (error) {
    console.error('Conversation loading failed:', error);

    state.messages = [];
    renderMessages();

    showToast('Could not load conversation.');
  }
}

function newChat() {
  state.activeId = null;
  state.messages = [];
  crumb.textContent = 'New conversation';
  composer.value = '';
  resizeComposer();
  renderChats();
  renderMessages();
  showToast('New conversation ready');
  closeMobileDrawer();
}

async function deleteChat(id) {
  const index = conversations.findIndex((chat) => chat.id === id);

  if (index < 0) return;

  const [removed] = conversations.splice(index, 1);
  delete seededMessages[id];

  if (state.activeId === id) {
    newChat();
  }

  renderChats();

  try {
    const response = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Could not delete conversation.');
    }

    showToast(`Removed “${removed.title}”`);

  } catch (error) {
    console.error('Delete failed:', error);

    // API failed, so put the chat back
    conversations.splice(index, 0, removed);
    renderChats();

    showToast('Could not delete conversation.');
  }
}

function toggleTheme() {
  state.dark = !state.dark;
  document.body.classList.toggle('dark', state.dark);
  localStorage.setItem('lumen-theme', state.dark ? 'dark' : 'light');
  document.querySelector('#theme-button').innerHTML = state.dark ? icons.sun : icons.moon;
  document.querySelector('#theme-toggle').classList.toggle('is-on', state.dark);
  showToast(state.dark ? 'Dark appearance on' : 'Light appearance on');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function closeMobileDrawer() {
  state.mobileOpen = false;
  sidebar.classList.remove('is-mobile-open');
  document.querySelector('#mobile-scrim').classList.remove('is-visible');
}

function toggleSettings(force) {
  state.settingsOpen = typeof force === 'boolean' ? force : !state.settingsOpen;
  document.querySelector('#settings-panel').classList.toggle('is-open', state.settingsOpen);
}

function resizeComposer() {
  composer.style.height = 'auto';
  composer.style.height = `${Math.min(composer.scrollHeight, 130)}px`;
  sendButton.disabled = !composer.value.trim();
}

async function requestAssistant(prompt, onChunk) {
  const response = await fetch(API_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      message: prompt,
      conversation_id: state.activeId,
      history: state.messages.slice(0, -1),
    }),
  });

  if (!response.ok) {
    throw new Error('The local model could not respond.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let fullText = '';
  let conversationId = null;

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;

      const data = JSON.parse(line);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.response) {
        fullText += data.response;

        if (onChunk) {
          onChunk(fullText);
        }
      }

      if (data.conversation_id) {
        conversationId = data.conversation_id;
      }
    }
  }

  return {
    text: fullText,
    conversation_id: conversationId
  };
}

async function sendMessage() {
  const prompt = composer.value.trim();

  if (!prompt) return;

  state.messages.push({
    role: 'user',
    text: prompt
  });

  composer.value = '';
  resizeComposer();
  renderMessages(true);

  const typing = document.createElement('article');
  typing.className = 'message assistant';

  typing.innerHTML = `
    <div class="message-avatar">L</div>
    <div class="message-body">
      <div class="message-name">Lumen · local</div>
      <div class="typing" aria-label="Lumen is thinking">
        <i></i><i></i><i></i>
      </div>
    </div>
  `;

  messageColumn.querySelector('.messages').appendChild(typing);
  messageScroll.scrollTop = messageScroll.scrollHeight;

  try {
    let fullText = '';

    const result = await requestAssistant(prompt, (chunk) => {
      fullText = chunk;

      // Typing animation ko response se replace karo
      typing.innerHTML = `
        <div class="message-avatar">L</div>
        <div class="message-body">
          <div class="message-name">Lumen · local</div>
          <div class="message-text">
            <p>${escapeHTML(fullText)}</p>
          </div>
        </div>
      `;

      messageScroll.scrollTop = messageScroll.scrollHeight;
    });

    typing.remove();

    state.messages.push({
      role: 'assistant',
      text: result.text
    });

    if (!state.activeId) {
  const conversationId = result.conversation_id;

  if (!conversationId) {
    throw new Error('Conversation ID was not received from server.');
  }

  const generated = {
    id: String(conversationId),
    title: prompt.slice(0, 38) + (prompt.length > 38 ? '…' : ''),
    date: 'Today',
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    kind: 'Database'
  };

  conversations.unshift(generated);
  state.activeId = String(conversationId);

  seededMessages[generated.id] =
    state.messages.map((message) => ({ ...message }));

  crumb.textContent = generated.title;
  renderChats();

} else if (seededMessages[state.activeId]) {
  seededMessages[state.activeId] =
    state.messages.map((message) => ({ ...message }));
}

    // Final response ko Markdown formatting ke saath render karo
    renderMessages(true);

  } catch (error) {
    typing.remove();

    state.messages.push({
      role: 'assistant',
      text: 'I could not reach the local model just now. Check your Ollama connection, then try again.'
    });

    renderMessages(true);
    showToast(error.message);
  }
}

document.querySelector('#new-chat')?.addEventListener('click', newChat);
document.querySelector('[data-testid="button-new-chat"]').addEventListener('click', newChat);
document.querySelector('.desktop-collapse').addEventListener('click', () => {
  state.collapsed = !state.collapsed;
  sidebar.classList.toggle('is-collapsed', state.collapsed);
});
document.querySelector('#mobile-menu').addEventListener('click', () => {
  state.mobileOpen = true;
  sidebar.classList.add('is-mobile-open');
  document.querySelector('#mobile-scrim').classList.add('is-visible');
});
document.querySelector('#mobile-scrim').addEventListener('click', closeMobileDrawer);
document.querySelector('.mobile-close').addEventListener('click', closeMobileDrawer);
document.querySelector('#search-input').addEventListener('input', (event) => {
  state.query = event.target.value;
  renderChats();
});
chatList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('[data-delete-id]');
  if (deleteButton) { event.stopPropagation(); deleteChat(deleteButton.dataset.deleteId); return; }
  const item = event.target.closest('[data-chat-id]');
  if (item) setActiveChat(item.dataset.chatId);
});
chatList.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-chat-id]')) setActiveChat(event.target.closest('[data-chat-id]').dataset.chatId);
});
document.querySelector('#composer-form').addEventListener('submit', (event) => { event.preventDefault(); sendMessage(); });
composer.addEventListener('input', resizeComposer);
composer.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }
});
messageColumn.addEventListener('click', async (event) => {
  const suggestion = event.target.closest('[data-suggestion]');
  if (suggestion) { composer.value = suggestion.dataset.suggestion; resizeComposer(); composer.focus(); return; }
  const copyCode = event.target.closest('.code-copy');
  if (copyCode) { await navigator.clipboard?.writeText(decodeURIComponent(copyCode.dataset.code)); showToast('Code copied'); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const article = action.closest('.message');
  if (action.dataset.action === 'copy-message') {
    const text = article.querySelector('.message-text').innerText;
    await navigator.clipboard?.writeText(text); showToast('Response copied');
  } else if (action.dataset.action === 'regenerate') {
    showToast('Regenerating locally…');
    const lastUser = [...state.messages].reverse().find((message) => message.role === 'user');
    if (lastUser) { const result = await requestAssistant(lastUser.text); state.messages[state.messages.length - 1] = { role: 'assistant', text: result.text, code: result.code }; renderMessages(true); }
  } else if (action.dataset.action === 'like' || action.dataset.action === 'dislike') {
    article.querySelectorAll('[data-action="like"], [data-action="dislike"]').forEach((button) => button.classList.remove('is-active'));
    action.classList.add('is-active'); showToast(action.dataset.action === 'like' ? 'Helpful response' : 'Thanks for the signal');
  }
});
document.querySelector('#theme-button').addEventListener('click', toggleTheme);
document.querySelector('#theme-toggle').addEventListener('click', toggleTheme);
document.querySelector('#settings-button').addEventListener('click', () => toggleSettings());
document.querySelector('#settings-close').addEventListener('click', () => toggleSettings(false));
document.querySelector('#profile-button').addEventListener('click', () => {
  state.profileOpen = !state.profileOpen;
  document.querySelector('#profile-menu').classList.toggle('is-open', state.profileOpen);
  document.querySelector('#profile-button').setAttribute('aria-expanded', String(state.profileOpen));
});
document.querySelector('#profile-menu').addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'profile-theme') toggleTheme();
  if (action === 'profile-settings') toggleSettings(true);
  state.profileOpen = false;
  document.querySelector('#profile-menu').classList.remove('is-open');
});
document.querySelector('[data-action="attach"]').addEventListener('click', () => showToast('Attachments arrive with the local connector'));
document.querySelector('.brand').addEventListener('click', (event) => { event.preventDefault(); newChat(); });
document.body.classList.toggle('dark', state.dark);
document.querySelector('#theme-button').innerHTML = state.dark ? icons.sun : icons.moon;
document.querySelector('#theme-toggle').classList.toggle('is-on', state.dark);
renderChats();
renderMessages();
resizeComposer();
loadConversations();